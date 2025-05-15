import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Divider,
  Alert,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onComplete, onVerify, onFail, onDelete, userId }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    
    // Filter by priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by selected criteria
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder = { pending: 0, in_progress: 1, completed: 2, verified: 3, failed: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #f7f9fc, #edf2f7)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Task Filters
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Search Tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ 
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: 'white', borderRadius: 2 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: 'white', borderRadius: 2 }}>
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                id="priority-select"
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: 'white', borderRadius: 2 }}>
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 2 }}
                IconComponent={SortIcon}
              >
                <MenuItem value="deadline">Deadline (soonest first)</MenuItem>
                <MenuItem value="priority">Priority (highest first)</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="createdAt">Recently Created</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
        </Typography>
        {filteredTasks.length > 0 && (
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Sorted by:
            </Box>
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>
              {sortBy === 'deadline'
                ? 'Deadline'
                : sortBy === 'priority'
                ? 'Priority'
                : sortBy === 'status'
                ? 'Status'
                : 'Recent'}
            </Box>
          </Typography>
        )}
      </Box>
      
      <AnimatePresence>
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2, 
                mt: 2,
                '& .MuiAlert-message': { 
                  width: '100%',
                  textAlign: 'center'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                No tasks found matching your filters
              </Typography>
              {searchQuery && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Try modifying your search query or filter criteria
                </Typography>
              )}
            </Alert>
          </motion.div>
        ) : (
          <Box component="div" className="tasks-container">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <TaskItem 
                  task={task} 
                  onComplete={onComplete}
                  onVerify={onVerify}
                  onFail={onFail}
                  onDelete={onDelete}
                  isCreator={task.creator?._id === userId}
                />
              </motion.div>
            ))}
          </Box>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskList; 