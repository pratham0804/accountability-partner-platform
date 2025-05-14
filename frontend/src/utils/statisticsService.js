import axios from 'axios';

const API_URL = 'http://localhost:5000/api/statistics';

// Get user statistics
const getUserStatistics = async () => {
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  if (!userInfo) {
    throw new Error('User not authenticated');
  }
  
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  };
  
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Refresh user statistics
const refreshStatistics = async () => {
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  if (!userInfo) {
    throw new Error('User not authenticated');
  }
  
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  };
  
  const response = await axios.put(`${API_URL}/refresh`, {}, config);
  return response.data;
};

// Get platform statistics (admin only)
const getPlatformStatistics = async () => {
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  if (!userInfo) {
    throw new Error('User not authenticated');
  }
  
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  };
  
  const response = await axios.get(`${API_URL}/platform`, config);
  return response.data;
};

const statisticsService = {
  getUserStatistics,
  refreshStatistics,
  getPlatformStatistics
};

export default statisticsService; 