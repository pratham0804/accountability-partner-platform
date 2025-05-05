import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchMatches = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/matches', config);
        setMatches(data);
        setIsLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load potential matches'
        );
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  const handleSendRequest = (matchIndex) => {
    // This will be implemented in the next phase (Partnership Formation)
    alert('Partnership request feature will be implemented in the next phase');
  };

  if (isLoading) {
    return <div className="loading">Loading potential matches...</div>;
  }

  return (
    <div className="matches-container">
      <section className="matches-header">
        <h1>Potential Accountability Partners</h1>
        <p>Find partners with similar interests and goals</p>
      </section>

      {error && <div className="error-message">{error}</div>}

      {matches.length === 0 ? (
        <div className="no-matches">
          <p>No potential matches found. Try updating your profile with more interests and skills.</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <div className="match-header">
                <div className="compatibility">
                  <div 
                    className="compatibility-circle" 
                    style={{ 
                      background: `conic-gradient(#4f46e5 ${match.compatibilityPercentage}%, #e5e7eb 0)` 
                    }}
                  >
                    <span>{match.compatibilityPercentage}%</span>
                  </div>
                  <span>Compatibility</span>
                </div>
              </div>
              
              <div className="match-details">
                <div className="match-section">
                  <h3>Activity Level</h3>
                  <p className="activity-level">{match.activityLevel.charAt(0).toUpperCase() + match.activityLevel.slice(1)}</p>
                </div>
                
                {match.matchingInterests.length > 0 && (
                  <div className="match-section">
                    <h3>Matching Interests ({match.totalMatchingInterests})</h3>
                    <div className="tag-container">
                      {match.matchingInterests.map((interest, i) => (
                        <div key={i} className="tag interest-tag">{interest}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {match.matchingSkills.length > 0 && (
                  <div className="match-section">
                    <h3>Matching Skills ({match.totalMatchingSkills})</h3>
                    <div className="tag-container">
                      {match.matchingSkills.map((skill, i) => (
                        <div key={i} className="tag skill-tag">{skill}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="match-section">
                  <h3>All Interests</h3>
                  <div className="tag-container">
                    {match.interests.map((interest, i) => (
                      <div 
                        key={i} 
                        className={`tag ${match.matchingInterests.includes(interest) ? 'interest-tag' : 'other-tag'}`}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="match-section">
                  <h3>All Skills</h3>
                  <div className="tag-container">
                    {match.skills.map((skill, i) => (
                      <div 
                        key={i} 
                        className={`tag ${match.matchingSkills.includes(skill) ? 'skill-tag' : 'other-tag'}`}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="match-actions">
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => handleSendRequest(index)}
                >
                  Request Partnership
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches; 