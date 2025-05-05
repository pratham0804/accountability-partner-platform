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

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // 1. Find the partnership
      const partnership = await Partnership.findById('681819a93f7452b5e8f1746a')
        .populate('requester', 'name email')
        .populate('recipient', 'name email');
      
      if (!partnership) {
        console.log('Partnership not found.');
        process.exit(1);
      }
      
      console.log('====== PARTNERSHIP DETAILS ======');
      console.log(`ID: ${partnership._id}`);
      console.log(`Requester: ${partnership.requester.name} (${partnership.requester._id})`);
      console.log(`Recipient: ${partnership.recipient.name} (${partnership.recipient._id})`);
      
      // 2. Create wallets for both users if they don't exist
      let requesterWallet = await Wallet.findOne({ user: partnership.requester._id });
      let recipientWallet = await Wallet.findOne({ user: partnership.recipient._id });
      
      if (!requesterWallet) {
        requesterWallet = await Wallet.create({
          user: partnership.requester._id,
          balance: 1000, // Add some initial balance for testing
          escrowBalance: 0,
          currency: 'USD'
        });
        console.log(`Created wallet for requester with $${requesterWallet.balance} balance`);
      } else {
        console.log(`Requester already has a wallet with $${requesterWallet.balance} balance`);
      }
      
      if (!recipientWallet) {
        recipientWallet = await Wallet.create({
          user: partnership.recipient._id,
          balance: 1000, // Add some initial balance for testing
          escrowBalance: 0,
          currency: 'USD'
        });
        console.log(`Created wallet for recipient with $${recipientWallet.balance} balance`);
      } else {
        console.log(`Recipient already has a wallet with $${recipientWallet.balance} balance`);
      }
      
      // 3. Check if agreement has financial stake
      if (!partnership.agreement || !partnership.agreement.financialStake || partnership.agreement.financialStake.amount <= 0) {
        console.log('Adding financial stake to agreement...');
        
        // If agreement doesn't exist, create it
        if (!partnership.agreement) {
          partnership.agreement = {};
        }
        
        // Add financial stake
        partnership.agreement.financialStake = {
          amount: 100,
          currency: 'USD'
        };
        
        // Save partnership
        await partnership.save();
        console.log('Added $100 financial stake to agreement');
      } else {
        console.log(`Agreement already has ${partnership.agreement.financialStake.amount} ${partnership.agreement.financialStake.currency} financial stake`);
      }
      
      console.log('\nSetup complete! You can now test the escrow functions.');
    } catch (error) {
      console.error('Error during setup:', error);
    } finally {
      process.exit();
    }
  })
  .catch(err => {
    console.log('MongoDB Connection Error: ', err);
    process.exit(1);
  }); 