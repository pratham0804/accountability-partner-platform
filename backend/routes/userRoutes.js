const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getInterestCategories,
  checkAdminStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Register and Login routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Interest categories route
router.get('/interests', getInterestCategories);

// Admin check route
router.get('/check-admin', protect, checkAdminStatus);

module.exports = router; 