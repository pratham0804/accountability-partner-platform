import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TaskIcon from '@mui/icons-material/Task';
import ChatIcon from '@mui/icons-material/Chat';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Remove user from local storage
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <motion.div 
          className="logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <span className="logo-text-primary">Accountability</span>
            <span className="logo-text-secondary">Partner</span>
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-button" onClick={toggleMenu}>
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </div>

        {/* Navigation Menu */}
        <nav className={`navigation ${isMenuOpen ? 'open' : ''}`}>
          {user ? (
            <ul className="nav-links">
              <li className={isActive('/dashboard')}>
                <Link to="/dashboard" className="nav-link">
                  <DashboardIcon className="nav-icon" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className={isActive('/matches')}>
                <Link to="/matches" className="nav-link">
                  <PeopleIcon className="nav-icon" />
                  <span>Find Partners</span>
                </Link>
              </li>
              <li className={isActive('/partnerships')}>
                <Link to="/partnerships" className="nav-link">
                  <HandshakeIcon className="nav-icon" />
                  <span>Partnerships</span>
                </Link>
              </li>
              <li className={isActive('/my-tasks')}>
                <Link to="/my-tasks" className="nav-link">
                  <TaskIcon className="nav-icon" />
                  <span>My Tasks</span>
                </Link>
              </li>
              <li className={isActive('/chats')}>
                <Link to="/chats" className="nav-link">
                  <ChatIcon className="nav-icon" />
                  <span>Chats</span>
                </Link>
              </li>
              <li className={isActive('/proof-verification')}>
                <Link to="/proof-verification" className="nav-link">
                  <VerifiedUserIcon className="nav-icon" />
                  <span>Verify Proofs</span>
                </Link>
              </li>
              <li className={isActive('/wallet')}>
                <Link to="/wallet" className="nav-link">
                  <AccountBalanceWalletIcon className="nav-icon" />
                  <span>Wallet</span>
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="nav-links">
              <li className={isActive('/login')}>
                <Link to="/login" className="nav-link">
                  <PersonIcon className="nav-icon" />
                  <span>Login</span>
                </Link>
              </li>
              <li className={isActive('/register')}>
                <Link to="/register" className="nav-link register-link">
                  <span>Register</span>
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* User Actions */}
        {user && (
          <div className="user-actions">
            <div className="notification-bell-wrapper">
              <NotificationBell />
            </div>
            
            <div className="user-menu-container">
              <motion.div 
                className="user-avatar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={`${user.name}'s profile`} 
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </motion.div>
              
              <div className="user-dropdown">
                <ul>
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      <PersonIcon className="dropdown-icon" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  {user.isAdmin && (
                    <li>
                      <Link to="/moderation-dashboard" className="dropdown-item">
                        <AdminPanelSettingsIcon className="dropdown-icon" />
                        <span>Moderation</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item logout-button" onClick={handleLogout}>
                      <LogoutIcon className="dropdown-icon" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 