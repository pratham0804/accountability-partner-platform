# Accountability Partner Platform

A web application that connects users with accountability partners to help achieve their goals through financial stakes and mutual support.

## Features

### User Authentication
- Registration and login with JWT authentication
- Secure password hashing
- User profile management

### Partner Matching
- Interest-based matching algorithm
- Partner request system
- Partnership management

### Agreement System
- Create detailed agreements with goals and timeframes
- Set financial stakes for goal achievement
- Track agreement progress

### Wallet & Escrow System
- Virtual wallet for managing funds
- Deposit and withdraw functionality
- Escrow system for holding stakes during agreements
- Automatic fund release based on agreement outcomes

### Task Management
- Create and assign tasks
- Track task completion
- Proof submission and verification

## Technical Stack

### Backend
- Node.js + Express
- MongoDB for data storage
- JWT for authentication
- RESTful API design

### Frontend
- React for UI components
- React Router for navigation
- Axios for API communication
- React-Toastify for notifications

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Access the application at `http://localhost:3000`

## Recent Updates

### Wallet & Escrow System
- Added wallet interface showing balance and transaction history
- Implemented escrow funding for agreements
- Added escrow release functionality for completing agreements
- Fixed validation to prevent negative escrow balances
- Added UI improvements to prevent multiple escrow releases

## Database Models

### User Model
- Authentication details
- Profile information
- Interests and skills

### Partnership Model
- Partnership participants
- Status tracking
- Agreement details including financial stakes

### Wallet Model
- User balance
- Escrow balance
- Transaction history

### Transaction Model
- Transaction types (deposit, withdrawal, escrow_lock, reward, penalty)
- Amount and status
- Reference to partnerships

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token

### Partnerships
- `GET /api/partnerships` - Get user partnerships
- `POST /api/partnerships` - Create partnership request
- `GET /api/partnerships/:id` - Get partnership details
- `PUT /api/partnerships/:id/agreement` - Create/update agreement

### Wallet
- `GET /api/wallet` - Get user wallet
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `POST /api/wallet/escrow/:partnershipId` - Transfer to escrow
- `POST /api/wallet/escrow/release/:partnershipId` - Release from escrow
- `GET /api/wallet/transactions` - Get transaction history 