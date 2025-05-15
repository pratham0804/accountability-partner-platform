import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import Chat from '../components/Chat';
import './ChatPage.css';

const ChatPage = () => {
  const { partnershipId } = useParams();
  const navigate = useNavigate();
  const [partnership, setPartnership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnership = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          toast.error('You need to be logged in');
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/partnerships/${partnershipId}`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        setPartnership(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching partnership:', error);
        toast.error('Failed to load partnership details');
        navigate('/partnerships');
      }
    };

    fetchPartnership();
  }, [partnershipId, navigate]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="70vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading conversation...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="chat-page-mui">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={2} 
          className="chat-header-mui" 
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 2,
            background: 'linear-gradient(to right, #f7f9fc, #edf2f7)'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" component="h2" fontWeight="600" color="text.primary">
                Chat with Partner
              </Typography>
              <Box display="flex" alignItems="center" mt={1} gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Partnership:
                </Typography>
                <Chip 
                  label={partnershipId} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>
            </Box>
            
            {partnership && partnership.status && (
              <Chip 
                label={partnership.status.toUpperCase()}
                color={
                  partnership.status === 'active' ? 'success' : 
                  partnership.status === 'pending' ? 'warning' : 'default'
                }
                size="small"
              />
            )}
          </Box>
        </Paper>
        
        <Paper elevation={3} className="chat-wrapper-mui" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Chat partnershipId={partnershipId} />
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ChatPage; 