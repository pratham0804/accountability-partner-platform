import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    return <div className="loading">Loading wallet data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="escrow-fund-form card">
      <h3>Commit Funds to Agreement</h3>
      <p>Transfer funds to escrow as financial stake for this partnership</p>
      
      {wallet && (
        <div className="wallet-info">
          <p>Available Balance: <strong>${wallet.balance.toFixed(2)}</strong></p>
        </div>
      )}
      
      <form onSubmit={handleTransferToEscrow}>
        <div className="form-group">
          <label htmlFor="escrow-amount">Stake Amount ($)</label>
          <input
            type="number"
            id="escrow-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            placeholder="Enter amount to stake"
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || !wallet || wallet.balance <= 0}
        >
          {loading ? 'Processing...' : 'Transfer to Escrow'}
        </button>
        
        <div className="info-text">
          <p>
            <small>
              Note: Funds transferred to escrow will be locked until the agreement is completed.
              They will be returned if you successfully meet your goals or forfeited if you fail.
            </small>
          </p>
        </div>
      </form>
    </div>
  );
};

export default EscrowFundForm; 