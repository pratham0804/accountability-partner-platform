const express = require('express');
const router = express.Router();
const {
  sendPartnershipRequest,
  getPartnerships,
  getPartnershipById,
  acceptPartnershipRequest,
  rejectPartnershipRequest,
  createAgreement,
} = require('../controllers/partnershipController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Send request and get all partnerships
router.route('/')
  .post(sendPartnershipRequest)
  .get(getPartnerships);

// Get specific partnership
router.route('/:id')
  .get(getPartnershipById);

// Accept or reject requests
router.put('/:id/accept', acceptPartnershipRequest);
router.put('/:id/reject', rejectPartnershipRequest);

// Create agreement
router.put('/:id/agreement', createAgreement);

module.exports = router; 