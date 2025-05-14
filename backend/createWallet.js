const mongoose = require('mongoose');
const User = require('./models/userModel');
const Wallet = require('./models/walletModel');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Hardcoded MongoDB URI for testing
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Get user email from command line
const userEmail = process.argv[2];
const initialBalance = parseFloat(process.argv[3]) || 50;

if (!userEmail) {
  console.error('Please provide a user email.');
  console.log('Usage: node createWallet.js user@example.com [initialBalance]');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error: ', err);
    process.exit(1);
  });

const createWallet = async () => {
  try {
    // Find the user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`❌ User with email ${userEmail} not found.`);
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.name} (${user._id})`);
    
    // Check if wallet already exists
    let wallet = await Wallet.findOne({ user: user._id });
    
    if (wallet) {
      console.log(`⚠️ Wallet already exists for this user with balance $${wallet.balance.toFixed(2)}`);
      console.log('   Updating wallet balance...');
      
      wallet.balance = initialBalance;
      wallet.escrowBalance = 0;
      await wallet.save();
      
      console.log(`✅ Updated wallet balance to $${initialBalance.toFixed(2)}`);
    } else {
      // Create new wallet
      wallet = await Wallet.create({
        user: user._id,
        balance: initialBalance,
        escrowBalance: 0,
        currency: 'USD'
      });
      
      console.log(`✅ Created new wallet with balance $${initialBalance.toFixed(2)}`);
    }
    
    console.log(`✅ Wallet ID: ${wallet._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createWallet(); 