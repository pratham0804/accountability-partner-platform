import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
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
        return '📋';
      case 'proof_submitted':
      case 'proof_verified':
      case 'proof_rejected':
        return '📝';
      case 'partnership_request':
      case 'partnership_accepted':
      case 'partnership_declined':
        return '🤝';
      case 'agreement_created':
      case 'agreement_completed':
        return '📜';
      case 'chat_message':
        return '💬';
      case 'moderation_warning':
        return '⚠️';
      case 'escrow_deposit':
      case 'escrow_withdrawal':
      case 'escrow_reward':
      case 'escrow_penalty':
        return '💰';
      case 'system_message':
        return '🔔';
      default:
        return '📣';
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={toggleDropdown}>
        <i className="bell-icon">🔔</i>
        {unreadCount > 0 && (
          <span className="unread-count">{unreadCount}</span>
        )}
      </div>
      
      {dropdownOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllAsRead()} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="notification-loading">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">No notifications</div>
          ) : (
            <div className="notification-list">
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="notification-footer">
            <Link to="/notifications" onClick={() => setDropdownOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 