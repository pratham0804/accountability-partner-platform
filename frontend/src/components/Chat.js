import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  RefreshRounded as RefreshIcon,
  SentimentSatisfiedAlt as EmojiIcon
} from '@mui/icons-material';
import ChatMessage from './ChatMessage';
import './Chat.css';

const Chat = ({ partnershipId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch messages on initial load
  useEffect(() => {
    fetchMessages();
    fetchPartnershipDetails();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [partnershipId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPartnershipDetails = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) return;

      const response = await axios.get(
        `http://localhost:5000/api/partnerships/${partnershipId}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      const partnership = response.data;
      const userId = userInfo._id;
      
      // Determine who the partner is based on requester/recipient
      const partner = partnership.requester._id === userId 
        ? partnership.recipient 
        : partnership.requester;
      
      setPartnerInfo(partner);
    } catch (error) {
      console.error('Error fetching partnership details:', error);
      setError('Could not load partnership details');
    }
  };

  const fetchMessages = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/messages/partnership/${partnershipId}?limit=100`,
        { 
          headers: { 
            Authorization: `Bearer ${userInfo.token}`
          } 
        }
      );

      // Sort messages by creation date
      const sortedMessages = response.data.messages.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      setMessages(sortedMessages);
      setLoading(false);
      setError(null); // Clear any previous errors

      // Mark unread messages as read
      const unreadMessages = sortedMessages.filter(
        msg => !msg.isRead && msg.sender._id !== userInfo._id
      );
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg._id));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Check if it's a 404 (no messages yet) or other error
      if (error.response?.status === 404) {
        // This is fine - just no messages yet
        setMessages([]);
        setLoading(false);
      } else {
        setError('Failed to load messages. Please try refreshing the page.');
        setLoading(false);
      }
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) return;

      await axios.put(
        'http://localhost:5000/api/messages/read',
        { messageIds },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Non-critical error, don't show to user
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/messages',
        {
          partnershipId,
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Add the new message to the state
      setMessages(prevMessages => [...prevMessages, response.data]);
      
      // Clear the input field after sending
      setNewMessage('');
      
      // Scroll to the bottom of the chat
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="300px"
        className="loading-chat-mui"
      >
        <CircularProgress size={24} color="primary" sx={{ mr: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading messages...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="chat-error-mui" p={4} textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />} 
          onClick={fetchMessages}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  const userInfo = JSON.parse(localStorage.getItem('user'));

  return (
    <Box className="chat-container-mui">
      {partnerInfo && (
        <Box className="chat-header-info-mui" px={3} py={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              src={partnerInfo.avatar} 
              alt={partnerInfo.name}
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'primary.main' 
              }}
            >
              {partnerInfo.name ? partnerInfo.name.charAt(0).toUpperCase() : '?'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                {partnerInfo.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {partnerInfo.isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      <Divider />
      
      <Box 
        className="messages-container-mui"
        ref={chatContainerRef}
        p={2}
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="no-messages-mui"
            >
              <Paper elevation={0} sx={{ 
                p: 3, 
                bgcolor: 'background.paper', 
                maxWidth: 320,
                mx: 'auto',
                borderRadius: 2
              }}>
                <Typography align="center" color="text.secondary" sx={{ mb: 1 }}>
                  No messages yet
                </Typography>
                <Typography align="center" variant="body2" color="text.secondary">
                  Start the conversation with your accountability partner!
                </Typography>
              </Paper>
            </motion.div>
          ) : (
            <Box>
              {messages.map((message, index) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.2,
                    delay: index > messages.length - 3 ? 0.05 : 0 // Only animate recent messages 
                  }}
                >
                  <ChatMessage
                    message={message}
                    isOwnMessage={message.sender._id === userInfo._id}
                    partnerInfo={!(message.sender._id === userInfo._id) ? partnerInfo : null}
                  />
                </motion.div>
              ))}
            </Box>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSend} 
        className="message-form-mui"
        px={2}
        py={1.5}
      >
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          size="small"
          disabled={sending}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  color="primary"
                  disabled={sending || !newMessage.trim()}
                  type="submit"
                  sx={{ 
                    transform: 'scale(1)', 
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' } 
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <IconButton color="default" size="small">
                  <EmojiIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '24px',
              '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.1)' },
              pr: 0.5
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Chat; 