import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TaskForm = ({ partnershipId, partner, onTaskCreated, taskToEdit }) => {
  // Set end of today (11:59:59 PM) as the deadline
  const getEndOfDay = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  };

  const initialFormState = {
    title: '',
    description: '',
    deadline: getEndOfDay(), // Set to end of current day
    recurringType: 'none',
    priority: 'medium',
    tags: '',
    assigneeType: 'self' // Default to self-assignment
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info on component mount
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (userInfo) {
      setCurrentUser(userInfo);
    }
  }, []);

  // If editing, populate form with task data
  useEffect(() => {
    if (taskToEdit && currentUser) {
      const assigneeType = taskToEdit.assignee === currentUser._id ? 'self' : 'partner';
      
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        deadline: getEndOfDay(), // Always set to end of current day
        recurringType: taskToEdit.recurringType || 'none',
        priority: taskToEdit.priority || 'medium',
        tags: taskToEdit.tags ? taskToEdit.tags.join(', ') : '',
        assigneeType: assigneeType
      });
    }
  }, [taskToEdit, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      setLoading(true);
      
      // Get user token
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      // Determine assignee based on selection
      const assigneeId = formData.assigneeType === 'self' ? userInfo._id : partner?._id;

      if (!assigneeId) {
        toast.error('Invalid assignee selection');
        setLoading(false);
        return;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        deadline: getEndOfDay(), // Always ensure end of current day
        recurringType: formData.recurringType,
        priority: formData.priority,
        tags: tagsArray,
        assignee: assigneeId,
        partnership: partnershipId
      };

      let response;
      
      if (taskToEdit) {
        // Update existing task
        response = await axios.put(
          `http://localhost:5000/api/tasks/${taskToEdit._id}`,
          taskData,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Task updated successfully');
      } else {
        // Create new task
        response = await axios.post(
          'http://localhost:5000/api/tasks',
          taskData,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Task created successfully');
      }

      // Reset form after successful submission if not editing
      if (!taskToEdit) {
        setFormData(initialFormState);
      }
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(response.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  return (
    <div className="task-form card">
      <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <div className="deadline-info">
            <strong>Today at 11:59 PM</strong> (Tasks must be completed before the day ends)
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurringType">Recurring</label>
            <select
              id="recurringType"
              name="recurringType"
              value={formData.recurringType}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., workout, study, important"
          />
        </div>

        <div className="form-group">
          <label htmlFor="assigneeType">Assign To</label>
          <select
            id="assigneeType"
            name="assigneeType"
            value={formData.assigneeType}
            onChange={handleChange}
          >
            <option value="self">Myself (I will complete this task)</option>
            {partner && (
              <option value="partner">{partner.name} (They will complete this task)</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : taskToEdit ? 'Update Task' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm; 