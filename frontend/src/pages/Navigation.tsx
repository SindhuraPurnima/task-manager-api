import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  authToken: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ authToken, onLogout }) => {
  return (
    <nav style={styles.navbar}>
      <h2>Task Manager</h2>
      <div>
        {!authToken ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        ) : (
          <button onClick={onLogout} style={styles.button}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

// Basic styles
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  link: {
    marginLeft: '1rem',
    textDecoration: 'none',
    color: '#007bff',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar
