const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB Connection string
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Import models
const User = require('./models/userModel');
const Partnership = require('./models/partnershipModel');
const Task = require('./models/taskModel');

// API URL
const API_URL = 'http://localhost:5000/api';

// Function to get a valid token
const getToken = async () => {
  try {
    // Using a real user from the database
    const userResponse = await axios.post(`${API_URL}/users/login`, {
      email: 'prathameshjangle425@gmail.com',
      password: 'password123'
    });
    
    return userResponse.data.token;
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
    throw error;
  }
};

// Function to test creating a task
const testCreateTask = async (token, partnershipId, assigneeId) => {
  try {
    console.log('Testing task creation...');
    
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task for the API',
      deadline: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week from now
      assignee: assigneeId,
      partnership: partnershipId,
      recurringType: 'none',
      priority: 'medium',
      tags: ['test', 'api']
    };
    
    const response = await axios.post(
      `${API_URL}/tasks`,
      taskData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Task created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw error;
  }
};

// Function to test getting tasks for a partnership
const testGetPartnershipTasks = async (token, partnershipId) => {
  try {
    console.log(`Testing getting tasks for partnership ${partnershipId}...`);
    
    const response = await axios.get(
      `${API_URL}/tasks/partnership/${partnershipId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Tasks retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting partnership tasks:', error.response?.data || error.message);
    throw error;
  }
};

// Function to test getting assigned tasks
const testGetAssignedTasks = async (token) => {
  try {
    console.log('Testing getting assigned tasks...');
    
    const response = await axios.get(
      `${API_URL}/tasks/assigned`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Assigned tasks retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting assigned tasks:', error.response?.data || error.message);
    throw error;
  }
};

// Function to test getting created tasks
const testGetCreatedTasks = async (token) => {
  try {
    console.log('Testing getting created tasks...');
    
    const response = await axios.get(
      `${API_URL}/tasks/created`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Created tasks retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting created tasks:', error.response?.data || error.message);
    throw error;
  }
};

// Function to test marking a task as complete
const testCompleteTask = async (token, taskId) => {
  try {
    console.log(`Testing completing task ${taskId}...`);
    
    const response = await axios.put(
      `${API_URL}/tasks/${taskId}/complete`,
      { completionNotes: 'Completed during testing' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Task marked as complete:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error completing task:', error.response?.data || error.message);
    throw error;
  }
};

// Function to test verifying a task
const testVerifyTask = async (token, taskId) => {
  try {
    console.log(`Testing verifying task ${taskId}...`);
    
    const response = await axios.put(
      `${API_URL}/tasks/${taskId}/verify`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Task verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying task:', error.response?.data || error.message);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  let token;
  let partnershipId;
  let assigneeId;
  let taskId;
  
  try {
    // Get a partnership to test with
    const partnerships = await Partnership.find({ status: 'accepted' })
      .populate('requester')
      .populate('recipient')
      .limit(1);
    
    if (partnerships.length === 0) {
      console.error('No accepted partnerships found for testing');
      process.exit(1);
    }
    
    const partnership = partnerships[0];
    partnershipId = partnership._id;
    
    // Login to get token for requester
    const requester = await User.findById(partnership.requester);
    token = await getToken();
    
    // Use recipient as assignee
    assigneeId = partnership.recipient._id;
    
    console.log(`Using partnership: ${partnershipId}`);
    console.log(`Requester: ${requester.name}`);
    console.log(`Assignee: ${partnership.recipient.name}`);
    
    // Create a test task
    const task = await testCreateTask(token, partnershipId, assigneeId);
    taskId = task._id;
    
    // Get tasks for partnership
    await testGetPartnershipTasks(token, partnershipId);
    
    // Get assigned and created tasks
    await testGetAssignedTasks(token);
    await testGetCreatedTasks(token);
    
    // Complete the task as assignee (swapping token)
    const assigneeEmail = partnership.recipient.email;
    const assigneeLogin = await axios.post(`${API_URL}/users/login`, {
      email: assigneeEmail,
      password: 'password123' // Assuming this is the test password
    });
    const assigneeToken = assigneeLogin.data.token;
    
    await testCompleteTask(assigneeToken, taskId);
    
    // Verify the task as requester
    await testVerifyTask(token, taskId);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up - remove test task if it was created
    if (taskId) {
      try {
        await Task.findByIdAndDelete(taskId);
        console.log(`Test task ${taskId} removed`);
      } catch (err) {
        console.error('Error removing test task:', err);
      }
    }
    
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the tests
runTests(); 