import React, { useState } from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onComplete, onVerify, onFail, onDelete, userId }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
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
    <div className="task-list">
      <div className="task-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priority:</label>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="deadline">Deadline (soonest first)</option>
            <option value="priority">Priority (highest first)</option>
            <option value="status">Status</option>
            <option value="createdAt">Recently Created</option>
          </select>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="tasks-container">
          {filteredTasks.map(task => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onComplete={onComplete}
              onVerify={onVerify}
              onFail={onFail}
              onDelete={onDelete}
              isCreator={task.creator?._id === userId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList; 