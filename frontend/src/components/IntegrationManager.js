import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const IntegrationManager = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/integrations',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setIntegrations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to fetch integrations');
      setLoading(false);
    }
  };

  const connectGithub = async () => {
    // Redirect to GitHub OAuth
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/github-callback`;
    const scope = 'repo';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const disconnectIntegration = async (platform) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/integrations/${platform}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      toast.success(`${platform} integration disconnected successfully`);
      fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast.error('Failed to disconnect integration');
    }
  };

  if (loading) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="integration-manager">
      <h2>Connected Accounts</h2>
      
      <div className="integrations-list">
        {integrations.map((integration) => (
          <div key={integration._id} className="integration-item">
            <div className="integration-info">
              <h3>{integration.platform}</h3>
              <p>Username: {integration.platformUsername}</p>
              <p>Last verified: {new Date(integration.lastVerified).toLocaleString()}</p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => disconnectIntegration(integration.platform)}
            >
              Disconnect
            </button>
          </div>
        ))}
      </div>

      <div className="available-integrations">
        <h3>Available Integrations</h3>
        
        <div className="integration-option">
          <h4>GitHub</h4>
          <p>Connect your GitHub account to automatically verify commits and pull requests</p>
          <button
            className="btn btn-primary"
            onClick={connectGithub}
            disabled={integrations.some(i => i.platform === 'github' && i.isActive)}
          >
            {integrations.some(i => i.platform === 'github' && i.isActive)
              ? 'Connected'
              : 'Connect GitHub'}
          </button>
        </div>

        {/* Add more integration options here */}
      </div>
    </div>
  );
};

export default IntegrationManager; 