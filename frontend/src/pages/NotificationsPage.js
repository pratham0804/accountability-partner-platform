import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markOneAsRead, 
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifications(1, 100); // Fetch a larger batch for client-side filtering
  }, [fetchNotifications]);

  // Filter notifications based on active tab
  useEffect(() => {
    if (!notifications) return;
    
    let filtered = [...notifications];
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(note => !note.isRead);
    } else if (activeTab !== 'all') {
      // Filter by category
      switch (activeTab) {
        case 'tasks':
          filtered = filtered.filter(note => 
            ['task_reminder', 'task_completed', 'proof_submitted', 'proof_verified', 'proof_rejected'].includes(note.type)
          );
          break;
        case 'partnerships':
          filtered = filtered.filter(note => 
            ['partnership_request', 'partnership_accepted', 'partnership_declined', 'agreement_created', 'agreement_completed'].includes(note.type)
          );
          break;
        case 'chat':
          filtered = filtered.filter(note => note.type === 'chat_message');
          break;
        case 'moderation':
          filtered = filtered.filter(note => note.type === 'moderation_warning');
          break;
        case 'escrow':
          filtered = filtered.filter(note => 
            ['escrow_deposit', 'escrow_withdrawal', 'escrow_reward', 'escrow_penalty'].includes(note.type)
          );
          break;
        case 'system':
          filtered = filtered.filter(note => note.type === 'system_message');
          break;
        default:
          break;
      }
    }
    
    setFilteredNotifications(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activeTab, notifications]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleMarkAsRead = (id) => {
    markOneAsRead(id);
  };

  const handleDelete = (id) => {
    deleteNotification(id);
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

  const getNotificationPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <h1>Notifications</h1>
        <div className="notifications-loading">Loading your notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <h1>Notifications</h1>
        <div className="notifications-error">
          <p>{error}</p>
          <button onClick={() => fetchNotifications()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        
        <div className="notifications-actions">
          <button 
            className="mark-all-read-btn"
            onClick={markAllAsRead}
            disabled={!notifications.some(note => !note.isRead)}
          >
            Mark all as read
          </button>
        </div>
      </div>
      
      <div className="notifications-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All
        </button>
        <button 
          className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => handleTabChange('unread')}
        >
          Unread
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => handleTabChange('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'partnerships' ? 'active' : ''}`}
          onClick={() => handleTabChange('partnerships')}
        >
          Partnerships
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          Chat
        </button>
        <button 
          className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => handleTabChange('moderation')}
        >
          Moderation
        </button>
        <button 
          className={`tab-btn ${activeTab === 'escrow' ? 'active' : ''}`}
          onClick={() => handleTabChange('escrow')}
        >
          Escrow
        </button>
        <button 
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => handleTabChange('system')}
        >
          System
        </button>
      </div>
      
      {filteredNotifications.length === 0 ? (
        <div className="no-notifications-message">
          No notifications in this category
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {paginatedNotifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-card ${!notification.isRead ? 'unread' : ''} ${getNotificationPriorityClass(notification.priority)}`}
              >
                <div className="notification-main">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <span className="notification-type">
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="notification-actions">
                  {notification.link && (
                    <Link to={notification.link} className="view-btn">
                      View
                    </Link>
                  )}
                  {!notification.isRead && (
                    <button 
                      className="read-btn"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(notification._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage; 