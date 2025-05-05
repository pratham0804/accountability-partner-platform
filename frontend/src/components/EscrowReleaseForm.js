import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EscrowReleaseForm = ({ partnershipId, onFundsReleased }) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [partnershipVerified, setPartnershipVerified] = useState(false);

  // Verify partnership exists
  useEffect(() => {
    const verifyPartnership = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          toast.error('You need to be logged in');
          return;
        }

        // Directly verify the partnership exists
        const response = await axios.get(
          `http://localhost:5000/api/partnerships/${partnershipId}`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        
        if (response.data) {
          console.log('Partnership verified:', response.data);
          setPartnershipVerified(true);
        }
      } catch (err) {
        console.error('Error verifying partnership:', err);
        toast.error('Cannot verify partnership existence');
      }
    };

    if (partnershipId) {
      verifyPartnership();
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
      
      // Use the full URL instead of relying on proxy
      const response = await axios.post(
        `http://localhost:5000/api/wallet/escrow/release/${partnershipId}`,
        { 
          isSuccess, 
          description: description || `Funds ${isSuccess ? 'returned' : 'forfeited'} for completed agreement` 
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

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
      
      // Check if the error is about insufficient funds
      if (err.response?.data?.message && err.response.data.message.includes('Insufficient funds in escrow')) {
        toast.error('These funds have already been released. The agreement is completed.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to process escrow release');
      }
    }
  };

  return (
    <div className="escrow-release-form card">
      <h3>Complete Agreement</h3>
      <p>Release funds from escrow based on agreement outcome</p>
      
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
          disabled={loading || !partnershipVerified}
        >
          {loading ? 'Processing...' : partnershipVerified ? 'Complete Agreement' : 'Verifying Partnership...'}
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