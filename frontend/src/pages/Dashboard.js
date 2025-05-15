import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import statisticsService from '../utils/statisticsService';
import './Dashboard.css';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedIcon from '@mui/icons-material/Verified';
import CircularProgress from '@mui/material/CircularProgress';
import { Tooltip } from '@mui/material';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(true);
      const data = await statisticsService.refreshStatistics();
      setStatistics(data);
      toast.success('Dashboard statistics refreshed');
      setRefreshing(false);
    } catch (err) {
      console.error('Error refreshing statistics:', err);
      toast.error('Failed to refresh statistics');
      setRefreshing(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <CircularProgress size={60} thickness={4} color="primary" />
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="dashboard-error-container"
      >
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="dashboard-page">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="dashboard-container"
      >
        <div className="dashboard-header">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Dashboard
          </motion.h1>
          <Tooltip title="Refresh statistics" arrow>
            <motion.button 
              className="refresh-btn"
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <CircularProgress size={20} color="inherit" thickness={5} className="refresh-spinner" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshIcon className="refresh-icon" />
                  <span>Refresh</span>
                </>
              )}
            </motion.button>
          </Tooltip>
        </div>

        <div className="stats-overview">
          <motion.div 
            className="stats-card task-stats"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card-header">
              <TaskAltIcon className="card-icon" />
              <h2>Task Summary</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Tasks Created</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {statistics?.tasksCreated || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Tasks Completed</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {statistics?.tasksCompleted || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Tasks In Progress</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {statistics?.tasksInProgress || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Completion Rate</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {(statistics?.taskCompletionRate || 0).toFixed(1)}%
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="stats-card partnership-stats"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-header">
              <PeopleAltIcon className="card-icon" />
              <h2>Partnership Summary</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Active Partnerships</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {statistics?.activeParnerships || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Completed Partnerships</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {statistics?.completedPartnerships || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Partnerships Initiated</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {statistics?.partnershipsInitiated || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Partnerships Accepted</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {statistics?.acceptedPartnerships || 0}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="stats-card financial-stats"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card-header">
              <AccountBalanceWalletIcon className="card-icon" />
              <h2>Financial Summary</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Total Funds Staked</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  ${(statistics?.totalFundsStaked || 0).toFixed(2)}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Rewards Earned</h3>
                <motion.p 
                  className="stat-value success-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  ${(statistics?.totalRewardsEarned || 0).toFixed(2)}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Penalties Incurred</h3>
                <motion.p 
                  className="stat-value error-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  ${(statistics?.totalPenaltiesIncurred || 0).toFixed(2)}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Net Balance Impact</h3>
                <motion.p 
                  className={`stat-value ${((statistics?.totalRewardsEarned || 0) - (statistics?.totalPenaltiesIncurred || 0)) >= 0 ? 'success-value' : 'error-value'}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  ${((statistics?.totalRewardsEarned || 0) - (statistics?.totalPenaltiesIncurred || 0)).toFixed(2)}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="stats-card proof-stats"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header">
              <VerifiedIcon className="card-icon" />
              <h2>Proof Summary</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Proofs Submitted</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {statistics?.proofsSubmitted || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Proofs Verified</h3>
                <motion.p 
                  className="stat-value success-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {statistics?.proofsVerified || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Proofs Rejected</h3>
                <motion.p 
                  className="stat-value error-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {statistics?.proofsRejected || 0}
                </motion.p>
              </div>
              <div className="stat-item">
                <h3>Verification Rate</h3>
                <motion.p 
                  className="stat-value"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {(statistics?.proofSuccessRate || 0).toFixed(1)}%
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="dashboard-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <p className="last-updated">
            Last Updated: {statistics?.lastUpdated ? new Date(statistics.lastUpdated).toLocaleString() : 'Never'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 