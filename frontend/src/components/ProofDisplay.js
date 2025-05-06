import React from 'react';
import { format } from 'date-fns';

const ProofDisplay = ({ proof }) => {
  if (!proof) {
    return null;
  }

  const renderProofContent = () => {
    switch (proof.proofType) {
      case 'image':
        return (
          <div className="proof-image">
            <img src={proof.content} alt="Proof" />
          </div>
        );
      case 'link':
        return (
          <div className="proof-link">
            <a href={proof.content} target="_blank" rel="noopener noreferrer">
              {proof.content}
            </a>
          </div>
        );
      case 'file':
        return (
          <div className="proof-file">
            <strong>File Reference:</strong> {proof.content}
          </div>
        );
      case 'text':
      default:
        return (
          <div className="proof-text">
            <p>{proof.content}</p>
          </div>
        );
    }
  };

  const getStatusClassName = () => {
    switch (proof.verificationStatus) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  return (
    <div className={`proof-display ${getStatusClassName()}`}>
      <div className="proof-header">
        <h3>
          Proof of Completion
          <span className={`proof-status ${getStatusClassName()}`}>
            {proof.verificationStatus.charAt(0).toUpperCase() + proof.verificationStatus.slice(1)}
          </span>
        </h3>
        <div className="proof-meta">
          <p>
            <strong>Type:</strong> {proof.proofType.charAt(0).toUpperCase() + proof.proofType.slice(1)}
          </p>
          <p>
            <strong>Submitted:</strong> {format(new Date(proof.createdAt), 'PPP')}
          </p>
          {proof.verifiedAt && (
            <p>
              <strong>{proof.verificationStatus === 'approved' ? 'Verified' : 'Reviewed'}:</strong> {format(new Date(proof.verifiedAt), 'PPP')}
            </p>
          )}
        </div>
      </div>

      <div className="proof-content">
        <h4>Submission</h4>
        {renderProofContent()}
      </div>

      {proof.additionalNotes && (
        <div className="proof-notes">
          <h4>Additional Notes</h4>
          <p>{proof.additionalNotes}</p>
        </div>
      )}

      {proof.verificationStatus !== 'pending' && (
        <div className="verification-details">
          <h4>Verification Details</h4>
          {proof.verificationStatus === 'approved' && proof.verificationComment && (
            <div className="verification-comment">
              <strong>Verifier Comment:</strong>
              <p>{proof.verificationComment}</p>
            </div>
          )}
          
          {proof.verificationStatus === 'rejected' && proof.rejectionReason && (
            <div className="rejection-reason">
              <strong>Reason for Rejection:</strong>
              <p>{proof.rejectionReason}</p>
            </div>
          )}
          
          {proof.verifier && (
            <p className="verifier">
              <strong>Verified by:</strong> {proof.verifier.name || 'Unknown'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProofDisplay; 