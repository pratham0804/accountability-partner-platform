import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Badge, 
  IconButton, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Task as TaskIcon,
  Assignment as AssignmentIcon,
  Handshake as HandshakeIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Warning as WarningIcon,
  Payments as PaymentsIcon,
  Campaign as CampaignIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import './NotificationBell.css';

const NotificationBell = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markOneAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!dropdownOpen) {
      // If we're opening the dropdown, refresh notifications first
      fetchNotifications();
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markOneAsRead(notification._id);
    }
    
    // Navigate to the linked page if there is one
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Close dropdown
    setDropdownOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_reminder':
      case 'task_completed':
        return <TaskIcon className="notification-icon-mui" color="primary" />;
      case 'proof_submitted':
      case 'proof_verified':
      case 'proof_rejected':
        return <AssignmentIcon className="notification-icon-mui" color="info" />;
      case 'partnership_request':
      case 'partnership_accepted':
      case 'partnership_declined':
        return <HandshakeIcon className="notification-icon-mui" color="success" />;
      case 'agreement_created':
      case 'agreement_completed':
        return <DescriptionIcon className="notification-icon-mui" color="secondary" />;
      case 'chat_message':
        return <ChatIcon className="notification-icon-mui" style={{ color: '#9c27b0' }} />;
      case 'moderation_warning':
        return <WarningIcon className="notification-icon-mui" color="warning" />;
      case 'escrow_deposit':
      case 'escrow_withdrawal':
      case 'escrow_reward':
      case 'escrow_penalty':
        return <PaymentsIcon className="notification-icon-mui" style={{ color: '#2e7d32' }} />;
      case 'system_message':
        return <CampaignIcon className="notification-icon-mui" color="default" />;
      default:
        return <NotificationsIcon className="notification-icon-mui" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today, show the time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 25 
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <IconButton 
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label="Show notifications"
        size="large"
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          overlap="circular"
          max={99}
        >
          <NotificationsIcon className="bell-icon-mui" />
        </Badge>
      </IconButton>
      
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className="notification-dropdown-wrapper"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
          >
            <Paper 
              elevation={4} 
              className="notification-dropdown-mui"
            >
              <Box className="notification-header-mui">
                <Typography variant="h6" component="h3">
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Button 
                    startIcon={<DoneAllIcon />}
                    onClick={() => markAllAsRead()} 
                    size="small"
                    color="primary"
                  >
                    Mark all as read
                  </Button>
                )}
              </Box>
              
              <Divider />
              
              {loading ? (
                <Box className="notification-loading-mui">
                  <CircularProgress size={24} color="inherit" />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                    Loading notifications...
                  </Typography>
                </Box>
              ) : notifications.length === 0 ? (
                <Box className="no-notifications-mui">
                  <Typography variant="body2" color="textSecondary">
                    You have no notifications
                  </Typography>
                </Box>
              ) : (
                <List className="notification-list-mui" disablePadding>
                  {notifications.slice(0, 5).map(notification => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ListItem 
                        className={`notification-item-mui ${!notification.isRead ? 'unread-mui' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                        button
                        divider
                        dense
                      >
                        <ListItemIcon className="notification-item-icon-mui">
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" component="span" className="notification-title-mui">
                                {notification.title}
                              </Typography>
                              {!notification.isRead && (
                                <Chip 
                                  label="New" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  className="notification-badge-new"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span" className="notification-message-mui">
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" component="div" className="notification-time-mui">
                                {formatTime(notification.createdAt)}
                              </Typography>
                            </>
                          }
                          className="notification-content-mui"
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              )}
              
              <Divider />
              
              <Box className="notification-footer-mui">
                <Button
                  component={Link}
                  to="/notifications"
                  onClick={() => setDropdownOpen(false)}
                  color="primary"
                  fullWidth
                >
                  View all notifications
                </Button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 