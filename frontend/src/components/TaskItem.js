import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CheckCircleOutline as CompleteIcon,
  VerifiedUser as VerifyIcon,
  Cancel as FailIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const TaskItem = ({ task, onComplete, onVerify, onFail, onDelete, isCreator }) => {
  // Get status color for chip
  const getStatusColor = () => {
    switch (task.status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'verified':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get priority color for chip
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getFormattedDeadline = () => {
    return 'Today at 11:59 PM';
  };

  // Get current user ID
  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
  
  // Task can be completed by the assignee (self)
  const isCompletable = (task.status === 'pending' || task.status === 'in_progress') && 
                        task.assignee?._id === currentUserId;
  
  // Task can be verified by the partner (not self)
  const isVerifiable = task.status === 'completed' && task.creator?._id === currentUserId && 
                      task.creator?._id !== task.assignee?._id;
  
  // Task can be failed by the partner
  const canBeFailed = (task.status === 'pending' || task.status === 'in_progress') && 
                      task.creator?._id === currentUserId && task.creator?._id !== task.assignee?._id;
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete(task._id);
    }
  };

  const handleVerify = () => {
    if (onVerify) {
      onVerify(task._id);
    }
  };

  const handleFail = () => {
    if (onFail) {
      onFail(task._id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task._id);
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status.replace('_', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2,
          mb: 2, 
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 6,
            borderLeft: `4px solid ${task.status === 'failed' ? '#f44336' : 
              task.status === 'verified' ? '#4caf50' : 
              task.status === 'completed' ? '#2196f3' : '#ff9800'}`,
          }
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                {task.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip 
                  size="small" 
                  color={getStatusColor()} 
                  label={formatStatus(task.status)}
                  sx={{ fontWeight: 500 }}
                />
                <Chip 
                  size="small" 
                  color={getPriorityColor()} 
                  label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                {task.recurringType !== 'none' && (
                  <Chip 
                    size="small" 
                    color="secondary" 
                    label={task.recurringType.charAt(0).toUpperCase() + task.recurringType.slice(1)} 
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
              
              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {task.description}
                </Typography>
              )}
              
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Deadline:
                      </Box> {getFormattedDeadline()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Partner:
                      </Box> {task.creator?._id !== task.assignee?._id 
                        ? task.creator?.name 
                        : task.partnership?.requester?._id === task.creator?._id 
                          ? task.partnership?.recipient?.name 
                          : task.partnership?.requester?.name}
                    </Typography>
                  </Box>
                </Grid>
                
                {task.completedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Completed:
                      </Box> {new Date(task.completedAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                
                {task.verifiedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Verified:
                      </Box> {new Date(task.verifiedAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'column' }, 
              gap: 1,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              height: '100%',
              alignItems: { xs: 'center', md: 'flex-end' },
              flexWrap: 'wrap'
            }}>
              <Button
                component={Link}
                to={`/tasks/${task._id}`}
                variant="outlined"
                color="primary"
                size="small"
                endIcon={<ArrowIcon />}
                sx={{ borderRadius: 2 }}
              >
                View Details
              </Button>
              
              {isCompletable && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  startIcon={<CompleteIcon />}
                  onClick={handleComplete}
                  sx={{ borderRadius: 2 }}
                >
                  Mark Complete
                </Button>
              )}
              
              {isVerifiable && (
                <Button 
                  variant="contained" 
                  color="success" 
                  size="small"
                  startIcon={<VerifyIcon />}
                  onClick={handleVerify}
                  sx={{ borderRadius: 2 }}
                >
                  Verify
                </Button>
              )}
              
              {canBeFailed && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<FailIcon />}
                  onClick={handleFail}
                  sx={{ borderRadius: 2 }}
                >
                  Mark Failed
                </Button>
              )}
              
              {isCreator && (
                <Tooltip title="Delete Task">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={handleDelete}
                    sx={{ 
                      border: '1px solid rgba(0,0,0,0.12)', 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'error.lighter' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default TaskItem; 