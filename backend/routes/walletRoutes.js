const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserWallet,
  depositFunds,
  withdrawFunds,
  transferToEscrow,
  releaseFromEscrow,
  getTransactionHistory
} = require('../controllers/walletController');

// All wallet routes require authentication
router.use(protect);

// Get user wallet
router.get('/', getUserWallet);

// Transaction history
router.get('/transactions', getTransactionHistory);

// Deposit and withdrawal
router.post('/deposit', depositFunds);
router.post('/withdraw', withdrawFunds);

// Escrow operations
// The more specific route must come first to avoid conflicts
router.post('/escrow/release/:partnershipId', releaseFromEscrow);
router.post('/escrow/:partnershipId', transferToEscrow);

module.exports = router;