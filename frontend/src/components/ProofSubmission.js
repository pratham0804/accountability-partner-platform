import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProofSubmission = ({ taskId, onProofSubmitted }) => {
  const [formData, setFormData] = useState({
    proofType: 'text',
    content: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingProof, setExistingProof] = useState(null);

  useEffect(() => {
    // Check if there's already a proof for this task
    const fetchExistingProof = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo) return;

        const response = await axios.get(
          `http://localhost:5000/api/proofs/task/${taskId}`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        if (response.data && response.data.length > 0) {
          // Get the most recent proof
          const latestProof = response.data[0];
          setExistingProof(latestProof);
          
          // Pre-fill the form with existing proof data
          setFormData({
            proofType: latestProof.proofType,
            content: latestProof.content,
            additionalNotes: latestProof.additionalNotes || ''
          });
        }
      } catch (error) {
        console.error('Error fetching existing proof:', error);
      }
    };

    if (taskId) {
      fetchExistingProof();
    }
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Please provide the proof content');
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

      const response = await axios.post(
        'http://localhost:5000/api/proofs',
        {
          taskId,
          ...formData
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setLoading(false);
      toast.success(existingProof ? 'Proof updated successfully' : 'Proof submitted successfully');
      
      if (onProofSubmitted) {
        onProofSubmitted(response.data);
      }
      
      // Update the existing proof reference
      setExistingProof(response.data);
    } catch (error) {
      console.error('Error submitting proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    }
  };

  return (
    <div className="proof-submission-form card">
      <h2>{existingProof ? 'Update Proof of Completion' : 'Submit Proof of Completion'}</h2>
      
      {existingProof && existingProof.verificationStatus !== 'pending' && (
        <div className={`proof-status ${existingProof.verificationStatus}`}>
          <p>
            <strong>Status: </strong> 
            {existingProof.verificationStatus.charAt(0).toUpperCase() + existingProof.verificationStatus.slice(1)}
          </p>
          {existingProof.verificationComment && (
            <p>
              <strong>Comment: </strong> 
              {existingProof.verificationComment}
            </p>
          )}
          {existingProof.rejectionReason && (
            <p>
              <strong>Rejection Reason: </strong> 
              {existingProof.rejectionReason}
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="proofType">Proof Type*</label>
          <select
            id="proofType"
            name="proofType"
            value={formData.proofType}
            onChange={handleChange}
            required
          >
            <option value="text">Text Description</option>
            <option value="link">Link/URL</option>
            <option value="image">Image URL</option>
            <option value="file">File Reference</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">
            {formData.proofType === 'text' && 'Description'}
            {formData.proofType === 'link' && 'URL'}
            {formData.proofType === 'image' && 'Image URL'}
            {formData.proofType === 'file' && 'File Reference'}
            *
          </label>
          {formData.proofType === 'text' ? (
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Describe how you completed the task..."
              rows={4}
              required
            />
          ) : (
            <input
              type="text"
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder={
                formData.proofType === 'link' ? 'Enter URL (e.g. https://example.com)' :
                formData.proofType === 'image' ? 'Enter image URL' :
                'Enter file reference'
              }
              required
            />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="additionalNotes">Additional Notes</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Any additional information about your proof..."
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : existingProof ? 'Update Proof' : 'Submit Proof'}
        </button>
      </form>
      
      {existingProof && existingProof.verificationStatus === 'rejected' && (
        <div className="resubmission-note">
          <p>Your previous submission was rejected. Please update your proof based on the feedback provided.</p>
        </div>
      )}
    </div>
  );
};

export default ProofSubmission; 