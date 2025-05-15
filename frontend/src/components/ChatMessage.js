import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Collapse,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const ChatMessage = ({ message, isOwnMessage, partnerInfo }) => {
  const [showDetails, setShowDetails] = useState(false);
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Check if message was filtered
  const isFiltered = message.isFiltered;
  
  // Get explanation text based on filter reason
  const getFilterExplanation = (reason) => {
    switch(reason) {
      case 'personal_info':
        return 'Your message contained personal information (email, phone, etc.) which was automatically removed for safety.';
      case 'inappropriate':
        return 'Your message contained inappropriate language which was automatically filtered.';
      case 'external_contact':
        return 'External contact attempts or links were removed for platform safety.';
      default:
        return 'Content was filtered according to platform guidelines.';
    }
  };
  
  // Get warning level based on filter reason
  const getWarningColor = (reason) => {
    switch(reason) {
      case 'personal_info':
        return 'error';
      case 'inappropriate':
        return 'error.light';
      case 'external_contact':
        return 'warning.main';
      default:
        return 'info.main';
    }
  };
  
  // Get penalty amount information based on filter reason
  const getPenaltyInfo = (reason) => {
    switch(reason) {
      case 'personal_info':
        return 'Sharing personal information carries a $5.00 penalty.';
      case 'inappropriate':
        return 'Using inappropriate language carries a $3.00 penalty.';
      case 'external_contact':
        return 'Attempting external contact carries a $2.00 penalty.';
      default:
        return 'Content violations may result in financial penalties.';
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      {!isOwnMessage && partnerInfo && (
        <Avatar
          src={partnerInfo.avatar}
          alt={partnerInfo.name}
          sx={{ 
            width: 32, 
            height: 32, 
            mr: 1,
            mt: 0.5,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          {partnerInfo.name ? partnerInfo.name.charAt(0).toUpperCase() : '?'}
        </Avatar>
      )}
      
      <Box sx={{ maxWidth: '70%' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: 2,
              backgroundColor: isOwnMessage 
                ? 'primary.light' 
                : 'background.paper',
              color: isOwnMessage 
                ? 'primary.contrastText' 
                : 'text.primary',
              borderBottomRightRadius: isOwnMessage ? 0 : 2,
              borderBottomLeftRadius: isOwnMessage ? 2 : 0,
              ...(isFiltered && {
                backgroundColor: isOwnMessage 
                  ? 'error.lighter' 
                  : 'grey.100'
              })
            }}
          >
            {!isOwnMessage && (
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  color: isOwnMessage ? 'inherit' : 'primary.main',
                  mb: 0.5
                }}
              >
                {message.sender.name}
              </Typography>
            )}
            
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {message.content}
            </Typography>
            
            {isFiltered && (
              <Box sx={{ mt: 1.5 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: getWarningColor(message.filterReason),
                    color: 'white',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.75,
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Content was filtered
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: 'white', 
                      p: 0,
                      transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Collapse in={showDetails}>
                  <Box 
                    sx={{ 
                      bgcolor: 'background.paper', 
                      p: 1.5, 
                      borderRadius: 1, 
                      mt: 0.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {getFilterExplanation(message.filterReason)}
                    </Typography>
                    
                    {isOwnMessage && (
                      <>
                        <Box 
                          sx={{ 
                            bgcolor: 'warning.lighter', 
                            color: 'warning.darker',
                            p: 1, 
                            borderRadius: 1, 
                            mb: 1,
                            fontWeight: 'medium'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getPenaltyInfo(message.filterReason)}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            fontStyle: 'italic',
                            color: 'error.main'
                          }}
                        >
                          Repeated violations will result in penalties to your wallet balance.
                          This helps maintain a safe environment for all users.
                        </Typography>
                      </>
                    )}
                  </Box>
                </Collapse>
              </Box>
            )}
            
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'right', 
                mt: 0.5,
                color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary'
              }}
            >
              {formattedTime}
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ChatMessage; 