const express = require('express');
const router = express.Router();
const { getPotentialMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

// Match routes
router.get('/', protect, getPotentialMatches);

module.exports = router; 