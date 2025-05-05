const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Temporary hardcoded values for testing
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Partnership = require('./models/partnershipModel');
const Wallet = require('./models/walletModel');
const User = require('./models/userModel');
const Transaction = require('./models/transactionModel');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // 1. Find a single partnership for testing
      const partnership = await Partnership.findOne({ status: 'accepted' })
        .populate('requester', 'name email')
        .populate('recipient', 'name email');
      
      if (!partnership) {
        console.log('No accepted partnerships found. Please create one first.');
        process.exit(1);
      }
      
      console.log('====== TEST PARTNERSHIP ======');
      console.log(`ID: ${partnership._id}`);
      console.log(`Requester: ${partnership.requester.name} (${partnership.requester._id})`);
      console.log(`Recipient: ${partnership.recipient.name} (${partnership.recipient._id})`);
      console.log(`Status: ${partnership.status}`);
      console.log('Agreement:', partnership.agreement);
      
      // 2. Check wallets for both users
      const requesterWallet = await Wallet.findOne({ user: partnership.requester._id });
      const recipientWallet = await Wallet.findOne({ user: partnership.recipient._id });
      
      console.log('\n====== WALLETS ======');
      if (requesterWallet) {
        console.log(`Requester Wallet: Balance: $${requesterWallet.balance}, Escrow: $${requesterWallet.escrowBalance}`);
      } else {
        console.log('Requester has no wallet');
      }
      
      if (recipientWallet) {
        console.log(`Recipient Wallet: Balance: $${recipientWallet.balance}, Escrow: $${recipientWallet.escrowBalance}`);
      } else {
        console.log('Recipient has no wallet');
      }
      
      // 3. Check transactions
      console.log('\n====== TRANSACTIONS ======');
      const transactions = await Transaction.find({
        partnership: partnership._id
      }).sort({ createdAt: -1 });
      
      if (transactions.length > 0) {
        transactions.forEach(t => {
          console.log(`${t.type} - $${t.amount} - ${t.status} - ${t.description}`);
        });
      } else {
        console.log('No transactions found for this partnership');
      }
      
      console.log('\nTest complete!');
    } catch (error) {
      console.error('Error during test:', error);
    } finally {
      process.exit();
    }
  })
  .catch(err => {
    console.log('MongoDB Connection Error: ', err);
    process.exit(1);
  }); 