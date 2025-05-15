# Accountability Partner Platform

A full-stack application for finding and working with accountability partners to achieve your goals.

## Features

- User Authentication System
- Partner Matching Algorithm
- Real-time Chat Communication
- Accountability Agreements
- Task Management System
- **Financial Escrow System**
- **Content Moderation System**

## Recent Updates

### Escrow System Implementation

The platform now includes a comprehensive financial escrow system:

- **Financial Stakes**: Users can add financial stakes to their accountability agreements
- **Escrow Wallet**: Secure wallet system for managing funds
- **Automated Transfers**: Funds automatically transfer to escrow when creating agreements
- **Agreement Completion**: Release or forfeit funds based on goal achievement
- **User-Friendly Interface**: Guided help system for escrow functionality

### Content Moderation

We've implemented an automatic content moderation system:

- **Real-time Monitoring**: Monitors all chat messages and user content
- **Policy Enforcement**: Enforces platform community standards
- **Penalty System**: Issues warnings and penalties for policy violations
- **Admin Dashboard**: Moderation dashboard for administrative review

## Technology Stack

- **Frontend**: React, CSS, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-time Communication**: Socket.io

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development servers:
   ```
   npm run dev
   ```

## Escrow System Guide

The escrow system allows users to stake funds when creating accountability partnerships:

1. **Create an Agreement**: First, establish terms with your accountability partner
2. **Add Funds to Wallet**: Use the quick add feature to fund your wallet
3. **Transfer to Escrow**: Commit funds as a stake in your agreement
4. **Complete Agreement**: When finished, release or forfeit funds based on goal achievement

## Documentation

For more detailed information, see:
- [Escrow System Documentation](backend/README_ESCROW_TOOLS.md)
- [API Documentation](docs/api.md)
- [Contribution Guidelines](ginstructions.txt)

## License

This project is licensed under the MIT License.
