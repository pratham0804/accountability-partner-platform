import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: [],
    skills: [],
    availableTimes: [],
    activityLevel: 'medium',
    preferredPartnerType: 'any',
    password: '',
    confirmPassword: '',
  });
  const [interestCategories, setInterestCategories] = useState([]);
  const [customInterest, setCustomInterest] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data: userData } = await axios.get('/api/users/profile', config);
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          interests: userData.interests || [],
          skills: userData.skills || [],
          availableTimes: userData.availableTimes || [],
          activityLevel: userData.activityLevel || 'medium',
          preferredPartnerType: userData.preferredPartnerType || 'any',
          password: '',
          confirmPassword: '',
        });

        // Fetch interest categories
        const { data: categoriesData } = await axios.get('/api/users/interests');
        setInterestCategories(categoriesData);
        
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddInterest = (interest) => {
    if (!formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest),
    });
  };

  const handleAddCustomInterest = () => {
    if (customInterest && !formData.interests.includes(customInterest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, customInterest],
      });
      setCustomInterest('');
    }
  };

  const handleAddSkill = (e) => {
    if (customSkill && !formData.skills.includes(customSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, customSkill],
      });
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill),
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Check if password and confirmPassword match
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Prepare data for submission (only include password if it was entered)
    const profileData = { ...formData };
    if (!profileData.password) {
      delete profileData.password;
    }
    delete profileData.confirmPassword;

    try {
      setIsLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put('/api/users/profile', profileData, config);
      
      // Update local storage with new token
      localStorage.setItem('user', JSON.stringify(data));
      
      setSuccessMessage('Profile updated successfully');
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
      setIsLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update profile'
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <section className="profile-header">
        <h1>Your Profile</h1>
        <p>Update your personal information and preferences</p>
      </section>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Interests</h3>
          <div className="interests-grid">
            {interestCategories.map((category) => (
              <div key={category.name} className="interest-category">
                <h4>{category.name}</h4>
                <div className="interest-list">
                  {category.interests.map((interest) => (
                    <div 
                      key={interest} 
                      className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => 
                        formData.interests.includes(interest) 
                          ? handleRemoveInterest(interest) 
                          : handleAddInterest(interest)
                      }
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="customInterest">Add Custom Interest</label>
            <div className="input-with-button">
              <input
                type="text"
                id="customInterest"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Enter custom interest"
              />
              <button 
                type="button" 
                className="btn-small"
                onClick={handleAddCustomInterest}
              >
                Add
              </button>
            </div>
          </div>
          
          {formData.interests.length > 0 && (
            <div className="selected-items">
              <h4>Your Selected Interests</h4>
              <div className="tag-container">
                {formData.interests.map((interest) => (
                  <div key={interest} className="tag">
                    {interest}
                    <span onClick={() => handleRemoveInterest(interest)}>×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Skills</h3>
          <div className="form-group">
            <label htmlFor="customSkill">Add Skill</label>
            <div className="input-with-button">
              <input
                type="text"
                id="customSkill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Enter a skill you have"
              />
              <button 
                type="button" 
                className="btn-small"
                onClick={handleAddSkill}
              >
                Add
              </button>
            </div>
          </div>

          {formData.skills.length > 0 && (
            <div className="selected-items">
              <h4>Your Skills</h4>
              <div className="tag-container">
                {formData.skills.map((skill) => (
                  <div key={skill} className="tag">
                    {skill}
                    <span onClick={() => handleRemoveSkill(skill)}>×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Preferences</h3>
          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
            >
              <option value="low">Low (1-2 tasks per week)</option>
              <option value="medium">Medium (3-5 tasks per week)</option>
              <option value="high">High (6+ tasks per week)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="preferredPartnerType">Preferred Partner Type</label>
            <select
              id="preferredPartnerType"
              name="preferredPartnerType"
              value={formData.preferredPartnerType}
              onChange={handleChange}
            >
              <option value="same-level">Same experience level as me</option>
              <option value="more-experienced">More experienced than me</option>
              <option value="less-experienced">Less experienced than me</option>
              <option value="any">Any experience level</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Change Password (Optional)</h3>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className="form-group submit-section">
          <button type="submit" className="btn btn-block" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile; 