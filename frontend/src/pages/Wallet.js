import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          navigate('/login');
          return;
        }

        // Get wallet data
        const walletResponse = await axios.get(`${API_BASE_URL}/api/wallet`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setWallet(walletResponse.data);

        // Get transaction history
        const transactionsResponse = await axios.get(`${API_BASE_URL}/api/wallet/transactions`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setTransactions(transactionsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast.error('Failed to load wallet data');
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [navigate]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/wallet/deposit`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Refresh wallet data
      const walletResponse = await axios.get(`${API_BASE_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setWallet(walletResponse.data);

      // Refresh transaction history
      const transactionsResponse = await axios.get(`${API_BASE_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setTransactions(transactionsResponse.data);

      setAmount('');
      toast.success(`Successfully deposited $${amount}`);
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast.error(error.response?.data?.message || 'Failed to deposit funds');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/wallet/withdraw`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Refresh wallet data
      const walletResponse = await axios.get(`${API_BASE_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setWallet(walletResponse.data);

      // Refresh transaction history
      const transactionsResponse = await axios.get(`${API_BASE_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setTransactions(transactionsResponse.data);

      setAmount('');
      toast.success(`Successfully withdrew $${amount}`);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error(error.response?.data?.message || 'Failed to withdraw funds');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading wallet data...</div>;
  }

  return (
    <div className="wallet-page">
      <h1>My Wallet</h1>
      
      <div className="wallet-info card">
        <div className="balance-container">
          <div className="balance-box">
            <h3>Available Balance</h3>
            <h2>${wallet?.balance.toFixed(2)}</h2>
          </div>
          <div className="balance-box">
            <h3>Escrow Balance</h3>
            <h2>${wallet?.escrowBalance.toFixed(2)}</h2>
          </div>
        </div>
        
        <div className="wallet-actions">
          <div className="action-form">
            <h3>Deposit or Withdraw Funds</h3>
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleDeposit}
              >
                Deposit
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleWithdraw}
                disabled={wallet?.balance < Number(amount)}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="transaction-history card">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <div className="transaction-list">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{formatDate(transaction.createdAt)}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`transaction-amount ${transaction.type === 'deposit' || transaction.type === 'reward' ? 'positive' : 'negative'}`}>
                        {transaction.type === 'deposit' || transaction.type === 'reward' ? '+' : '-'}
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`transaction-status ${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet; 