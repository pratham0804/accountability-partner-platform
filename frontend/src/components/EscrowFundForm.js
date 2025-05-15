import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  Divider,
  Alert,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  AccountBalance as WalletIcon,
  Send as SendIcon,
  LockClock as LockIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';

const EscrowFundForm = ({ partnershipId, onFundsTransferred }) => {
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          setError('You need to be logged in');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/wallet', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setWallet(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data');
        setLoading(false);
      }
    };

    fetchWalletData();
    // Re-fetch wallet every 5 seconds while this component is open
    const intervalId = setInterval(fetchWalletData, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleTransferToEscrow = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!wallet || wallet.balance < Number(amount)) {
      toast.error('Insufficient funds in your wallet');
      return;
    }

    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      console.log('Making request to:', `/api/wallet/escrow/${partnershipId}`);
      console.log('Token:', userInfo.token);
      
      const response = await axios.post(
        `http://localhost:5000/api/wallet/escrow/${partnershipId}`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      toast.success('Funds successfully transferred to escrow');
      setAmount('');
      setWallet(response.data.wallet);
      
      // Call the callback to notify parent component
      if (onFundsTransferred) {
        onFundsTransferred(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error transferring to escrow:', err);
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to transfer funds to escrow');
    }
  };

  if (loading && !wallet) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        p={3}
        sx={{ height: 200 }}
      >
        <CircularProgress size={30} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading wallet data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <ErrorIcon sx={{ mr: 1 }} />
        {error}
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          opacity: 0.05,
          zIndex: 0,
          overflow: 'hidden'
        }}>
          <MoneyIcon sx={{ fontSize: 120, transform: 'rotate(15deg)' }} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
            Commit Funds to Agreement
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Transfer funds to escrow as financial stake for this partnership
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {wallet && (
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'primary.lighter',
                  color: 'primary.dark'
                }}
              >
                <WalletIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="body1">
                  Available Balance: <Box component="span" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    ${wallet.balance.toFixed(2)}
                  </Box>
                </Typography>
              </Box>
            </motion.div>
          )}
          
          <Box component="form" onSubmit={handleTransferToEscrow}>
            <TextField
              fullWidth
              id="escrow-amount"
              label="Stake Amount"
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                endAdornment: wallet && (
                  <InputAdornment position="end">
                    <Button 
                      size="small" 
                      onClick={() => setAmount(wallet.balance.toString())}
                      sx={{ fontSize: '0.7rem' }}
                      color="primary"
                    >
                      MAX
                    </Button>
                  </InputAdornment>
                )
              }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 3 }}
              required
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              size="large"
              disabled={loading || !wallet || wallet.balance <= 0}
              sx={{ 
                py: 1.5, 
                mb: 2, 
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden'
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
            >
              {loading ? 'Processing...' : 'Transfer to Escrow'}
              {!loading && (
                <motion.div
                  animate={{ x: [-40, 40], opacity: [0, 1, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'absolute',
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                  }}
                />
              )}
            </Button>
            
            <Alert 
              severity="info" 
              variant="outlined"
              icon={<InfoIcon />}
              sx={{ 
                borderRadius: 2,
                fontSize: '0.85rem'
              }}
            >
              Funds transferred to escrow will be locked until the agreement is completed.
              They will be returned if you successfully meet your goals or forfeited if you fail.
            </Alert>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default EscrowFundForm; 