import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/users/profile', config);
        setUser(data);
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <section className="welcome-section">
        <h1>Welcome, {user?.name}!</h1>
        <p>This is your accountability partner dashboard</p>
        <button onClick={handleLogout} className="btn btn-reverse">
          Logout
        </button>
      </section>

      <section className="dashboard-content">
        <div className="dashboard-card">
          <h3>Your Profile</h3>
          <p>Complete your profile to find better matches</p>
          <Link to="/profile" className="btn">Update Profile</Link>
        </div>

        <div className="dashboard-card">
          <h3>Find Partners</h3>
          <p>Discover accountability partners with similar interests</p>
          <Link to="/matches" className="btn">Find Partners</Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 