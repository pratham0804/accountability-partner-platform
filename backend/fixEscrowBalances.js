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

// Function to reset and fix escrow balances
async function fixEscrowBalances() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    // Find all partnerships with financial stakes
    const partnerships = await Partnership.find({
      'agreement.financialStake.amount': { $gt: 0 },
      status: { $ne: 'completed' } // Only fix partnerships that aren't completed
    });

    console.log(`Found ${partnerships.length} partnerships with financial stakes`);

    for (const partnership of partnerships) {
      console.log(`\nProcessing partnership: ${partnership._id}`);
      console.log(`- Status: ${partnership.status}`);
      console.log(`- Financial stake: ${partnership.agreement?.financialStake?.amount || 0}`);

      // Get both users' wallets
      const requesterWallet = await Wallet.findOne({ user: partnership.requester });
      const recipientWallet = await Wallet.findOne({ user: partnership.recipient });

      console.log(`- Requester wallet: ${requesterWallet ? 'Found' : 'Not found'}`);
      console.log(`- Recipient wallet: ${recipientWallet ? 'Found' : 'Not found'}`);

      if (!requesterWallet || !recipientWallet) {
        console.log('⚠️ One or both wallets not found, creating missing wallets');
        
        if (!requesterWallet) {
          const newRequesterWallet = await Wallet.create({
            user: partnership.requester,
            balance: 100, // Give them some starter funds
            escrowBalance: 0,
            currency: 'USD'
          });
          console.log(`✅ Created requester wallet with ID ${newRequesterWallet._id}`);
        }
        
        if (!recipientWallet) {
          const newRecipientWallet = await Wallet.create({
            user: partnership.recipient,
            balance: 100, // Give them some starter funds
            escrowBalance: 0,
            currency: 'USD'
          });
          console.log(`✅ Created recipient wallet with ID ${newRecipientWallet._id}`);
        }
      }

      // Find existing escrow transactions for this partnership
      const existingTransactions = await Transaction.find({
        partnership: partnership._id,
        type: { $in: ['escrow_lock', 'reward', 'penalty'] }
      });

      console.log(`- Found ${existingTransactions.length} related transactions`);

      // Check if there are already escrow_lock transactions
      const escrowLockTransactions = existingTransactions.filter(t => t.type === 'escrow_lock');
      
      if (escrowLockTransactions.length > 0) {
        console.log('✅ Escrow lock transactions already exist, no need to create new ones');
      } else {
        // No escrow lock transactions found, we need to create them
        console.log('⚠️ No escrow lock transactions found, creating new ones');
        
        // Determine which user needs the escrow (usually the one who made the agreement)
        // For simplicity, we'll assume it's the requester
        const updatedWallet = await Wallet.findOne({ user: partnership.requester });
        
        // Check if wallet has enough balance
        if (updatedWallet.balance >= partnership.agreement.financialStake.amount) {
          console.log(`✅ Wallet has enough balance (${updatedWallet.balance}), creating escrow transaction`);
          
          // Create escrow lock transaction
          const transaction = await Transaction.create({
            wallet: updatedWallet._id,
            user: partnership.requester,
            type: 'escrow_lock',
            amount: partnership.agreement.financialStake.amount,
            currency: updatedWallet.currency,
            status: 'completed',
            description: `Funds locked in escrow for partnership`,
            partnership: partnership._id,
            reference: generateTransactionReference()
          });
          
          // Update wallet balance
          updatedWallet.balance -= partnership.agreement.financialStake.amount;
          updatedWallet.escrowBalance += partnership.agreement.financialStake.amount;
          await updatedWallet.save();
          
          console.log(`✅ Created escrow lock transaction and updated wallet balances`);
          console.log(`- New balance: ${updatedWallet.balance}`);
          console.log(`- New escrow balance: ${updatedWallet.escrowBalance}`);
        } else {
          console.log(`⚠️ Wallet doesn't have enough balance (${updatedWallet.balance}), adding funds`);
          
          // Add funds to wallet
          updatedWallet.balance += 100; // Add $100 for testing
          await updatedWallet.save();
          
          console.log(`✅ Added $100 to wallet, new balance: ${updatedWallet.balance}`);
          
          // Now create the transaction
          const transaction = await Transaction.create({
            wallet: updatedWallet._id,
            user: partnership.requester,
            type: 'escrow_lock',
            amount: partnership.agreement.financialStake.amount,
            currency: updatedWallet.currency,
            status: 'completed',
            description: `Funds locked in escrow for partnership`,
            partnership: partnership._id,
            reference: generateTransactionReference()
          });
          
          // Update wallet balance
          updatedWallet.balance -= partnership.agreement.financialStake.amount;
          updatedWallet.escrowBalance += partnership.agreement.financialStake.amount;
          await updatedWallet.save();
          
          console.log(`✅ Created escrow lock transaction and updated wallet balances`);
          console.log(`- New balance: ${updatedWallet.balance}`);
          console.log(`- New escrow balance: ${updatedWallet.escrowBalance}`);
        }
      }
    }

    console.log('\n✅ All partnerships processed successfully');
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
}

// Run the fix function
fixEscrowBalances(); 