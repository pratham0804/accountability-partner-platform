const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// MongoDB connection string
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Models
const User = require('./models/userModel');
const Wallet = require('./models/walletModel');
const Partnership = require('./models/partnershipModel');
const Transaction = require('./models/transactionModel');

// Get partnership ID from command line arguments
const partnershipId = process.argv[2];

if (!partnershipId) {
  console.error('Please provide a partnership ID as a command line argument');
  console.error('Usage: node diagnosePartnership.js <partnershipId>');
  process.exit(1);
}

// Function to diagnose a specific partnership
async function diagnosePartnership() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    // Get the partnership
    const partnership = await Partnership.findById(partnershipId)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');

    if (!partnership) {
      console.error(`⚠️ Partnership not found with ID: ${partnershipId}`);
      process.exit(1);
    }

    console.log('\n===== PARTNERSHIP DETAILS =====');
    console.log(`ID: ${partnership._id}`);
    console.log(`Status: ${partnership.status}`);
    console.log(`Requester: ${partnership.requester.name} (${partnership.requester.email})`);
    console.log(`Recipient: ${partnership.recipient.name} (${partnership.recipient.email})`);
    console.log(`Created: ${partnership.createdAt}`);
    console.log(`Updated: ${partnership.updatedAt}`);

    if (partnership.agreement) {
      console.log('\n----- Agreement Details -----');
      console.log(`Title: ${partnership.agreement.title || 'N/A'}`);
      console.log(`Description: ${partnership.agreement.description || 'N/A'}`);
      console.log(`Start Date: ${partnership.agreement.startDate ? new Date(partnership.agreement.startDate).toLocaleDateString() : 'N/A'}`);
      console.log(`End Date: ${partnership.agreement.endDate ? new Date(partnership.agreement.endDate).toLocaleDateString() : 'N/A'}`);
      
      if (partnership.agreement.goals && partnership.agreement.goals.length > 0) {
        console.log('\nGoals:');
        partnership.agreement.goals.forEach((goal, index) => {
          console.log(`  ${index + 1}. ${goal}`);
        });
      }

      if (partnership.agreement.financialStake) {
        console.log('\nFinancial Stake:');
        console.log(`  Amount: ${partnership.agreement.financialStake.amount || 0} ${partnership.agreement.financialStake.currency || 'USD'}`);
      }
    } else {
      console.log('\n⚠️ No agreement defined for this partnership');
    }

    // Get wallets for both users
    const requesterWallet = await Wallet.findOne({ user: partnership.requester._id });
    const recipientWallet = await Wallet.findOne({ user: partnership.recipient._id });

    console.log('\n===== WALLET DETAILS =====');
    if (requesterWallet) {
      console.log(`\nRequester Wallet (${partnership.requester.name}):`);
      console.log(`  Balance: ${requesterWallet.balance} ${requesterWallet.currency}`);
      console.log(`  Escrow Balance: ${requesterWallet.escrowBalance} ${requesterWallet.currency}`);
    } else {
      console.log(`\n⚠️ No wallet found for requester (${partnership.requester.name})`);
    }

    if (recipientWallet) {
      console.log(`\nRecipient Wallet (${partnership.recipient.name}):`);
      console.log(`  Balance: ${recipientWallet.balance} ${recipientWallet.currency}`);
      console.log(`  Escrow Balance: ${recipientWallet.escrowBalance} ${recipientWallet.currency}`);
    } else {
      console.log(`\n⚠️ No wallet found for recipient (${partnership.recipient.name})`);
    }

    // Get transactions for this partnership
    const transactions = await Transaction.find({ partnership: partnership._id })
      .sort({ createdAt: 1 })
      .populate('user', 'name email');

    console.log('\n===== TRANSACTION HISTORY =====');
    if (transactions.length === 0) {
      console.log('⚠️ No transactions found for this partnership');
    } else {
      console.log(`Found ${transactions.length} transactions:`);
      transactions.forEach((tx, index) => {
        console.log(`\n----- Transaction ${index + 1} -----`);
        console.log(`ID: ${tx._id}`);
        console.log(`Type: ${tx.type}`);
        console.log(`Amount: ${tx.amount} ${tx.currency}`);
        console.log(`Status: ${tx.status}`);
        console.log(`User: ${tx.user.name} (${tx.user.email})`);
        console.log(`Description: ${tx.description}`);
        console.log(`Created: ${tx.createdAt}`);
      });
    }

    // Analyze for issues
    console.log('\n===== DIAGNOSIS =====');
    
    // Check if completed but has no transactions
    if (partnership.status === 'completed' && transactions.length === 0) {
      console.log('❌ Partnership is marked as completed but has no transactions');
    }
    
    // Check if there's a financial stake but no escrow_lock transaction
    if (partnership.agreement?.financialStake?.amount > 0) {
      const escrowLockTx = transactions.find(tx => tx.type === 'escrow_lock');
      if (!escrowLockTx) {
        console.log('❌ Partnership has financial stake but no escrow_lock transaction');
      }
    }
    
    // Check if completed but no reward/penalty transaction
    if (partnership.status === 'completed') {
      const releaseTx = transactions.find(tx => tx.type === 'reward' || tx.type === 'penalty');
      if (!releaseTx) {
        console.log('❌ Partnership is completed but has no reward/penalty transaction');
      }
    }
    
    // Check wallet escrow balance consistency
    if (requesterWallet && recipientWallet) {
      const escrowLockTxs = transactions.filter(tx => tx.type === 'escrow_lock');
      const releaseTxs = transactions.filter(tx => tx.type === 'reward' || tx.type === 'penalty');
      
      const totalLocked = escrowLockTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const totalReleased = releaseTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const expectedEscrowBalance = totalLocked - totalReleased;
      
      // Calculate expected escrow balance for each user
      const requesterLockTxs = escrowLockTxs.filter(tx => tx.user._id.toString() === partnership.requester._id.toString());
      const requesterReleaseTxs = releaseTxs.filter(tx => tx.user._id.toString() === partnership.requester._id.toString());
      const expectedRequesterEscrow = requesterLockTxs.reduce((sum, tx) => sum + tx.amount, 0) - requesterReleaseTxs.reduce((sum, tx) => sum + tx.amount, 0);
      
      const recipientLockTxs = escrowLockTxs.filter(tx => tx.user._id.toString() === partnership.recipient._id.toString());
      const recipientReleaseTxs = releaseTxs.filter(tx => tx.user._id.toString() === partnership.recipient._id.toString());
      const expectedRecipientEscrow = recipientLockTxs.reduce((sum, tx) => sum + tx.amount, 0) - recipientReleaseTxs.reduce((sum, tx) => sum + tx.amount, 0);
      
      if (requesterWallet.escrowBalance !== expectedRequesterEscrow) {
        console.log(`❌ Requester wallet escrow balance inconsistent: ${requesterWallet.escrowBalance} (actual) vs ${expectedRequesterEscrow} (expected)`);
      }
      
      if (recipientWallet.escrowBalance !== expectedRecipientEscrow) {
        console.log(`❌ Recipient wallet escrow balance inconsistent: ${recipientWallet.escrowBalance} (actual) vs ${expectedRecipientEscrow} (expected)`);
      }
    }
    
    // No issues found
    if (
      !(partnership.status === 'completed' && transactions.length === 0) &&
      !(partnership.agreement?.financialStake?.amount > 0 && !transactions.find(tx => tx.type === 'escrow_lock')) &&
      !(partnership.status === 'completed' && !transactions.find(tx => tx.type === 'reward' || tx.type === 'penalty'))
    ) {
      console.log('✅ No major issues detected with this partnership');
    }
    
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB Disconnected');
  }
}

// Run the diagnosis
diagnosePartnership(); 