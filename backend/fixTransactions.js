const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// MongoDB connection string
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Transaction = require('./models/transactionModel');
const Partnership = require('./models/partnershipModel');

// Function to fix transaction partnership references
async function fixTransactions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    // 1. Find transactions with missing partnership reference (but have partnership ID as string)
    console.log('\n1. Fixing transactions with missing partnership references...');
    const transactions = await Transaction.find();
    let fixedCount = 0;

    for (const transaction of transactions) {
      // Check if partnership field is a string instead of ObjectId
      if (typeof transaction.partnership === 'string' && transaction.partnership.length > 0) {
        try {
          console.log(`Transaction ${transaction._id} has partnership as string: ${transaction.partnership}`);
          transaction.partnership = mongoose.Types.ObjectId(transaction.partnership);
          await transaction.save();
          fixedCount++;
          console.log(`✅ Fixed transaction ${transaction._id}`);
        } catch (error) {
          console.log(`❌ Could not fix transaction ${transaction._id}: ${error.message}`);
        }
      }
    }

    console.log(`Fixed ${fixedCount} transactions with string partnership references`);

    // 2. Fix partnerships that are marked as 'completed' but have missing escrow transactions
    console.log('\n2. Checking completed partnerships for proper transaction history...');
    const completedPartnerships = await Partnership.find({ status: 'completed' });
    console.log(`Found ${completedPartnerships.length} completed partnerships`);

    for (const partnership of completedPartnerships) {
      console.log(`\nChecking partnership ${partnership._id}`);
      
      // Find all transactions for this partnership
      const partnershipTransactions = await Transaction.find({
        partnership: partnership._id
      });
      
      console.log(`Found ${partnershipTransactions.length} transactions for this partnership`);
      
      // Group by type
      const transactionTypes = partnershipTransactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Transaction types:', transactionTypes);
      
      // Check if there's at least one escrow_lock and one release transaction
      if (!transactionTypes.escrow_lock && partnership.agreement?.financialStake?.amount > 0) {
        console.log('⚠️ Completed partnership has financial stake but no escrow_lock transaction!');
        // This is an inconsistency, but we won't automatically fix it to avoid mistakes
      }
      
      if (!transactionTypes.reward && !transactionTypes.penalty && partnership.status === 'completed') {
        console.log('⚠️ Completed partnership has no reward or penalty transaction!');
        // This is an inconsistency, but we won't automatically fix it to avoid mistakes
      }
    }

    console.log('\n✅ Transaction analysis completed');
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
}

// Run the fix function
fixTransactions(); 