const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  connectGithub,
  verifyGithubActivity,
  getUserIntegrations,
  disconnectIntegration
} = require('../controllers/integrationController');

// All routes are protected
router.use(protect);

// GitHub integration routes
router.post('/github/connect', connectGithub);
router.post('/github/verify', verifyGithubActivity);

// General integration routes
router.get('/', getUserIntegrations);
router.delete('/:platform', disconnectIntegration);

module.exports = router; 