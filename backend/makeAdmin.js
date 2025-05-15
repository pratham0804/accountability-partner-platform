const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Temporary hardcoded values for testing
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Get email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide an email address.');
  console.log('Usage: node makeAdmin.js user@example.com');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error: ', err);
    process.exit(1);
  });

const makeAdmin = async () => {
  try {
    // Find the user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`User with email ${userEmail} not found.`);
      process.exit(1);
    }
    
    // Update user to admin
    user.isAdmin = true;
    await user.save();
    
    console.log(`User ${user.name} (${user.email}) has been made an admin!`);
    
    // Get all admin users for verification
    const adminUsers = await User.find({ isAdmin: true }).select('name email');
    console.log('\nCurrent admin users:');
    adminUsers.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin(); 