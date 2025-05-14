import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Fetch all notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/notifications?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  // Fetch just the unread count (more efficient than fetching all notifications)
  const fetchUnreadCount = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) return;
      
      const response = await axios.get(
        'http://localhost:5000/api/notifications/unread/count',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) return;
      
      await axios.put(
        'http://localhost:5000/api/notifications/read',
        { notificationIds },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notificationIds.includes(notification._id)
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      
      // Fetch the updated unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setError('Failed to update notifications');
    }
  };

  // Mark a single notification as read
  const markOneAsRead = async (notificationId) => {
    await markAsRead([notificationId]);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) return;
      
      await axios.put(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date()
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to update notifications');
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) return;
      
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
      
      // If we just deleted an unread notification, update the count
      const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
      if (wasUnread) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  };

  // Set the refresh interval for polling
  const setPollingInterval = (milliseconds) => {
    setRefreshInterval(milliseconds);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markOneAsRead,
    markAllAsRead,
    deleteNotification,
    setPollingInterval
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 