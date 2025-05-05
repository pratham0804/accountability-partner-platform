import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Partnerships = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchPartnerships = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/partnerships', config);
        setPartnerships(data);
        setIsLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load partnerships'
        );
        setIsLoading(false);
      }
    };

    fetchPartnerships();
  }, [navigate]);

  const handleAcceptRequest = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/partnerships/${id}/accept`, {}, config);
      
      // Update the partnership in the state
      setPartnerships(partnerships.map(p => 
        p._id === id ? { ...p, status: 'accepted' } : p
      ));
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to accept request'
      );
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/partnerships/${id}/reject`, {}, config);
      
      // Update the partnership in the state
      setPartnerships(partnerships.map(p => 
        p._id === id ? { ...p, status: 'rejected' } : p
      ));
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to reject request'
      );
    }
  };

  // Filter partnerships based on active tab
  const filteredPartnerships = partnerships.filter(partnership => {
    if (activeTab === 'pending') {
      return partnership.status === 'pending';
    } else if (activeTab === 'active') {
      return partnership.status === 'accepted';
    } else {
      return partnership.status === 'rejected' || partnership.status === 'completed' || partnership.status === 'cancelled';
    }
  });

  // Determine if user is requester or recipient
  const getUserRole = (partnership) => {
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    return partnership.requester._id === userId ? 'requester' : 'recipient';
  };

  // Get partner info
  const getPartnerInfo = (partnership) => {
    const userRole = getUserRole(partnership);
    return userRole === 'requester' ? partnership.recipient : partnership.requester;
  };

  if (isLoading) {
    return <div className="loading">Loading partnerships...</div>;
  }

  return (
    <div className="partnerships-container">
      <section className="partnerships-header">
        <h1>Your Partnerships</h1>
        <p>Manage your accountability partner relationships</p>
      </section>

      {error && <div className="error-message">{error}</div>}

      <div className="partnerships-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} 
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`} 
          onClick={() => setActiveTab('active')}
        >
          Active Partnerships
        </button>
        <button 
          className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} 
          onClick={() => setActiveTab('past')}
        >
          Past Partnerships
        </button>
      </div>

      {filteredPartnerships.length === 0 ? (
        <div className="no-partnerships">
          <p>
            {activeTab === 'pending' 
              ? 'No pending partnership requests' 
              : activeTab === 'active' 
                ? 'No active partnerships' 
                : 'No past partnerships'}
          </p>
        </div>
      ) : (
        <div className="partnerships-grid">
          {filteredPartnerships.map((partnership) => {
            const userRole = getUserRole(partnership);
            const partner = getPartnerInfo(partnership);
            
            return (
              <div key={partnership._id} className="partnership-card">
                <div className="partnership-header">
                  <h3>Partnership with {partner.name}</h3>
                  <span className={`status-badge status-${partnership.status}`}>
                    {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
                  </span>
                </div>
                
                <div className="partnership-body">
                  <div className="partner-info">
                    <h4>Partner Information</h4>
                    <p><strong>Activity Level:</strong> {partner.activityLevel.charAt(0).toUpperCase() + partner.activityLevel.slice(1)}</p>
                    
                    {partner.interests && partner.interests.length > 0 && (
                      <div className="partner-interests">
                        <strong>Interests:</strong>
                        <div className="tag-container">
                          {partner.interests.map((interest, i) => (
                            <div key={i} className="tag">{interest}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {partner.skills && partner.skills.length > 0 && (
                      <div className="partner-skills">
                        <strong>Skills:</strong>
                        <div className="tag-container">
                          {partner.skills.map((skill, i) => (
                            <div key={i} className="tag">{skill}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {partnership.agreement && partnership.agreement.title && (
                    <div className="agreement-info">
                      <h4>Agreement Details</h4>
                      <p><strong>Title:</strong> {partnership.agreement.title}</p>
                      <p><strong>Description:</strong> {partnership.agreement.description}</p>
                      <p>
                        <strong>Duration:</strong> {new Date(partnership.agreement.startDate).toLocaleDateString()} to{' '}
                        {new Date(partnership.agreement.endDate).toLocaleDateString()}
                      </p>
                      {partnership.agreement.financialStake && partnership.agreement.financialStake.amount > 0 && (
                        <p>
                          <strong>Financial Stake:</strong> {partnership.agreement.financialStake.amount}{' '}
                          {partnership.agreement.financialStake.currency}
                        </p>
                      )}
                      
                      {partnership.agreement.goals && partnership.agreement.goals.length > 0 && (
                        <div className="goals">
                          <strong>Goals:</strong>
                          <ul>
                            {partnership.agreement.goals.map((goal, i) => (
                              <li key={i}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="partnership-actions">
                  {partnership.status === 'pending' && userRole === 'recipient' && (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleAcceptRequest(partnership._id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="btn btn-reverse"
                        onClick={() => handleRejectRequest(partnership._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {partnership.status === 'accepted' && (
                    <>
                      {!partnership.agreement || !partnership.agreement.title ? (
                        <Link to={`/partnerships/${partnership._id}/agreement`} className="btn btn-primary">
                          Create Agreement
                        </Link>
                      ) : (
                        <Link to={`/partnerships/${partnership._id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Partnerships; 