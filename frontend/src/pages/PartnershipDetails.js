import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PartnershipDetails = () => {
  const [partnership, setPartnership] = useState(null);
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchPartnership = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(`/api/partnerships/${id}`, config);
        setPartnership(data);
        
        // Determine who is the partner
        const userId = userInfo._id;
        if (data.requester._id === userId) {
          setPartner(data.recipient);
        } else {
          setPartner(data.requester);
        }
        
        setIsLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load partnership details'
        );
        setIsLoading(false);
      }
    };

    fetchPartnership();
  }, [id, navigate]);

  if (isLoading) {
    return <div className="loading">Loading partnership details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!partnership) {
    return <div className="not-found">Partnership not found</div>;
  }

  return (
    <div className="partnership-details-container">
      <section className="partnership-details-header">
        <div className="header-content">
          <h1>Partnership with {partner?.name}</h1>
          <span className={`status-badge status-${partnership.status}`}>
            {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
          </span>
        </div>
        <Link to="/partnerships" className="btn btn-reverse">Back to Partnerships</Link>
      </section>

      <div className="partnership-details-content">
        <div className="card partner-card">
          <h2>Partner Information</h2>
          <div className="partner-info">
            <p><strong>Name:</strong> {partner?.name}</p>
            <p><strong>Activity Level:</strong> {partner?.activityLevel.charAt(0).toUpperCase() + partner?.activityLevel.slice(1)}</p>
            
            {partner?.interests && partner.interests.length > 0 && (
              <div className="partner-interests">
                <strong>Interests:</strong>
                <div className="tag-container">
                  {partner.interests.map((interest, i) => (
                    <div key={i} className="tag">{interest}</div>
                  ))}
                </div>
              </div>
            )}
            
            {partner?.skills && partner.skills.length > 0 && (
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
        </div>

        {partnership.agreement && partnership.agreement.title ? (
          <div className="card agreement-card">
            <h2>Agreement Details</h2>
            <div className="agreement-details">
              <div className="agreement-header">
                <h3>{partnership.agreement.title}</h3>
                <div className="agreement-dates">
                  <span>{new Date(partnership.agreement.startDate).toLocaleDateString()}</span>
                  <span> to </span>
                  <span>{new Date(partnership.agreement.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <p className="agreement-description">{partnership.agreement.description}</p>
              
              {partnership.agreement.goals && partnership.agreement.goals.length > 0 && (
                <div className="agreement-goals">
                  <h4>Goals:</h4>
                  <ul className="goals-list">
                    {partnership.agreement.goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {partnership.agreement.financialStake && partnership.agreement.financialStake.amount > 0 && (
                <div className="financial-stake">
                  <h4>Financial Stake:</h4>
                  <p>
                    {partnership.agreement.financialStake.amount} {partnership.agreement.financialStake.currency}
                  </p>
                </div>
              )}

              <div className="agreement-created">
                <p>Agreement created on {new Date(partnership.agreement.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="agreement-actions">
              <Link to={`/partnerships/${id}/agreement`} className="btn">
                Edit Agreement
              </Link>
            </div>
          </div>
        ) : (
          <div className="card agreement-card">
            <h2>No Agreement Yet</h2>
            <p>You haven't established an agreement for this partnership yet.</p>
            <Link to={`/partnerships/${id}/agreement`} className="btn btn-primary">
              Create Agreement
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnershipDetails; 