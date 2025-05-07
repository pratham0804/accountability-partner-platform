import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProofSubmission = ({ taskId, onProofSubmitted }) => {
  const [proofType, setProofType] = useState('text');
  const [content, setContent] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubCommitHash, setGithubCommitHash] = useState('');
  const [githubPullRequest, setGithubPullRequest] = useState('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/integrations',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      let proofContent = content;

      // Handle GitHub verification
      if (proofType === 'github') {
        if (!githubRepo) {
          toast.error('Please enter a repository name');
          setLoading(false);
          return;
        }

        if (!githubCommitHash && !githubPullRequest) {
          toast.error('Please enter either a commit hash or pull request number');
          setLoading(false);
          return;
        }

        try {
          const verificationResponse = await axios.post(
            'http://localhost:5000/api/integrations/github/verify',
            {
              repository: githubRepo,
              commitHash: githubCommitHash,
              pullRequestNumber: githubPullRequest
            },
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );

          proofContent = JSON.stringify(verificationResponse.data);
        } catch (error) {
          console.error('Error verifying GitHub activity:', error);
          toast.error('Failed to verify GitHub activity');
          setLoading(false);
          return;
        }
      }

      const response = await axios.post(
        'http://localhost:5000/api/proofs',
        {
          taskId,
          proofType,
          content: proofContent,
          additionalNotes
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setLoading(false);
      toast.success('Proof submitted successfully');
      
      if (onProofSubmitted) {
        onProofSubmitted(response.data);
      }

      // Reset form
      setProofType('text');
      setContent('');
      setAdditionalNotes('');
      setGithubRepo('');
      setGithubCommitHash('');
      setGithubPullRequest('');
    } catch (error) {
      console.error('Error submitting proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    }
  };

  const hasGithubIntegration = integrations.some(
    i => i.platform === 'github' && i.isActive
  );

  return (
    <div className="proof-submission">
      <h3>Submit Proof</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="proofType">Proof Type</label>
          <select
            id="proofType"
            value={proofType}
            onChange={(e) => setProofType(e.target.value)}
            required
          >
            <option value="text">Text Description</option>
            <option value="image">Image</option>
            <option value="link">Link</option>
            <option value="file">File</option>
            {hasGithubIntegration && (
              <option value="github">GitHub Activity</option>
            )}
          </select>
        </div>

        {proofType === 'github' ? (
          <div className="github-verification">
            <div className="form-group">
              <label htmlFor="githubRepo">Repository (owner/repo)</label>
              <input
                type="text"
                id="githubRepo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="e.g., username/repository"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="githubCommitHash">Commit Hash (optional)</label>
              <input
                type="text"
                id="githubCommitHash"
                value={githubCommitHash}
                onChange={(e) => setGithubCommitHash(e.target.value)}
                placeholder="e.g., a1b2c3d4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="githubPullRequest">Pull Request Number (optional)</label>
              <input
                type="number"
                id="githubPullRequest"
                value={githubPullRequest}
                onChange={(e) => setGithubPullRequest(e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="content">Proof Content</label>
            {proofType === 'text' && (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your proof..."
                required
                rows={4}
              />
            )}
            {proofType === 'image' && (
              <input
                type="file"
                id="content"
                accept="image/*"
                onChange={(e) => setContent(e.target.files[0])}
                required
              />
            )}
            {proofType === 'link' && (
              <input
                type="url"
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter URL..."
                required
              />
            )}
            {proofType === 'file' && (
              <input
                type="file"
                id="content"
                onChange={(e) => setContent(e.target.files[0])}
                required
              />
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
          <textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Add any additional context..."
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Proof'}
        </button>
      </form>
    </div>
  );
};

export default ProofSubmission; 