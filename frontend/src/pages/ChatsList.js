import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatsList = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          toast.error('You need to be logged in');
          navigate('/login');
          return;
        }

        const response = await axios.get(
          'http://localhost:5000/api/partnerships',
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        // Only include partnerships with 'accepted' status
        const acceptedPartnerships = response.data.filter(
          partnership => partnership.status === 'accepted'
        );
        
        setPartnerships(acceptedPartnerships);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching partnerships:', error);
        toast.error('Failed to load partnerships');
        setLoading(false);
      }
    };

    fetchPartnerships();
  }, [navigate]);

  const getUserRole = (partnership) => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (!userInfo) return null;
    
    if (partnership.requester._id === userInfo._id) {
      return { role: 'requester', partner: partnership.recipient };
    } else {
      return { role: 'recipient', partner: partnership.requester };
    }
  };

  if (loading) {
    return <div className="loading">Loading chats...</div>;
  }

  if (partnerships.length === 0) {
    return (
      <div className="no-chats">
        <h2>No Chats Available</h2>
        <p>You don't have any active partnerships to chat with.</p>
        <Link to="/matches" className="btn btn-primary">Find Partners</Link>
      </div>
    );
  }

  return (
    <div className="chats-list-container">
      <h1>My Chats</h1>
      
      <div className="chats-list">
        {partnerships.map(partnership => {
          const { partner } = getUserRole(partnership);
          
          return (
            <div key={partnership._id} className="chat-item">
              <div className="partner-info">
                <h3>{partner.name}</h3>
                <div className="partner-interests">
                  {partner.interests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="tag">{interest}</span>
                  ))}
                  {partner.interests.length > 3 && <span className="tag">+{partner.interests.length - 3} more</span>}
                </div>
              </div>
              
              <div className="chat-actions">
                <Link 
                  to={`/partnerships/${partnership._id}/chat`} 
                  className="btn btn-primary"
                >
                  Open Chat
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatsList; 