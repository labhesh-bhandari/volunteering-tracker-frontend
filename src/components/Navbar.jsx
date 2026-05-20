import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🌸</div>
        <span className="navbar-name">Sadhana Tracker</span>
      </div>
      <div className="navbar-right">
        {user && (
          <span className="navbar-user">
            Namaste, <span>{user.name}</span> 🙏
          </span>
        )}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          <span className="theme-toggle-icon">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
