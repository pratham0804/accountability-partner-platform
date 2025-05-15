import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
  Chip,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Badge
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
  DoneAll as DoneAllIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MarkunreadMailbox as MarkReadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
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
  const navigate = useNavigate();

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (event, page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkAsRead = (id) => {
    markOneAsRead(id);
  };

  const handleDelete = (id) => {
    deleteNotification(id);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markOneAsRead(notification._id);
    }
    
    // Navigate to the linked page if there is one
    if (notification.link) {
      navigate(notification.link);
    }
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

  const getNotificationPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
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
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.05, duration: 0.3 }
    }),
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
  };

  if (loading && notifications.length === 0) {
    return (
      <Container className="notifications-page-mui">
        <Box my={4} textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Notifications
          </Typography>
          <CircularProgress />
          <Typography variant="body1" color="textSecondary" mt={2}>
            Loading your notifications...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="notifications-page-mui">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Notifications
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => fetchNotifications()}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="notifications-page-mui">
      <Box mb={4} mt={2}>
        <Box className="notifications-header-mui" mb={4}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={markAllAsRead}
            disabled={!notifications.some(note => !note.isRead)}
          >
            Mark all as read
          </Button>
        </Box>
        
        <Paper elevation={2} sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="notification categories"
          >
            <Tab value="all" label="All" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab 
              value="unread" 
              label={
                <Box display="flex" alignItems="center">
                  Unread
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <Badge color="error" badgeContent={notifications.filter(n => !n.isRead).length} sx={{ ml: 1 }} />
                  )}
                </Box>
              } 
            />
            <Tab value="tasks" label="Tasks" icon={<TaskIcon />} iconPosition="start" />
            <Tab value="partnerships" label="Partnerships" icon={<HandshakeIcon />} iconPosition="start" />
            <Tab value="chat" label="Chat" icon={<ChatIcon />} iconPosition="start" />
            <Tab value="moderation" label="Moderation" icon={<WarningIcon />} iconPosition="start" />
            <Tab value="escrow" label="Escrow" icon={<PaymentsIcon />} iconPosition="start" />
            <Tab value="system" label="System" icon={<CampaignIcon />} iconPosition="start" />
          </Tabs>
        </Paper>
        
        {filteredNotifications.length === 0 ? (
          <Box className="empty-state-mui" textAlign="center" py={8}>
            <Typography variant="body1" color="textSecondary">
              No notifications in this category
            </Typography>
          </Box>
        ) : (
          <>
            <Box className="notifications-list-mui">
              <AnimatePresence mode="popLayout">
                {paginatedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id} 
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <Card 
                      className={`notification-card-mui ${!notification.isRead ? 'unread-mui' : ''}`}
                      elevation={!notification.isRead ? 2 : 1}
                      sx={{ 
                        mb: 2, 
                        borderLeft: '4px solid',
                        borderColor: theme => 
                          notification.priority ? 
                            theme.palette[getNotificationPriorityColor(notification.priority)].main : 
                            (!notification.isRead ? theme.palette.primary.main : 'transparent')
                      }}
                    >
                      <CardContent sx={{ pb: 1, pt: 2 }}>
                        <Box 
                          className="notification-main-mui"
                          sx={{ display: 'flex', cursor: 'pointer' }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <Box className="notification-icon-wrapper-mui" mr={2}>
                            {getNotificationIcon(notification.type)}
                          </Box>
                          <Box className="notification-content-mui" flex={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="subtitle1" component="h3" className="notification-title-mui">
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
                            <Typography variant="body2" className="notification-message-mui" paragraph>
                              {notification.message}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="textSecondary">
                                {formatTime(notification.createdAt)}
                              </Typography>
                              <Chip 
                                label={notification.type.replace(/_/g, ' ')} 
                                size="small" 
                                variant="outlined"
                                color={notification.type.includes('warning') ? 'warning' : 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Box 
                          className="notification-actions-mui" 
                          display="flex" 
                          justifyContent="flex-end"
                          width="100%"
                          gap={1}
                        >
                          {notification.link && (
                            <Button
                              component={Link}
                              to={notification.link}
                              startIcon={<VisibilityIcon />}
                              size="small"
                              color="success"
                              variant="outlined"
                            >
                              View
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              startIcon={<MarkReadIcon />}
                              size="small"
                              color="primary"
                              variant="outlined"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            startIcon={<DeleteIcon />}
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleDelete(notification._id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardActions>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>
            
            {totalPages > 1 && (
              <Box className="pagination-mui" display="flex" justifyContent="center" my={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default NotificationsPage; 