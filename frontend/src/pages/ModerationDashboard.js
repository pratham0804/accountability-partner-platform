import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ModerationDashboard.css';

const ModerationDashboard = () => {
  const [moderations, setModerations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    violationType: '',
    penaltyApplied: '',
    notificationSent: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    console.log('User info:', userInfo);
    console.log('Is admin?', userInfo?.isAdmin);
    
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      toast.error('Admin access required');
      return;
    }
    
    fetchModerations();
    fetchStats();
  }, [page, filter, navigate]);

  const fetchModerations = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      // Build query params
      let queryParams = `page=${page}`;
      if (filter.violationType) queryParams += `&violationType=${filter.violationType}`;
      if (filter.penaltyApplied !== '') queryParams += `&penaltyApplied=${filter.penaltyApplied}`;
      if (filter.notificationSent !== '') queryParams += `&notificationSent=${filter.notificationSent}`;
      
      const response = await axios.get(
        `http://localhost:5000/api/moderation?${queryParams}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setModerations(response.data.moderations);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching moderation records:', error);
      setError('Failed to load moderation data');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.get(
        'http://localhost:5000/api/moderation/stats',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching moderation stats:', error);
      // Don't set error state here as this is non-critical
    }
  };

  const handleApplyPenalty = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      await axios.post(
        `http://localhost:5000/api/moderation/${id}/apply-penalty`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      toast.success('Penalty applied successfully');
      
      // Update the local state
      setModerations(moderations.map(mod => 
        mod._id === id ? { ...mod, penaltyApplied: true } : mod
      ));
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error applying penalty:', error);
      toast.error(error.response?.data?.message || 'Failed to apply penalty');
    }
  };

  const handleSendNotification = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      await axios.post(
        `http://localhost:5000/api/moderation/${id}/notify`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      toast.success('Notification sent successfully');
      
      // Update the local state
      setModerations(moderations.map(mod => 
        mod._id === id ? { ...mod, notificationSent: true } : mod
      ));
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setPage(1); // Reset to first page when filter changes
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !moderations.length) {
    return <div className="loading">Loading moderation data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchModerations} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="moderation-dashboard">
      <h1>Content Moderation Dashboard</h1>
      
      {stats && (
        <div className="stats-section">
          <h2>Moderation Statistics</h2>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Moderations</h3>
              <p className="stat-value">{stats.totalModerations}</p>
            </div>
            <div className="stat-card">
              <h3>Penalties Applied</h3>
              <p className="stat-value">{stats.penaltyApplied}</p>
            </div>
            <div className="stat-card">
              <h3>Notifications Sent</h3>
              <p className="stat-value">{stats.notificationSent}</p>
            </div>
          </div>
          
          <h3>Violation Types</h3>
          <div className="violation-stats">
            {stats.violationStats.map(stat => (
              <div key={stat._id} className="violation-stat">
                <strong>{stat._id}:</strong> {stat.count} violations (${stat.totalPenalties} in penalties)
              </div>
            ))}
          </div>
          
          {stats.topViolators.length > 0 && (
            <>
              <h3>Top Users with Violations</h3>
              <div className="violators-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Violations</th>
                      <th>Total Penalties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topViolators.map(violator => (
                      <tr key={violator._id}>
                        <td>{violator.userInfo.name}</td>
                        <td>{violator.count}</td>
                        <td>${violator.totalPenalties}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="filter-section">
        <h2>Filter Moderation Records</h2>
        <div className="filters">
          <div className="filter-group">
            <label>Violation Type:</label>
            <select 
              name="violationType" 
              value={filter.violationType} 
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="personal_info">Personal Information</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="external_contact">External Contact</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Penalty Applied:</label>
            <select 
              name="penaltyApplied" 
              value={filter.penaltyApplied} 
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Notification Sent:</label>
            <select 
              name="notificationSent" 
              value={filter.notificationSent} 
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="moderation-list">
        <h2>Moderation Records</h2>
        
        {moderations.length === 0 ? (
          <p>No moderation records found matching the filters.</p>
        ) : (
          <>
            <table className="moderation-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Violation Type</th>
                  <th>Original Content</th>
                  <th>Filtered Content</th>
                  <th>Date</th>
                  <th>Penalty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {moderations.map(moderation => (
                  <tr key={moderation._id}>
                    <td>{moderation.user?.name || 'Unknown'}</td>
                    <td className={`violation-type ${moderation.violationType}`}>
                      {moderation.violationType.replace('_', ' ')}
                    </td>
                    <td className="content-cell">{moderation.originalContent}</td>
                    <td className="content-cell">{moderation.filteredContent}</td>
                    <td>{formatDate(moderation.createdAt)}</td>
                    <td>${moderation.penaltyAmount}</td>
                    <td className="actions-cell">
                      {!moderation.penaltyApplied && (
                        <button 
                          onClick={() => handleApplyPenalty(moderation._id)}
                          className="btn btn-warning"
                        >
                          Apply Penalty
                        </button>
                      )}
                      {!moderation.notificationSent && (
                        <button 
                          onClick={() => handleSendNotification(moderation._id)}
                          className="btn btn-info"
                        >
                          Send Notification
                        </button>
                      )}
                      {moderation.penaltyApplied && moderation.notificationSent && (
                        <span className="resolved">✓ Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="pagination">
              <button 
                onClick={() => setPage(page => Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(page => Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModerationDashboard; 