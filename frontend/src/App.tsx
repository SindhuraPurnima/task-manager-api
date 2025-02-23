import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Navigation from './pages/Navigation';

const App: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const navigate = useNavigate();

  // Function to handle login
  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    navigate('/login');
  };

  return (
    <div>
      <Navigation authToken={authToken} onLogout={handleLogout} />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={authToken ? <Navigate to="/" /> : <Login setAuthToken={handleLogin} />} />
        <Route path="/register" element={authToken ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={authToken ? <Tasks authToken={authToken} /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
