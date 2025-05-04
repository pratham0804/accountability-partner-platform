const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Register and Login routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Profile routes
router.get('/profile', protect, getUserProfile);

module.exports = router; 