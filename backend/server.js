const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Temporary hardcoded values for testing
const MONGO_URI = "mongodb+srv://prathameshjangle7666:ZNGXILfOwQbDXkPa@cluster0.sbebkea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = "Nl+tE4qw2IWfgYiC.TsKHCLlCiziOCXTZZLVEiQ==.iqaKTsr6IE2MkuD20OqZKA==";
const PORT = 5000;

// Debug
console.log('Using MongoDB URI:', MONGO_URI);

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Routes
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const partnershipRoutes = require('./routes/partnershipRoutes');
const walletRoutes = require('./routes/walletRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Basic route
app.get('/', (req, res) => {
  res.send('Accountability Partner API is running');
});

// Test route to debug endpoint issues
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint is working',
    routes: {
      user: true,
      match: true,
      partnership: true,
      wallet: true
    }
  });
});

// Special test for wallet routes
app.get('/api/test/wallet', (req, res) => {
  res.json({
    message: 'Wallet test endpoint is working',
    walletRoutes: Object.keys(walletRoutes.stack.map(r => r.route ? r.route.path : 'middleware'))
  });
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/wallet', walletRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 