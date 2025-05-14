import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Chat from '../components/Chat';

const ChatPage = () => {
  const { partnershipId } = useParams();
  const navigate = useNavigate();
  const [partnership, setPartnership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnership = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          toast.error('You need to be logged in');
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/partnerships/${partnershipId}`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        setPartnership(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching partnership:', error);
        toast.error('Failed to load partnership details');
        navigate('/partnerships');
      }
    };

    fetchPartnership();
  }, [partnershipId, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Chat with Partner</h2>
        <p>Partnership ID: {partnershipId}</p>
      </div>
      <div className="chat-wrapper">
        <Chat partnershipId={partnershipId} />
      </div>
    </div>
  );
};

export default ChatPage; 