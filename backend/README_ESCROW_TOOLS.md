# Escrow System Diagnostic and Fix Tools

These tools help diagnose and fix issues with the escrow system in the Accountability Partner Platform.

## Issue Background

The escrow system allows users to stake funds when creating accountability partnerships. These funds are locked in escrow and can be released back or forfeited when the agreement is completed.

Common issues include:
- Users unable to release funds from escrow with "Insufficient escrow balance" errors
- Missing wallet records for users
- Inconsistencies between transaction history and wallet balances
- Partnerships with financial stakes but missing transaction records

## Available Tools

### 1. Comprehensive Escrow System Fix

This tool performs a complete scan and fix of the entire escrow system:

```bash
node fixEscrow.js
```

It performs the following actions:
- Creates wallets for users who don't have one
- Generates missing escrow transactions for partnerships with financial stakes
- Adds missing release transactions for completed partnerships
- Adjusts incorrect wallet escrow balances based on transaction history

### 2. Fix Escrow Balances for Active Partnerships

This tool focuses on fixing wallet escrow balances for active partnerships:

```bash
node fixEscrowBalances.js
```

It ensures that:
- All partnerships with financial stakes have corresponding escrow transactions
- Wallet escrow balances match the expected values based on transactions

### 3. Fix Transaction References

This tool fixes transaction references and checks partnership consistency:

```bash
node fixTransactions.js
```

It:
- Fixes transactions with string partnership IDs instead of ObjectIds
- Identifies completed partnerships missing proper transaction history

### 4. Diagnose a Specific Partnership

This tool provides detailed diagnostics for a specific partnership:

```bash
node diagnosePartnership.js <partnershipId>
```

It shows:
- Partnership details including agreement terms
- Wallet balances for both users
- Complete transaction history
- Analysis of potential issues

## Recommended Order of Operations

If you're experiencing escrow-related issues, follow these steps:

1. Run the diagnostic tool on the specific partnership having issues:
   ```bash
   node diagnosePartnership.js <problematic-partnership-id>
   ```

2. If issues are found, run the comprehensive fix:
   ```bash
   node fixEscrow.js
   ```

3. Test the functionality again in the frontend

4. If issues persist, examine the specific error messages and run the diagnostic tool again

## Additional Notes

- These tools automatically connect to the MongoDB database using the connection string defined in the code
- All tools provide detailed logs of actions taken
- No user confirmation is required before changes are made, so use these tools with caution
- All tools are safe to run multiple times as they check existing conditions before making changes

## Common Error Messages and Solutions

- **"Insufficient funds in escrow"**: Run `fixEscrowBalances.js` to restore wallet escrow balances
- **"This agreement has already been completed"**: This is expected behavior, not an issue
- **"No funds in escrow for this partnership"**: Run `fixEscrow.js` to create missing escrow transactions
- **"Failed to process escrow release"**: Check network connectivity and try again 