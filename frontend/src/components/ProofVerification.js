import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProofDisplay from './ProofDisplay';

const ProofVerification = ({ proof, onVerificationComplete }) => {
  const [verificationComment, setVerificationComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!proof) {
    return null;
  }

  const handleApprove = async () => {
    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/proofs/${proof._id}/verify`,
        { verificationComment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setLoading(false);
      toast.success('Proof approved successfully');
      
      if (onVerificationComplete) {
        onVerificationComplete(response.data);
      }
    } catch (error) {
      console.error('Error approving proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to approve proof');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/proofs/${proof._id}/reject`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setLoading(false);
      toast.info('Proof rejected');
      
      if (onVerificationComplete) {
        onVerificationComplete(response.data);
      }
    } catch (error) {
      console.error('Error rejecting proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to reject proof');
    }
  };

  // Don't show verification controls if proof is already verified or rejected
  if (proof.verificationStatus !== 'pending') {
    return <ProofDisplay proof={proof} />;
  }

  return (
    <div className="proof-verification">
      <ProofDisplay proof={proof} />
      
      <div className="verification-controls">
        <h3>Verify Proof</h3>
        
        {!showRejectionForm ? (
          <div className="approval-form">
            <div className="form-group">
              <label htmlFor="verificationComment">Verification Comment (Optional)</label>
              <textarea
                id="verificationComment"
                value={verificationComment}
                onChange={(e) => setVerificationComment(e.target.value)}
                placeholder="Add a comment for the proof submitter..."
                rows={2}
              />
            </div>
            
            <div className="button-group">
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Approve Proof'}
              </button>
              
              <button
                className="btn btn-danger"
                onClick={() => setShowRejectionForm(true)}
                disabled={loading}
              >
                Reject Proof
              </button>
            </div>
          </div>
        ) : (
          <form className="rejection-form" onSubmit={handleReject}>
            <div className="form-group">
              <label htmlFor="rejectionReason">Reason for Rejection*</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this proof is being rejected..."
                rows={3}
                required
              />
            </div>
            
            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectionForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Submit Rejection'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProofVerification; 