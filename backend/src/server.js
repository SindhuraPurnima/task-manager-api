require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express') //Import express framework
const pool = require('./database.js') // Import the pool
const jwt = require('jsonwebtoken') // For generating JWTs
const bcrypt = require('bcryptjs')
const cors = require('cors')
const taskRouter = require('./routeTasks')
const path = require('path');

const server = express() //Intialize the express app
const PORT = process.env.PORT || 3000;

// Serve static files from the React frontend app
server.use(express.static(path.join(__dirname, '../../frontend/build')));

// Add this debug line
console.log('Environment variables in server.js:', {
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,
    // Don't log the password
});

// Middleware to parse JSON requests
server.use(cors());
server.use(express.json());
server.use('/tasks', taskRouter);

// Add this before your routes
server.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

server.get('/', (req, res) => {
    res.send('Task Manager API is running!');
  });


  //register
  server.post('/api/auth/register', async(req,res) => {
    console.log("Registration attempt for username:", req.body.username);
    const {username, password} = req.body

    //username and password are not empty
    if(!username || !password) {
      return res.status(400).json({error:'Please enter username and password'})
    }
   
    try {
      // First check if the table exists
      console.log('Checking if users table exists...');
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      console.log('Table exists:', tableCheck.rows[0].exists);

      console.log('Checking if user exists...');
      const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      console.log('Users found:', userExists.rows.length);

      if (userExists.rows.length > 0) {
          return res.status(400).json({error : 'User already exists'})
      }

      // Hash the password
      console.log('Hashing password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt)
      
      console.log('Inserting new user...');
      // Inserting the new user into the database
      const newUser = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [username, hashedPassword]
      );

      console.log('User created successfully');
      // Respond with the new user (excluding the password)
      const { password: _, ...user } = newUser.rows[0];
      res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (err) {
      console.error('Detailed registration error:', err);
      // Send more detailed error information
      res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message,
        detail: err.detail,
        code: err.code 
      });
    }
  })

  //login
  server.post('/api/auth/login',async(req,res) =>{
    console.log("hello")
    const { username, password} = req.body
     
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
      }

      try{
        const user = await pool.query('SELECT * FROM users WHERE username=$1',[username])
      if( user.rows.length == 0)
      {
        return res.status(400).json({ error: 'Invalid username or password' })
      }
    
     // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' })
    }

    // Generate a JWT
    const token = jwt.sign(
      { userId: user.rows[0].id }, // Payload (data to include in the token)
      process.env.JWT_SECRET,     // Secret key (from .env)
      { expiresIn: '1h' }         // Token expiration time
    );
    res.status(200).json({ message: 'Login successful', token })
}
catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' })
  }
})

  // Test database connection
server.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            success: true, 
            time: result.rows[0].now,
            message: 'Database connection successful' 
        });
    } catch (err) {
        console.error('Database connection test failed:', err);
        res.status(500).json({ 
            success: false,
            error: err.message,
            detail: err.detail 
        });
    }
});

// Handles any requests that don't match the ones above
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

server.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`)
});

