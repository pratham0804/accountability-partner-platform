import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Container, 
  Typography, 
  Box, 
  Tab, 
  Tabs, 
  Button, 
  Paper, 
  CircularProgress, 
  Divider,
  Alert,
  Badge
} from '@mui/material';
import {
  AddTask as AddTaskIcon,
  Assignment as AssignmentIcon,
  Create as CreateIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import TaskList from '../components/TaskList';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const MyTasks = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assigned');
  const [userId, setUserId] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    setUserId(userInfo._id);

    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Fetch tasks assigned to the user
        const assignedResponse = await axios.get(
          'http://localhost:5000/api/tasks/assigned',
          config
        );
        
        setAssignedTasks(assignedResponse.data);

        // Fetch tasks created by the user
        const createdResponse = await axios.get(
          'http://localhost:5000/api/tasks/created',
          config
        );
        
        setCreatedTasks(createdResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load tasks'
        );
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleCompleteTask = async (taskId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/complete`,
        { completionNotes: 'Completed by user' },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update the assigned tasks list with the updated task
      setAssignedTasks(assignedTasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      
      toast.success('Task marked as completed');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.response?.data?.message || 'Failed to complete task');
    }
  };

  const handleVerifyTask = async (taskId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update the created tasks list with the updated task
      setCreatedTasks(createdTasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      
      toast.success('Task verified successfully');
    } catch (error) {
      console.error('Error verifying task:', error);
      toast.error(error.response?.data?.message || 'Failed to verify task');
    }
  };

  const handleFailTask = async (taskId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/fail`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update the created tasks list with the updated task
      setCreatedTasks(createdTasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      
      toast.info('Task marked as failed');
    } catch (error) {
      console.error('Error failing task:', error);
      toast.error(error.response?.data?.message || 'Failed to mark task as failed');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      await axios.delete(
        `http://localhost:5000/api/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Remove the deleted task from the created tasks list
      setCreatedTasks(createdTasks.filter(task => task._id !== taskId));
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="70vh"
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading tasks...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            display: 'flex', 
            alignItems: 'center'
          }}
        >
          <ErrorIcon sx={{ mr: 1 }} />
          <Typography variant="body1">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  // Count tasks that need verification (completed tasks)
  const verificationNeededCount = createdTasks.filter(
    task => task.status === 'completed'
  ).length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2, 
              background: 'linear-gradient(to right, #f5f7fa, #e4e7eb)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' }
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                My Tasks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all your tasks and commitments
              </Typography>
            </Box>
            
            <Button
              component={Link}
              to="/partnerships"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddTaskIcon />}
              sx={{ 
                mt: { xs: 2, md: 0 },
                borderRadius: 2,
                py: 1.2,
                px: 3
              }}
            >
              Create New Task
            </Button>
          </Paper>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  borderRadius: '8px 8px 0 0',
                  py: 2
                },
                '& .Mui-selected': {
                  fontWeight: 600
                }
              }}
            >
              <Tab 
                value="assigned" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    <span>Assigned to Me ({assignedTasks.length})</span>
                  </Box>
                } 
              />
              <Tab 
                value="created" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge 
                      badgeContent={verificationNeededCount} 
                      color="error"
                      sx={{ mr: 1 }}
                    >
                      <CreateIcon />
                    </Badge>
                    <span>Created by Me ({createdTasks.length})</span>
                  </Box>
                } 
              />
            </Tabs>
          </Box>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          {activeTab === 'assigned' ? (
            assignedTasks.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  border: '1px dashed rgba(0, 0, 0, 0.12)'
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  You don't have any tasks assigned to you
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Tasks assigned to you by your partners will appear here
                </Typography>
                <Button
                  component={Link}
                  to="/partnerships"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddTaskIcon />}
                >
                  Find Partnerships
                </Button>
              </Paper>
            ) : (
              <TaskList 
                tasks={assignedTasks}
                onComplete={handleCompleteTask}
                userId={userId}
              />
            )
          ) : (
            createdTasks.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  border: '1px dashed rgba(0, 0, 0, 0.12)'
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  You haven't created any tasks yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Go to a partnership to create tasks for your accountability partner
                </Typography>
                <Button
                  component={Link}
                  to="/partnerships"
                  variant="contained"
                  color="primary"
                  startIcon={<AddTaskIcon />}
                >
                  Go to Partnerships
                </Button>
              </Paper>
            ) : (
              <TaskList 
                tasks={createdTasks}
                onVerify={handleVerifyTask}
                onFail={handleFailTask}
                onDelete={handleDeleteTask}
                userId={userId}
              />
            )
          )}
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default MyTasks; 