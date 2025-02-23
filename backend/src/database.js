const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const {Pool} = require('pg')

// Add this to debug
console.log('Current working directory:', process.cwd());
console.log('.env path:', path.join(__dirname, '../.env'));
console.log('Environment variables loaded:', process.env.DB_USER ? 'Yes' : 'No');
console.log('Database connection details:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const pool = new Pool({
    user: process.env.DB_USER,       
  host: process.env.DB_HOST,   
  database: process.env.DB_NAME,   
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT,
})

// Test the connection
pool.query('SELECT NOW()')
  .then((res) => {
    console.log('Database connection successful:', res.rows[0]);
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

module.exports=pool
