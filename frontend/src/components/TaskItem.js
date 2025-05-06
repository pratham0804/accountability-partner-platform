import React from 'react';
import { Link } from 'react-router-dom';

const TaskItem = ({ task, onComplete, onVerify, onFail, onDelete, isCreator }) => {
  const getStatusClass = () => {
    switch (task.status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'verified':
        return 'status-verified';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const getPriorityClass = () => {
    switch (task.priority) {
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

  return (
    <div className={`task-item ${getStatusClass()}`}>
      <div className="task-info">
        <h3>{task.title}</h3>
        <div className="task-meta">
          <span className={`task-priority ${getPriorityClass()}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className={`task-status ${getStatusClass()}`}>
            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
          </span>
          {task.recurringType !== 'none' && (
            <span className="task-recurring">
              {task.recurringType.charAt(0).toUpperCase() + task.recurringType.slice(1)}
            </span>
          )}
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <div className="task-details">
          <p>
            <strong>Deadline:</strong> {getFormattedDeadline()}
          </p>
          <p>
            <strong>Accountability Partner:</strong> {task.creator?._id !== task.assignee?._id ? task.creator?.name : task.partnership?.requester?._id === task.creator?._id ? task.partnership?.recipient?.name : task.partnership?.requester?.name}
          </p>
          {task.completedAt && (
            <p>
              <strong>Completed:</strong> {new Date(task.completedAt).toLocaleDateString()}
            </p>
          )}
          {task.verifiedAt && (
            <p>
              <strong>Verified:</strong> {new Date(task.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="task-actions">
        <Link to={`/tasks/${task._id}`} className="btn btn-small">
          View Details
        </Link>
        
        {isCompletable && (
          <button 
            className="btn btn-primary btn-small" 
            onClick={handleComplete}
          >
            Mark Complete
          </button>
        )}
        
        {isVerifiable && (
          <button 
            className="btn btn-success btn-small" 
            onClick={handleVerify}
          >
            Verify Completion
          </button>
        )}
        
        {canBeFailed && (
          <button 
            className="btn btn-danger btn-small" 
            onClick={handleFail}
          >
            Mark Failed
          </button>
        )}
        
        {isCreator && (
          <button 
            className="btn btn-danger btn-small" 
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem; 