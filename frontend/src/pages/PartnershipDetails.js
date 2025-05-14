import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EscrowFundForm from '../components/EscrowFundForm';
import EscrowReleaseForm from '../components/EscrowReleaseForm';
import EscrowGuide from '../components/EscrowGuide';
import { toast } from 'react-toastify';

const PartnershipDetails = () => {
  const [partnership, setPartnership] = useState(null);
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEscrowForm, setShowEscrowForm] = useState(false);
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [transactionsChecked, setTransactionsChecked] = useState(false);
  const [fundsAlreadyReleased, setFundsAlreadyReleased] = useState(false);
  const [showAddFundsForm, setShowAddFundsForm] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showEscrowGuide, setShowEscrowGuide] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    fetchPartnership();
  }, [id, navigate]);

  // Function to fetch partnership details
  const fetchPartnership = async () => {
    try {
      setIsLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      console.log('Fetching partnership with ID:', id);
      const { data } = await axios.get(`http://localhost:5000/api/partnerships/${id}`, config);
      console.log('Partnership data:', data);
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
      console.error('Error fetching partnership:', error);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load partnership details'
      );
      setIsLoading(false);
    }
  };

  // Check if funds have already been released for this partnership
  useEffect(() => {
    if (!partnership) {
      return;
    }

    const checkTransactions = async () => {
      try {
        setTransactionsChecked(false); // Reset the check flag
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          setTransactionsChecked(true);
          return;
        }

        // Get all transactions to check if release has already happened
        const response = await axios.get(
          `http://localhost:5000/api/wallet/transactions`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        // Look for reward or penalty transactions related to this partnership
        const releaseTransactions = response.data.filter(
          tx => (tx.type === 'reward' || tx.type === 'penalty') && 
                tx.partnership === id
        );

        if (releaseTransactions.length > 0) {
          console.log('Found previous release transactions:', releaseTransactions);
          setFundsAlreadyReleased(true);
        } else {
          setFundsAlreadyReleased(false);
        }
        
        setTransactionsChecked(true);
      } catch (err) {
        console.error('Error checking transactions:', err);
        // Even if there's an error, mark as checked so we don't keep trying
        setTransactionsChecked(true);
      }
    };

    checkTransactions();
  }, [partnership, id]);

  // Add a function to fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          return;
        }
        
        const response = await axios.get(
          'http://localhost:5000/api/wallet',
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        
        if (response.data) {
          setWalletBalance(response.data.balance);
        }
      } catch (err) {
        console.error('Error fetching wallet balance:', err);
      }
    };
    
    fetchWalletBalance();
  }, []);

  // Add a quick deposit function
  const handleQuickDeposit = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }
      
      const amount = 50; // Quick deposit of $50
      
      const response = await axios.post(
        'http://localhost:5000/api/wallet/deposit',
        { amount },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      if (response.data) {
        setWalletBalance(response.data.wallet.balance);
        toast.success(`Added $${amount} to your wallet!`);
      }
    } catch (err) {
      console.error('Error adding funds:', err);
      toast.error('Failed to add funds to wallet');
    }
  };

  const handleFundsTransferred = (data) => {
    // Update the partnership data
    setPartnership(data.partnership);
    // Hide the form
    setShowEscrowForm(false);
    // Refresh the partnership data from server to ensure everything is up-to-date
    fetchPartnership();
  };

  const handleFundsReleased = (data) => {
    // Update the partnership data with the completed status
    setPartnership(data.partnership);
    // Set funds already released to true to immediately update UI
    setFundsAlreadyReleased(true);
    // Hide the form
    setShowReleaseForm(false);
    // Refresh the partnership data from server
    fetchPartnership();
  };

  if (isLoading) {
    return <div className="loading">Loading partnership details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!partnership) {
    return <div className="not-found">Partnership not found</div>;
  }

  // Determine if we can add funds to escrow
  const canAddToEscrow = partnership.status === 'accepted' && 
                         (!partnership.agreement?.financialStake || 
                          partnership.agreement?.financialStake?.amount <= 0);

  // Determine if we can release funds from escrow
  const canReleaseFromEscrow = partnership.status === 'accepted' && 
                              partnership.agreement?.financialStake && 
                              partnership.agreement?.financialStake?.amount > 0 &&
                              !fundsAlreadyReleased;

  // Check for completed partnerships or no escrow balance to prevent multiple fund releases
  const hasEscrowCompleted = partnership.status === 'completed' || fundsAlreadyReleased; // Either partnership is completed or funds already released

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
            <p><strong>Partnership ID:</strong> {id}</p>
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
              
              {canAddToEscrow && (
                <div className="escrow-buttons">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowEscrowForm(true)}
                  >
                    Add Financial Stake
                  </button>
                  <div className="wallet-info">
                    <small>Wallet Balance: ${walletBalance.toFixed(2)}</small>
                    <button 
                      className="btn btn-small" 
                      onClick={handleQuickDeposit}
                    >
                      Quick Add $50
                    </button>
                  </div>
                </div>
              )}
              
              {canReleaseFromEscrow && !hasEscrowCompleted && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowReleaseForm(true)}
                >
                  Complete Agreement
                </button>
              )}
              
              {hasEscrowCompleted && (
                <button 
                  className="btn btn-secondary" 
                  disabled={true}
                >
                  Agreement Completed
                </button>
              )}
            </div>

            {partnership.status === 'accepted' && (
              <div className="partnership-tasks-section">
                <h3>Tasks</h3>
                <p>Manage tasks and track progress with your accountability partner.</p>
                <Link 
                  to={`/partnerships/${id}/tasks`} 
                  className="btn btn-primary"
                >
                  View Tasks
                </Link>
              </div>
            )}

            {partnership.status === 'accepted' && (
              <div className="partnership-chat-section">
                <h3>Communication</h3>
                <p>Chat with your accountability partner in real-time.</p>
                <Link 
                  to={`/partnerships/${id}/chat`} 
                  className="btn btn-secondary"
                >
                  Open Chat
                </Link>
              </div>
            )}
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
        
        {/* Escrow Fund Form */}
        {showEscrowForm && (
          <EscrowFundForm 
            partnershipId={id}
            onFundsTransferred={handleFundsTransferred}
          />
        )}
        
        {/* Escrow Release Form */}
        {showReleaseForm && (
          <EscrowReleaseForm 
            partnershipId={id}
            onFundsReleased={handleFundsReleased}
          />
        )}
        
        {/* Escrow Guide */}
        {showEscrowGuide && (
          <EscrowGuide onClose={() => setShowEscrowGuide(false)} />
        )}
        
        {/* Help Button */}
        <div className="help-button-container">
          <button 
            className="help-button"
            onClick={() => setShowEscrowGuide(true)}
          >
            <span className="help-icon">?</span>
            <span className="help-text">Escrow Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnershipDetails; 