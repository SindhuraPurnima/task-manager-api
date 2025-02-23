import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'

const Login: React.FC<{ setAuthToken: (token: string) => void }> = ({ setAuthToken }) => {
  // State to store the username and password
  const [username, setUsername] = useState<string>('') //Intially empty
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const navigate=useNavigate()
  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevents the page from refreshing
    //console.log('Username:', username);
   // console.log('Password:', password);
   console.log(JSON.stringify({ username, password }))
   try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),})
        if (!response.ok) {
         const text = await response.text(); // Convert ReadableStream to string
         console.log(text); // Print the string

        throw new Error('Login failed');
     
      }

      const data = await response.json();
      setAuthToken(data.token); // This will now store the token in localStorage
      navigate('/'); // Redirect to home or another page on successful login
    } catch (error:any) {
      setError(error.message); // Set error message to display
      console.error('Error during login:', error);

      }}


  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <p>
        Don't have an account?{''}
        <button onClick={()=> navigate('/register')} style={styles.register}>
        Register
        </button>
      </p>
    </div>
  )
  }

// Define types for the styles
interface Styles {
    container: React.CSSProperties;
    form: React.CSSProperties;
    formGroup: React.CSSProperties;
    input: React.CSSProperties;
    button: React.CSSProperties;
    register:React.CSSProperties;
  }
  

// Basic styles for the login form
const styles:Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  register: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default Login