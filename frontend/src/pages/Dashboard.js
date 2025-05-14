import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import statisticsService from '../utils/statisticsService';
import './Dashboard.css';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getUserStatistics();
        setStatistics(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await statisticsService.refreshStatistics();
      setStatistics(data);
      toast.success('Dashboard statistics refreshed');
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing statistics:', err);
      toast.error('Failed to refresh statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="refresh-btn" onClick={handleRefresh}>
          Refresh Statistics
        </button>
      </div>

      <div className="stats-overview">
        <div className="stats-card task-stats">
          <h2>Task Summary</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Tasks Created</h3>
              <p className="stat-value">{statistics?.tasksCreated || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Tasks Completed</h3>
              <p className="stat-value">{statistics?.tasksCompleted || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Tasks In Progress</h3>
              <p className="stat-value">{statistics?.tasksInProgress || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Completion Rate</h3>
              <p className="stat-value">{(statistics?.taskCompletionRate || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="stats-card partnership-stats">
          <h2>Partnership Summary</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Active Partnerships</h3>
              <p className="stat-value">{statistics?.activeParnerships || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Completed Partnerships</h3>
              <p className="stat-value">{statistics?.completedPartnerships || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Partnerships Initiated</h3>
              <p className="stat-value">{statistics?.partnershipsInitiated || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Partnerships Accepted</h3>
              <p className="stat-value">{statistics?.acceptedPartnerships || 0}</p>
            </div>
          </div>
        </div>

        <div className="stats-card financial-stats">
          <h2>Financial Summary</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Funds Staked</h3>
              <p className="stat-value">${(statistics?.totalFundsStaked || 0).toFixed(2)}</p>
            </div>
            <div className="stat-item">
              <h3>Rewards Earned</h3>
              <p className="stat-value">${(statistics?.totalRewardsEarned || 0).toFixed(2)}</p>
            </div>
            <div className="stat-item">
              <h3>Penalties Incurred</h3>
              <p className="stat-value">${(statistics?.totalPenaltiesIncurred || 0).toFixed(2)}</p>
            </div>
            <div className="stat-item">
              <h3>Net Balance Impact</h3>
              <p className="stat-value">
                ${((statistics?.totalRewardsEarned || 0) - (statistics?.totalPenaltiesIncurred || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="stats-card proof-stats">
          <h2>Proof Summary</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Proofs Submitted</h3>
              <p className="stat-value">{statistics?.proofsSubmitted || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Proofs Verified</h3>
              <p className="stat-value">{statistics?.proofsVerified || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Proofs Rejected</h3>
              <p className="stat-value">{statistics?.proofsRejected || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Verification Rate</h3>
              <p className="stat-value">{(statistics?.proofSuccessRate || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="last-updated">
          Last Updated: {statistics?.lastUpdated ? new Date(statistics.lastUpdated).toLocaleString() : 'Never'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 