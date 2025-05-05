const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Temporary hardcoded values for testing
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Models
const User = require('./models/userModel');
const Partnership = require('./models/partnershipModel');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Find a user to get a valid token
      const user = await User.findById('681784fbf62134bd4c85c155');
      
      if (!user) {
        console.log('User not found.');
        process.exit(1);
      }
      
      // Create a jwt token for testing (simulating what the auth middleware does)
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = "Nl+tE4qw2IWfgYiC.TsKHCLlCiziOCXTZZLVEiQ==.iqaKTsr6IE2MkuD20OqZKA==";
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      
      // Partnership ID from logs
      const partnershipId = '681819a93f7452b5e8f1746a';
      
      // Make direct request to the endpoint
      console.log('Making direct request to escrow release endpoint...');
      console.log(`Partnership ID: ${partnershipId}`);
      console.log(`User ID: ${user._id}`);
      
      try {
        // Try localhost:5000 first
        const response = await axios.post(
          `http://localhost:5000/api/wallet/escrow/release/${partnershipId}`,
          { 
            isSuccess: true, 
            description: 'Test release'
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Success! Response:', response.data);
      } catch (error) {
        console.error('Error with request:', error.message);
        
        if (error.response) {
          console.log('Response status:', error.response.status);
          console.log('Response data:', error.response.data);
          
          // If we get a 404, let's directly check all routes
          if (error.response.status === 404) {
            console.log('\nTesting all possible routes...');
            
            try {
              // Test base wallet route
              const walletResponse = await axios.get(
                'http://localhost:5000/api/wallet',
                { headers: { Authorization: `Bearer ${token}` } }
              );
              console.log('GET /api/wallet - Success:', walletResponse.status);
            } catch (err) {
              console.log('GET /api/wallet - Failed:', err.message);
            }
            
            try {
              // Test deposit route
              const depositResponse = await axios.post(
                'http://localhost:5000/api/wallet/deposit',
                { amount: 10 },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              console.log('POST /api/wallet/deposit - Success:', depositResponse.status);
            } catch (err) {
              console.log('POST /api/wallet/deposit - Failed:', err.message);
            }
            
            try {
              // Test escrow route directly with a simpler path
              const escrowResponse = await axios.post(
                `http://localhost:5000/api/wallet/escrow/${partnershipId}`,
                { amount: 10 },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              console.log('POST /api/wallet/escrow/:partnershipId - Success:', escrowResponse.status);
            } catch (err) {
              console.log('POST /api/wallet/escrow/:partnershipId - Failed:', err.message);
            }
          }
        }
      }
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