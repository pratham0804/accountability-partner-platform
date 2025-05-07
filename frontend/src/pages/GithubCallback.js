import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const GithubCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        toast.error('No authorization code received from GitHub');
        navigate('/profile');
        return;
      }

      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          toast.error('You need to be logged in');
          navigate('/login');
          return;
        }

        await axios.post(
          'http://localhost:5000/api/integrations/github/connect',
          { code },
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        toast.success('GitHub account connected successfully');
        navigate('/profile');
      } catch (error) {
        console.error('Error connecting GitHub account:', error);
        toast.error('Failed to connect GitHub account');
        navigate('/profile');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="github-callback">
      <h2>Connecting GitHub Account...</h2>
      <p>Please wait while we connect your GitHub account.</p>
    </div>
  );
};

export default GithubCallback; 