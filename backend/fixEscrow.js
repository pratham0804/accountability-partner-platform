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

// Generate a random reference for transactions
const generateTransactionReference = () => {
  return `TXN-${Math.floor(Math.random() * 1000000000)}`;
};

// Function to fix all escrow-related issues
async function fixAllEscrowIssues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    console.log('\n===== STARTING COMPREHENSIVE ESCROW SYSTEM FIX =====');

    // Step 1: Check wallet integrity
    console.log('\n----- STEP 1: Checking Wallet Integrity -----');
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    let walletCreated = 0;
    
    for (const user of users) {
      const wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        console.log(`Creating wallet for user: ${user._id} (${user.name})`);
        await Wallet.create({
          user: user._id,
          balance: 100, // Give them some starter funds
          escrowBalance: 0,
          currency: 'USD'
        });
        walletCreated++;
      }
    }
    
    console.log(`Created ${walletCreated} new wallets`);

    // Step 2: Fix partnerships with financial stakes but no escrow transactions
    console.log('\n----- STEP 2: Fixing Partnerships With Missing Escrow Transactions -----');
    const partnershipsWithStakes = await Partnership.find({
      'agreement.financialStake.amount': { $gt: 0 }
    });
    console.log(`Found ${partnershipsWithStakes.length} partnerships with financial stakes`);
    
    let partnershipFixed = 0;
    
    for (const partnership of partnershipsWithStakes) {
      // Find escrow transactions for this partnership
      const escrowTx = await Transaction.findOne({
        partnership: partnership._id,
        type: 'escrow_lock'
      });
      
      if (!escrowTx) {
        console.log(`\nFixing partnership ${partnership._id} with missing escrow transaction`);
        
        // Get user wallet (requester for simplicity)
        const wallet = await Wallet.findOne({ user: partnership.requester });
        if (!wallet) {
          console.log(`Wallet not found for requester ${partnership.requester}, skipping`);
          continue;
        }
        
        // Create the missing transaction
        await Transaction.create({
          wallet: wallet._id,
          user: partnership.requester,
          type: 'escrow_lock',
          amount: partnership.agreement.financialStake.amount,
          currency: partnership.agreement.financialStake.currency || 'USD',
          status: 'completed',
          description: 'Funds locked in escrow for partnership (retroactively created)',
          partnership: partnership._id,
          reference: generateTransactionReference(),
          createdAt: partnership.agreement.createdAt || partnership.createdAt
        });
        
        // Update wallet balance
        wallet.escrowBalance += partnership.agreement.financialStake.amount;
        await wallet.save();
        
        partnershipFixed++;
        console.log(`✅ Created missing escrow transaction for partnership ${partnership._id}`);
      }
    }
    
    console.log(`Fixed ${partnershipFixed} partnerships with missing escrow transactions`);

    // Step 3: Fix completed partnerships that are missing reward/penalty transactions
    console.log('\n----- STEP 3: Fixing Completed Partnerships With Missing Release Transactions -----');
    const completedPartnerships = await Partnership.find({
      status: 'completed',
      'agreement.financialStake.amount': { $gt: 0 }
    });
    console.log(`Found ${completedPartnerships.length} completed partnerships with financial stakes`);
    
    let completedFixed = 0;
    
    for (const partnership of completedPartnerships) {
      // Find release transactions for this partnership
      const releaseTx = await Transaction.findOne({
        partnership: partnership._id,
        type: { $in: ['reward', 'penalty'] }
      });
      
      if (!releaseTx) {
        console.log(`\nFixing completed partnership ${partnership._id} with missing release transaction`);
        
        // Get user wallet
        const wallet = await Wallet.findOne({ user: partnership.requester });
        if (!wallet) {
          console.log(`Wallet not found for requester ${partnership.requester}, skipping`);
          continue;
        }
        
        // Create the missing transaction (assuming success/reward for simplicity)
        await Transaction.create({
          wallet: wallet._id,
          user: partnership.requester,
          type: 'reward', // Assume success
          amount: partnership.agreement.financialStake.amount,
          currency: partnership.agreement.financialStake.currency || 'USD',
          status: 'completed',
          description: 'Escrow funds released back for completed partnership (retroactively created)',
          partnership: partnership._id,
          reference: generateTransactionReference(),
          createdAt: partnership.updatedAt // Use the partnership update date
        });
        
        // Update wallet balance - reduce escrow balance since funds were released
        if (wallet.escrowBalance >= partnership.agreement.financialStake.amount) {
          wallet.escrowBalance -= partnership.agreement.financialStake.amount;
          wallet.balance += partnership.agreement.financialStake.amount; // Add to main balance for reward
          await wallet.save();
        }
        
        completedFixed++;
        console.log(`✅ Created missing release transaction for partnership ${partnership._id}`);
      }
    }
    
    console.log(`Fixed ${completedFixed} completed partnerships with missing release transactions`);

    // Step 4: Fix incorrect wallet escrow balances
    console.log('\n----- STEP 4: Fixing Incorrect Wallet Escrow Balances -----');
    
    const wallets = await Wallet.find();
    console.log(`Found ${wallets.length} wallets to check`);
    
    let walletsFixed = 0;
    
    for (const wallet of wallets) {
      // Calculate expected escrow balance based on transactions
      const lockTransactions = await Transaction.find({
        wallet: wallet._id,
        type: 'escrow_lock',
        status: 'completed'
      });
      
      const releaseTransactions = await Transaction.find({
        wallet: wallet._id,
        type: { $in: ['reward', 'penalty'] },
        status: 'completed'
      });
      
      const totalLocked = lockTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalReleased = releaseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const expectedEscrowBalance = Math.max(0, totalLocked - totalReleased);
      
      if (wallet.escrowBalance !== expectedEscrowBalance) {
        console.log(`\nFixing wallet ${wallet._id} escrow balance`);
        console.log(`User: ${wallet.user}`);
        console.log(`Current escrow balance: ${wallet.escrowBalance}`);
        console.log(`Expected escrow balance: ${expectedEscrowBalance}`);
        console.log(`Total locked: ${totalLocked}`);
        console.log(`Total released: ${totalReleased}`);
        
        wallet.escrowBalance = expectedEscrowBalance;
        await wallet.save();
        
        walletsFixed++;
        console.log(`✅ Fixed wallet escrow balance for wallet ${wallet._id}`);
      }
    }
    
    console.log(`Fixed ${walletsFixed} wallets with incorrect escrow balances`);

    console.log('\n===== ESCROW SYSTEM FIX COMPLETED =====');
    console.log(`✅ Created ${walletCreated} wallets`);
    console.log(`✅ Fixed ${partnershipFixed} partnerships with missing escrow transactions`);
    console.log(`✅ Fixed ${completedFixed} completed partnerships with missing release transactions`);
    console.log(`✅ Fixed ${walletsFixed} wallets with incorrect escrow balances`);
    
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB Disconnected');
  }
}

// Run the fix function
fixAllEscrowIssues(); 