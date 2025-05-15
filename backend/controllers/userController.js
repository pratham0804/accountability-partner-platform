const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Temporary hardcoded JWT secret
const JWT_SECRET = "Nl+tE4qw2IWfgYiC.TsKHCLlCiziOCXTZZLVEiQ==.iqaKTsr6IE2MkuD20OqZKA==";

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      interests: user.interests,
      skills: user.skills,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      interests: user.interests,
      skills: user.skills,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      interests: user.interests,
      skills: user.skills,
      availableTimes: user.availableTimes,
      activityLevel: user.activityLevel,
      preferredPartnerType: user.preferredPartnerType,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.interests = req.body.interests || user.interests;
    user.skills = req.body.skills || user.skills;
    user.availableTimes = req.body.availableTimes || user.availableTimes;
    user.activityLevel = req.body.activityLevel || user.activityLevel;
    user.preferredPartnerType = req.body.preferredPartnerType || user.preferredPartnerType;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      interests: updatedUser.interests,
      skills: updatedUser.skills,
      availableTimes: updatedUser.availableTimes,
      activityLevel: updatedUser.activityLevel,
      preferredPartnerType: updatedUser.preferredPartnerType,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get interest categories
// @route   GET /api/users/interests
// @access  Public
const getInterestCategories = asyncHandler(async (req, res) => {
  const interestCategories = [
    {
      name: 'Fitness',
      interests: ['Running', 'Weight Training', 'Yoga', 'Swimming', 'Cycling', 'Hiking', 'Martial Arts']
    },
    {
      name: 'Learning',
      interests: ['Programming', 'Foreign Languages', 'Data Science', 'Art', 'History', 'Mathematics', 'Science']
    },
    {
      name: 'Creative',
      interests: ['Writing', 'Drawing', 'Photography', 'Music', 'Painting', 'Sculpting', 'Digital Art']
    },
    {
      name: 'Professional',
      interests: ['Networking', 'Public Speaking', 'Leadership', 'Project Management', 'Marketing', 'Entrepreneurship']
    },
    {
      name: 'Wellness',
      interests: ['Meditation', 'Journaling', 'Reading', 'Healthy Eating', 'Sleep Improvement', 'Stress Management']
    },
    {
      name: 'Productivity',
      interests: ['Time Management', 'Goal Setting', 'Habit Building', 'Focus Improvement', 'Organization']
    }
  ];

  res.json(interestCategories);
});

// @desc    Check if user is admin
// @route   GET /api/users/check-admin
// @access  Private
const checkAdminStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.json({
    isAdmin: user.isAdmin,
    message: user.isAdmin ? 'User has admin privileges' : 'User does not have admin privileges'
  });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getInterestCategories,
  checkAdminStatus,
}; 