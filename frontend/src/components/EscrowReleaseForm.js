import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EscrowReleaseForm = ({ partnershipId, onFundsReleased }) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [partnershipVerified, setPartnershipVerified] = useState(false);
  const [partnershipData, setPartnershipData] = useState(null);
  const [walletData, setWalletData] = useState(null);

  // Verify partnership exists and fetch wallet data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          toast.error('You need to be logged in');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        };

        // Fetch partnership data
        const partnershipResponse = await axios.get(
          `http://localhost:5000/api/partnerships/${partnershipId}`,
          config
        );
        
        if (partnershipResponse.data) {
          console.log('Partnership verified:', partnershipResponse.data);
          setPartnershipData(partnershipResponse.data);
          setPartnershipVerified(true);

          // Check if partnership is already completed
          if (partnershipResponse.data.status === 'completed') {
            toast.warning('This agreement has already been completed.');
          }

          // Check if partnership has financial stake
          if (!partnershipResponse.data.agreement?.financialStake?.amount) {
            toast.warning('This partnership has no financial stake.');
          }
        }

        // Fetch wallet data
        const walletResponse = await axios.get(
          'http://localhost:5000/api/wallet',
          config
        );
        
        if (walletResponse.data) {
          console.log('Wallet data:', walletResponse.data);
          setWalletData(walletResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error(err.response?.data?.message || 'Failed to verify partnership');
      }
    };

    if (partnershipId) {
      fetchData();
    }
  }, [partnershipId]);

  const handleReleaseFromEscrow = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Get user info from localStorage and extract the token
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      if (!partnershipVerified) {
        toast.error('Partnership could not be verified');
        setLoading(false);
        return;
      }

      console.log('Making request to:', `/api/wallet/escrow/release/${partnershipId}`);
      console.log('Token:', userInfo.token);
      console.log('Request payload:', { 
        isSuccess, 
        description: description || `Funds ${isSuccess ? 'returned' : 'forfeited'} for completed agreement` 
      });
      
      // Use the full URL instead of relying on proxy
      const response = await axios.post(
        `http://localhost:5000/api/wallet/escrow/release/${partnershipId}`,
        { 
          isSuccess, 
          description: description || `Funds ${isSuccess ? 'returned' : 'forfeited'} for completed agreement` 
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      console.log('Response from escrow release:', response.data);
      toast.success(
        isSuccess 
          ? 'Congratulations! Funds have been successfully returned to your wallet.' 
          : 'Funds have been forfeited as per agreement terms.'
      );
      
      // Call the callback to notify parent component
      if (onFundsReleased) {
        onFundsReleased(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error releasing escrow:', err);
      setLoading(false);
      
      // Check for common error conditions
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message;
        
        if (errorMsg.includes('Insufficient funds in escrow')) {
          toast.error('Unable to release funds. The escrow account has insufficient balance.');
        } else if (errorMsg.includes('No funds were ever locked in escrow')) {
          toast.error('No funds were ever locked in escrow for this partnership.');
        } else if (errorMsg.includes('Funds have already been released')) {
          toast.error('These funds have already been released. The agreement is completed.');
        } else if (errorMsg.includes('No funds in escrow')) {
          toast.error('No funds found in escrow for this partnership.');
        } else if (errorMsg.includes('already been completed')) {
          toast.error('This agreement has already been completed and funds released.');
        } else {
          toast.error(errorMsg);
        }
      } else {
        toast.error('Failed to process escrow release. Please try again later.');
      }
    }
  };

  return (
    <div className="escrow-release-form card">
      <h3>Complete Agreement</h3>
      <p>Release funds from escrow based on agreement outcome</p>
      
      {partnershipData && partnershipData.status === 'completed' && (
        <div className="alert alert-warning">
          This agreement has already been marked as completed.
        </div>
      )}
      
      {partnershipData && !partnershipData.agreement?.financialStake?.amount && (
        <div className="alert alert-warning">
          This partnership has no financial stake in escrow.
        </div>
      )}
      
      {walletData && walletData.escrowBalance <= 0 && (
        <div className="alert alert-warning">
          Your wallet has no funds in escrow (Balance: ${walletData.escrowBalance.toFixed(2)}).
        </div>
      )}
      
      <form onSubmit={handleReleaseFromEscrow}>
        <div className="form-group">
          <label>Agreement Outcome</label>
          <div className="radio-options">
            <div className="radio-option">
              <input
                type="radio"
                id="success"
                name="outcome"
                checked={isSuccess}
                onChange={() => setIsSuccess(true)}
              />
              <label htmlFor="success">
                <strong>Success</strong> - I met my goals (funds returned)
              </label>
            </div>
            
            <div className="radio-option">
              <input
                type="radio"
                id="failure"
                name="outcome"
                checked={!isSuccess}
                onChange={() => setIsSuccess(false)}
              />
              <label htmlFor="failure">
                <strong>Failure</strong> - I did not meet my goals (funds forfeited)
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about the outcome"
            rows={3}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={
            loading || 
            !partnershipVerified || 
            (partnershipData && partnershipData.status === 'completed') ||
            (partnershipData && !partnershipData.agreement?.financialStake?.amount)
          }
        >
          {loading 
            ? 'Processing...' 
            : !partnershipVerified 
              ? 'Verifying Partnership...'
              : (partnershipData && partnershipData.status === 'completed')
                ? 'Agreement Already Completed'
                : 'Complete Agreement'
          }
        </button>
        
        <div className="info-text">
          <p>
            <small>
              Note: This action is final and cannot be undone. Make sure you have completed all tasks
              and discussed with your accountability partner before proceeding.
            </small>
          </p>
        </div>
      </form>
    </div>
  );
};

export default EscrowReleaseForm; 