const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  submitProof,
  getProofsByTask,
  getSubmittedProofs,
  getPendingVerificationProofs,
  verifyProof,
  rejectProof,
  getProofById
} = require('../controllers/proofController');

// All routes are protected
router.use(protect);

// Proof routes
router.route('/')
  .post(submitProof);

router.route('/submitted')
  .get(getSubmittedProofs);

router.route('/pending')
  .get(getPendingVerificationProofs);

router.route('/task/:taskId')
  .get(getProofsByTask);

router.route('/:id')
  .get(getProofById);

router.route('/:id/verify')
  .put(verifyProof);

router.route('/:id/reject')
  .put(rejectProof);

module.exports = router; 