import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const TaskDetail = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  const { taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        
        if (!userInfo) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/tasks/${taskId}`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        
        setTask(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task details:', error);
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load task details'
        );
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, navigate]);

  const isCreator = task?.creator?._id === JSON.parse(localStorage.getItem('user'))?._id;
  const isAssignee = task?.assignee?._id === JSON.parse(localStorage.getItem('user'))?._id;
  
  const isCompletable = (task?.status === 'pending' || task?.status === 'in_progress') && isAssignee;
  const isVerifiable = task?.status === 'completed' && isCreator && !isAssignee;
  const canBeFailed = (task?.status === 'pending' || task?.status === 'in_progress') && isCreator && !isAssignee;

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/complete`,
        { completionNotes },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setTask(response.data);
      setShowCompletionForm(false);
      setCompletionNotes('');
      
      toast.success('Task marked as completed');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.response?.data?.message || 'Failed to complete task');
    }
  };

  const handleVerifyTask = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setTask(response.data);
      toast.success('Task verified successfully');
    } catch (error) {
      console.error('Error verifying task:', error);
      toast.error(error.response?.data?.message || 'Failed to verify task');
    }
  };

  const handleFailTask = async () => {
    if (!window.confirm('Are you sure you want to mark this task as failed?')) {
      return;
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/fail`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setTask(response.data);
      toast.info('Task marked as failed');
    } catch (error) {
      console.error('Error failing task:', error);
      toast.error(error.response?.data?.message || 'Failed to mark task as failed');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      await axios.delete(
        `http://localhost:5000/api/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      toast.success('Task deleted successfully');
      navigate(`/partnerships/${task.partnership._id}/tasks`);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const getStatusClass = () => {
    if (!task) return '';
    
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
    if (!task) return '';
    
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

  if (loading) {
    return <div className="loading">Loading task details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!task) {
    return <div className="not-found">Task not found</div>;
  }

  return (
    <div className="task-detail-page">
      <div className="task-detail-header">
        <div className="back-link">
          <Link to={`/partnerships/${task.partnership._id}/tasks`}>
            ← Back to Tasks
          </Link>
        </div>
        <h1>{task.title}</h1>
        <div className="task-meta">
          <span className={`task-priority ${getPriorityClass()}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <span className={`task-status ${getStatusClass()}`}>
            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
          </span>
        </div>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-card card">
          <div className="task-info">
            <div className="info-group">
              <h3>Details</h3>
              <div className="info-item">
                <label>Created By:</label>
                <span>{task.creator?.name}</span>
              </div>
              <div className="info-item">
                <label>Accountability Partner:</label>
                <span>
                  {task.partnership?.requester?._id === task.creator?._id 
                    ? task.partnership?.recipient?.name 
                    : task.partnership?.requester?.name}
                </span>
              </div>
              <div className="info-item">
                <label>Deadline:</label>
                <span className="deadline">
                  Today at 11:59 PM
                </span>
              </div>
              {task.recurringType !== 'none' && (
                <div className="info-item">
                  <label>Recurring:</label>
                  <span>{task.recurringType.charAt(0).toUpperCase() + task.recurringType.slice(1)}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="info-item">
                  <label>Completed:</label>
                  <span>{format(new Date(task.completedAt), 'PPP')}</span>
                </div>
              )}
              {task.verifiedAt && (
                <div className="info-item">
                  <label>Verified:</label>
                  <span>{format(new Date(task.verifiedAt), 'PPP')}</span>
                </div>
              )}
              <div className="info-item">
                <label>Created:</label>
                <span>{format(new Date(task.createdAt), 'PPP')}</span>
              </div>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="task-tags">
                <h3>Tags</h3>
                <div className="tags-container">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="task-description-section">
            <h3>Description</h3>
            <div className="task-description">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="empty-description">No description provided.</p>
              )}
            </div>
          </div>

          {task.completionNotes && (
            <div className="task-completion-notes">
              <h3>Completion Notes</h3>
              <p>{task.completionNotes}</p>
            </div>
          )}

          <div className="task-actions">
            {isCompletable && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowCompletionForm(true)}
              >
                Mark Complete
              </button>
            )}
            
            {isVerifiable && (
              <button 
                className="btn btn-success" 
                onClick={handleVerifyTask}
              >
                Verify Completion
              </button>
            )}
            
            {canBeFailed && (
              <button 
                className="btn btn-warning" 
                onClick={handleFailTask}
              >
                Mark as Failed
              </button>
            )}
            
            {isCreator && (
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteTask}
              >
                Delete Task
              </button>
            )}
          </div>
        </div>

        {showCompletionForm && (
          <div className="completion-form card">
            <h2>Complete Task</h2>
            <form onSubmit={handleCompleteTask}>
              <div className="form-group">
                <label htmlFor="completionNotes">Completion Notes</label>
                <textarea
                  id="completionNotes"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about how you completed the task..."
                  rows={4}
                />
              </div>
              <div className="form-buttons">
                <button type="button" className="btn btn-reverse" onClick={() => setShowCompletionForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail; 