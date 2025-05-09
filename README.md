# Accountability Partner Platform

A web application that helps users find accountability partners, set goals, and track progress together.

## Features

- User Authentication & Profile Management
- Partner Matching System
- Partnership Formation & Agreements
- Task Management
- Proof Submission & Verification
- Secure Chat System
- Wallet & Escrow System
- Content Moderation

## Technical Stack

### Frontend
- React.js
- Redux for state management
- React Router for navigation
- Axios for API calls
- Material-UI for components
- Socket.io-client for real-time chat

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time features
- Nodemailer for email notifications
- Joi for request validation

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/accountability-partner-platform.git
cd accountability-partner-platform/backend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Update environment variables in .env
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Start the server
```bash
npm run dev
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd ../frontend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Update environment variables in .env
```
REACT_APP_API_URL=http://localhost:5000
```

5. Start the development server
```bash
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
- `POST /api/users/register` - Register new user
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

### Tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/partnership/:partnershipId` - Get tasks for a partnership
- `GET /api/tasks/assigned` - Get tasks assigned to user
- `GET /api/tasks/created` - Get tasks created by user
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/complete` - Mark task as complete
- `PUT /api/tasks/:id/verify` - Verify task completion
- `PUT /api/tasks/:id/fail` - Mark task as failed

### Proofs
- `POST /api/proofs` - Submit proof for a task
- `GET /api/proofs/task/:taskId` - Get proofs for a task
- `GET /api/proofs/submitted` - Get proofs submitted by user
- `GET /api/proofs/pending` - Get proofs pending verification
- `GET /api/proofs/:id` - Get proof details
- `PUT /api/proofs/:id/verify` - Verify proof
- `PUT /api/proofs/:id/reject` - Reject proof

## Development Progress

- [x] Project Setup
- [x] User Authentication System
- [x] User Profile & Interest Management
- [x] Partner Matching System
- [x] Partnership Formation & Agreement System
- [x] Wallet & Escrow System
- [x] Task Management System
- [x] Proof Submission & Verification System
- [ ] Third-Party Integration for Proof Verification
- [ ] Chat & Communication System
- [ ] Content Moderation System
- [ ] Agreement Resolution & Reward/Penalty System
- [ ] Dashboard & Statistics
- [ ] Notifications System
- [ ] Admin Panel
- [ ] UI Enhancement & Responsiveness
- [ ] Final Testing & Deployment Preparation

## API Documentation

### Authentication Endpoints

#### POST /api/users/register
Register a new user
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "interests": ["string"]
}
```

#### POST /api/users/login
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

### Partnership Endpoints

#### GET /api/partnerships
Get user's partnerships

#### POST /api/partnerships
Create partnership request
```json
{
  "partnerId": "string",
  "agreement": {
    "goals": ["string"],
    "duration": "number",
    "stake": "number"
  }
}
```

### Message Endpoints

#### GET /api/messages/partnership/:partnershipId
Get messages for a partnership

#### POST /api/messages
Send a message
```json
{
  "partnershipId": "string",
  "content": "string"
}
```

### Task Endpoints

#### GET /api/tasks/partnership/:partnershipId
Get tasks for a partnership

#### POST /api/tasks
Create a new task
```json
{
  "partnershipId": "string",
  "title": "string",
  "description": "string",
  "deadline": "date"
}
```

## Contributing

We welcome contributions to the Accountability Partner Platform! Here's how you can help:

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- Use ESLint for code linting
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the package.json version if needed
3. The PR will be merged once you have the sign-off of two other developers
