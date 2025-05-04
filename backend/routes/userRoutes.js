const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getInterestCategories,
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

module.exports = router; 