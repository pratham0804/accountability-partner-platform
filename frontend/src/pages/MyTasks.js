import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TaskList from '../components/TaskList';

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

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h1>My Tasks</h1>
      </div>

      <div className="tasks-tabs">
        <button 
          className={`tab-button ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned to Me ({assignedTasks.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created by Me ({createdTasks.length})
        </button>
      </div>

      <div className="tasks-container">
        {activeTab === 'assigned' ? (
          assignedTasks.length === 0 ? (
            <div className="no-tasks card">
              <p>You don't have any tasks assigned to you.</p>
              <p>Tasks assigned to you by your partners will appear here.</p>
            </div>
          ) : (
            <TaskList 
              tasks={assignedTasks}
              onComplete={handleCompleteTask}
              userId={userId}
            />
          )
        ) : (
          createdTasks.length === 0 ? (
            <div className="no-tasks card">
              <p>You haven't created any tasks yet.</p>
              <p>Go to a partnership to create tasks for your accountability partner.</p>
              <Link to="/partnerships" className="btn btn-primary">
                Go to Partnerships
              </Link>
            </div>
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
      </div>
    </div>
  );
};

export default MyTasks; 