const mongoose = require('mongoose');
const Partnership = require('./models/partnershipModel');
const Wallet = require('./models/walletModel');
const Transaction = require('./models/transactionModel');
const User = require('./models/userModel');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Hardcoded MongoDB URI for testing
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Get partnership ID from command line
const partnershipId = process.argv[2];
const action = process.argv[3] || 'diagnose';

if (!partnershipId) {
  console.error('Please provide a partnership ID.');
  console.log('Usage: node fixPartnership.js <partnershipId> [action]');
  console.log('Actions: diagnose, reset-status, add-stake, reset-transactions');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error: ', err);
    process.exit(1);
  });

// Helper function to generate a unique transaction reference
const generateTransactionReference = () => {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const diagnosePartnership = async () => {
  try {
    console.log(`\n🔍 CHECKING PARTNERSHIP: ${partnershipId}`);
    const partnership = await Partnership.findById(partnershipId)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');
    
    if (!partnership) {
      console.error('❌ Partnership not found!');
      process.exit(1);
    }
    
    console.log('✅ Partnership found');
    console.log(`   Status: ${partnership.status}`);
    console.log(`   Requester: ${partnership.requester.name} (${partnership.requester.email})`);
    console.log(`   Recipient: ${partnership.recipient.name} (${partnership.recipient.email})`);
    
    // Check agreement and financial stake
    if (partnership.agreement) {
      console.log('\n📝 AGREEMENT DETAILS:');
      console.log(`   Title: ${partnership.agreement.title || 'No title'}`);
      console.log(`   Financial Stake: ${partnership.agreement.financialStake?.amount || 0} ${partnership.agreement.financialStake?.currency || 'USD'}`);
    } else {
      console.log('\n❌ No agreement found for this partnership');
    }
    
    // Check transactions
    console.log('\n💰 TRANSACTION HISTORY:');
    const transactions = await Transaction.find({ partnership: partnershipId });
    
    if (transactions.length === 0) {
      console.log('   No transactions found for this partnership');
    } else {
      transactions.forEach((tx, i) => {
        console.log(`   Transaction ${i+1}:`);
        console.log(`     ID: ${tx._id}`);
        console.log(`     Type: ${tx.type}`);
        console.log(`     Amount: $${tx.amount.toFixed(2)}`);
        console.log(`     Status: ${tx.status}`);
        console.log(`     Date: ${tx.createdAt.toISOString().split('T')[0]}`);
      });
    }
    
    // Check wallets
    console.log('\n👛 WALLET STATUS:');
    const requesterWallet = await Wallet.findOne({ user: partnership.requester._id });
    const recipientWallet = await Wallet.findOne({ user: partnership.recipient._id });
    
    if (requesterWallet) {
      console.log(`   Requester (${partnership.requester.name}):`);
      console.log(`     Balance: $${requesterWallet.balance.toFixed(2)}`);
      console.log(`     Escrow Balance: $${requesterWallet.escrowBalance.toFixed(2)}`);
    } else {
      console.log(`   ❌ No wallet found for requester (${partnership.requester.name})`);
    }
    
    if (recipientWallet) {
      console.log(`   Recipient (${partnership.recipient.name}):`);
      console.log(`     Balance: $${recipientWallet.balance.toFixed(2)}`);
      console.log(`     Escrow Balance: $${recipientWallet.escrowBalance.toFixed(2)}`);
    } else {
      console.log(`   ❌ No wallet found for recipient (${partnership.recipient.name})`);
    }
    
    // Suggest fixes
    console.log('\n🛠️ POSSIBLE ACTIONS:');
    console.log(`   1. Reset partnership status: node fixPartnership.js ${partnershipId} reset-status`);
    console.log(`   2. Add $10 stake: node fixPartnership.js ${partnershipId} add-stake`);
    console.log(`   3. Reset transactions: node fixPartnership.js ${partnershipId} reset-transactions`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const resetStatus = async () => {
  try {
    const partnership = await Partnership.findById(partnershipId);
    
    if (!partnership) {
      console.error('❌ Partnership not found!');
      process.exit(1);
    }
    
    const oldStatus = partnership.status;
    partnership.status = 'accepted';
    await partnership.save();
    
    console.log(`✅ Partnership status reset from "${oldStatus}" to "accepted"`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const addStake = async () => {
  try {
    const partnership = await Partnership.findById(partnershipId)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');
    
    if (!partnership) {
      console.error('❌ Partnership not found!');
      process.exit(1);
    }
    
    // Find requester's wallet
    const requesterWallet = await Wallet.findOne({ user: partnership.requester._id });
    
    if (!requesterWallet) {
      console.error('❌ Requester wallet not found!');
      process.exit(1);
    }
    
    // Add $10 to wallet to ensure they have enough
    requesterWallet.balance += 10;
    await requesterWallet.save();
    
    console.log(`✅ Added $10 to ${partnership.requester.name}'s wallet`);
    
    // Now set up the financial stake
    if (!partnership.agreement) {
      partnership.agreement = {};
    }
    
    partnership.agreement.financialStake = {
      amount: 10,
      currency: 'USD'
    };
    
    await partnership.save();
    
    console.log(`✅ Set financial stake to $10`);
    
    // Create an escrow transaction
    const transaction = await Transaction.create({
      wallet: requesterWallet._id,
      user: partnership.requester._id,
      type: 'escrow_lock',
      amount: 10,
      currency: 'USD',
      status: 'completed',
      description: 'Funds locked in escrow for partnership',
      partnership: partnershipId,
      reference: generateTransactionReference()
    });
    
    // Update escrow balance
    requesterWallet.balance -= 10;
    requesterWallet.escrowBalance += 10;
    await requesterWallet.save();
    
    console.log(`✅ Created escrow transaction and updated wallet balances`);
    console.log(`Transaction ID: ${transaction._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const resetTransactions = async () => {
  try {
    // Find and delete all transactions related to this partnership
    const result = await Transaction.deleteMany({ partnership: partnershipId });
    
    console.log(`✅ Deleted ${result.deletedCount} transactions`);
    
    // Reset partnership status
    const partnership = await Partnership.findById(partnershipId);
    
    if (partnership) {
      partnership.status = 'accepted';
      
      // Reset financial stake
      if (partnership.agreement) {
        partnership.agreement.financialStake = {
          amount: 0,
          currency: 'USD'
        };
      }
      
      await partnership.save();
      console.log(`✅ Reset partnership status and financial stake`);
    }
    
    // Reset wallet escrow balances for both users
    if (partnership) {
      const wallets = await Wallet.find({ 
        user: { $in: [partnership.requester, partnership.recipient] } 
      });
      
      for (const wallet of wallets) {
        if (wallet.escrowBalance > 0) {
          wallet.balance += wallet.escrowBalance;
          wallet.escrowBalance = 0;
          await wallet.save();
          console.log(`✅ Reset escrow balance for wallet ${wallet._id}`);
        }
      }
    }
    
    console.log(`✅ Partnership reset complete. Ready for testing.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Main execution based on action
if (action === 'reset-status') {
  resetStatus();
} else if (action === 'add-stake') {
  addStake();
} else if (action === 'reset-transactions') {
  resetTransactions();
} else {
  diagnosePartnership();
} 