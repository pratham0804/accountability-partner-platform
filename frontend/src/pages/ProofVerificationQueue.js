import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProofVerification from '../components/ProofVerification';

const ProofVerificationQueue = () => {
  const [pendingProofs, setPendingProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  
  useEffect(() => {
    fetchPendingProofs();
  }, []);
  
  const fetchPendingProofs = async () => {
    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
        setError('You need to be logged in');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        'http://localhost:5000/api/proofs/pending',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setPendingProofs(response.data);
      setLoading(false);
      
      // Auto-select the first proof if any exist
      if (response.data.length > 0 && !selectedProof) {
        setSelectedProof(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching pending proofs:', error);
      setError(error.response?.data?.message || 'Failed to load pending proofs');
      setLoading(false);
    }
  };
  
  const handleProofSelect = (proof) => {
    setSelectedProof(proof);
  };
  
  const handleVerificationComplete = (updatedProof) => {
    // Remove the verified proof from the pending list
    setPendingProofs(pendingProofs.filter(proof => proof._id !== updatedProof._id));
    
    // Select another proof if available
    if (pendingProofs.length > 1) {
      const nextProof = pendingProofs.find(proof => proof._id !== updatedProof._id);
      setSelectedProof(nextProof);
    } else {
      setSelectedProof(null);
    }
  };

  // Prevent event propagation when clicking the View Task button
  const handleViewTaskClick = (e) => {
    e.stopPropagation();
  };
  
  if (loading) {
    return <div className="loading">Loading verification queue...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="verification-queue-page">
      <div className="page-header">
        <h1>Proof Verification Queue</h1>
        <div className="refresh-control">
          <button 
            className="btn btn-small"
            onClick={fetchPendingProofs}
          >
            Refresh Queue
          </button>
        </div>
      </div>
      
      {pendingProofs.length === 0 ? (
        <div className="empty-state">
          <h2>No Proofs Pending Verification</h2>
          <p>There are currently no task completion proofs waiting for your verification.</p>
          <Link to="/my-tasks" className="btn btn-primary">View Tasks</Link>
        </div>
      ) : (
        <div className="verification-queue-content">
          <div className="verification-sidebar">
            <h3>Pending Verifications ({pendingProofs.length})</h3>
            <div className="proof-list">
              {pendingProofs.map(proof => (
                <div 
                  key={proof._id} 
                  className={`proof-item ${selectedProof?._id === proof._id ? 'selected' : ''}`}
                  onClick={() => handleProofSelect(proof)}
                >
                  <div className="proof-item-header">
                    <span className="proof-task-title">{proof.task.title}</span>
                    <span className="proof-type">{proof.proofType}</span>
                  </div>
                  <div className="proof-item-meta">
                    <span className="proof-submitter">By {proof.submitter.name}</span>
                    <span className="proof-date">
                      {new Date(proof.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="proof-item-actions">
                    <Link 
                      to={`/tasks/${proof.task._id}`} 
                      className="btn btn-small"
                      onClick={handleViewTaskClick}
                    >
                      View Task
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="verification-main">
            {selectedProof ? (
              <ProofVerification 
                proof={selectedProof} 
                onVerificationComplete={handleVerificationComplete} 
              />
            ) : (
              <div className="select-proof-prompt">
                <p>Select a proof from the list to review</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofVerificationQueue; 