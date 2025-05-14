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
const Transaction = require('./models/transactionModel');

// Function to fix a specific wallet balance
async function fixSpecificWallet() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    // Find the user by email
    const user = await User.findOne({ email: 'anchall@gmail.com' });
    if (!user) {
      console.error('User with email anchall@gmail.com not found');
      return;
    }

    console.log(`Found user: ${user.name} (${user._id})`);

    // Find the wallet
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      console.error('Wallet not found for this user');
      return;
    }

    console.log('\n===== CURRENT WALLET STATE =====');
    console.log(`Balance: ${wallet.balance} ${wallet.currency}`);
    console.log(`Escrow Balance: ${wallet.escrowBalance} ${wallet.currency}`);
    
    // Get all transactions
    const allTransactions = await Transaction.find({
      wallet: wallet._id
    }).sort({ createdAt: 1 });
    
    console.log(`\nFound ${allTransactions.length} transactions for this wallet`);
    
    // Print transaction info
    allTransactions.forEach((tx, index) => {
      console.log(`\n----- Transaction ${index + 1} -----`);
      console.log(`ID: ${tx._id}`);
      console.log(`Type: ${tx.type}`);
      console.log(`Amount: ${tx.amount} ${tx.currency}`);
      console.log(`Status: ${tx.status}`);
      console.log(`Description: ${tx.description}`);
      console.log(`Created: ${tx.createdAt}`);
    });
    
    // Force update the escrow balance
    console.log(`\nForce updating wallet escrow balance from ${wallet.escrowBalance} to 0`);
    wallet.escrowBalance = 0;
    await wallet.save();
    console.log('✅ Wallet escrow balance forcefully updated');
    
    // Check and update any problematic transactions
    let modifiedTxCount = 0;
    for (const tx of allTransactions) {
      if (tx.type === 'escrow_lock' && tx.amount === 50000) {
        console.log(`\nFound suspicious transaction: ${tx._id} with amount ${tx.amount}`);
        
        // Ask for confirmation
        console.log('Fixing transaction amount to 10...');
        tx.amount = 10;
        await tx.save();
        modifiedTxCount++;
      }
    }
    
    console.log(`\nModified ${modifiedTxCount} suspicious transactions`);

  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB Disconnected');
  }
}

// Run the fix function
fixSpecificWallet(); 