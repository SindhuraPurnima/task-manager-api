import React,{ useState} from 'react'
import {useNavigate} from 'react-router-dom'

const Register:React.FC =()=>{
    const[username, setUsername]=useState<string>('')
    const[password,setPassword]=useState<string>('')
    const[confirmPassword,setConfirmPassword]=useState<string>('')
    
    const navigate=useNavigate();

    const handleSubmit=async(event:React.FormEvent)=>{
        event.preventDefault()
        console.log('Attempting to register with:', { username, password });

        if (password !== confirmPassword) {
          console.error("Passwords do not match");
          return; 
        }

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Registration response:', await response.clone().json());

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
        }
    };
        return (
            <div style={styles.container}>
              <h2>Register</h2>
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
                <div style={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <button type="submit" style={styles.button}>
                  Register
                </button>
              </form>
            </div>
          );
        };

        interface Styles {
            container: React.CSSProperties;
            form: React.CSSProperties;
            formGroup: React.CSSProperties;
            input: React.CSSProperties;
            button: React.CSSProperties;
          }
        
        // Basic styles for the register form
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
      
        };

export default Register