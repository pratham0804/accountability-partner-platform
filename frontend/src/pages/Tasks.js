import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [partnership, setPartnership] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [userId, setUserId] = useState('');
  
  const { partnershipId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    setUserId(userInfo._id);

    const fetchPartnershipAndTasks = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Fetch partnership details
        const partnershipResponse = await axios.get(
          `http://localhost:5000/api/partnerships/${partnershipId}`, 
          config
        );
        
        setPartnership(partnershipResponse.data);
        
        // Determine who is the partner
        if (partnershipResponse.data.requester._id === userInfo._id) {
          setPartner(partnershipResponse.data.recipient);
        } else {
          setPartner(partnershipResponse.data.requester);
        }

        // Fetch tasks for this partnership
        const tasksResponse = await axios.get(
          `http://localhost:5000/api/tasks/partnership/${partnershipId}`,
          config
        );
        
        setTasks(tasksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load tasks'
        );
        setLoading(false);
      }
    };

    fetchPartnershipAndTasks();
  }, [partnershipId, navigate]);

  const handleCompleteTask = async (taskId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/complete`,
        { completionNotes: 'Completed by user' },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      // Update the tasks list with the updated task
      setTasks(tasks.map(task => 
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
      
      // Update the tasks list with the updated task
      setTasks(tasks.map(task => 
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
      
      // Update the tasks list with the updated task
      setTasks(tasks.map(task => 
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
      
      // Remove the deleted task from the tasks list
      setTasks(tasks.filter(task => task._id !== taskId));
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  if (loading) {
    return <div className="loading">Loading partnership tasks...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!partnership) {
    return <div className="not-found">Partnership not found</div>;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-content">
          <h1>Tasks with {partner?.name}</h1>
          <span className={`status-badge status-${partnership.status}`}>
            {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
          </span>
        </div>
        <div className="header-actions">
          <Link to={`/partnerships/${partnershipId}`} className="btn btn-reverse">
            Back to Partnership
          </Link>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowTaskForm(!showTaskForm)}
          >
            {showTaskForm ? 'Cancel' : 'Create Task'}
          </button>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm 
          partnershipId={partnershipId}
          partner={partner}
          onTaskCreated={handleTaskCreated}
        />
      )}

      <div className="tasks-container">
        <h2>Task List</h2>
        {tasks.length === 0 ? (
          <div className="no-tasks card">
            <p>No tasks have been created for this partnership yet.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowTaskForm(true)}
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <TaskList 
            tasks={tasks}
            onComplete={handleCompleteTask}
            onVerify={handleVerifyTask}
            onFail={handleFailTask}
            onDelete={handleDeleteTask}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks; 