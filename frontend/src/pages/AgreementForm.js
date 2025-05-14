import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AgreementForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goals: [''],
    startDate: '',
    endDate: '',
    financialStake: {
      amount: 0,
      currency: 'USD'
    }
  });
  const [partnership, setPartnership] = useState(null);
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
        
        // If agreement already exists, set form data
        if (data.agreement && data.agreement.title) {
          setFormData({
            title: data.agreement.title || '',
            description: data.agreement.description || '',
            goals: data.agreement.goals?.length > 0 ? data.agreement.goals : [''],
            startDate: data.agreement.startDate ? new Date(data.agreement.startDate).toISOString().split('T')[0] : '',
            endDate: data.agreement.endDate ? new Date(data.agreement.endDate).toISOString().split('T')[0] : '',
            financialStake: data.agreement.financialStake || { amount: 0, currency: 'USD' }
          });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFinancialStakeChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      financialStake: {
        ...formData.financialStake,
        [name]: name === 'amount' ? parseFloat(value) : value
      }
    });
  };

  const handleGoalChange = (index, value) => {
    const updatedGoals = [...formData.goals];
    updatedGoals[index] = value;
    setFormData({
      ...formData,
      goals: updatedGoals
    });
  };

  const addGoalField = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, '']
    });
  };

  const removeGoalField = (index) => {
    if (formData.goals.length > 1) {
      const updatedGoals = formData.goals.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        goals: updatedGoals
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Create the agreement
      const agreementResponse = await axios.put(
        `/api/partnerships/${id}/agreement`,
        formData,
        config
      );

      console.log('Agreement created:', agreementResponse.data);
      
      // If financial stake is added, automatically transfer to escrow
      if (formData.financialStake && formData.financialStake.amount > 0) {
        try {
          console.log('Transferring funds to escrow:', formData.financialStake.amount);
          
          const escrowResponse = await axios.post(
            `http://localhost:5000/api/wallet/escrow/${id}`,
            { amount: formData.financialStake.amount },
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );
          
          console.log('Escrow transfer successful:', escrowResponse.data);
          toast.success(`Successfully staked $${formData.financialStake.amount} in escrow`);
        } catch (escrowError) {
          console.error('Error transferring to escrow:', escrowError);
          
          if (escrowError.response?.data?.message === 'Insufficient funds') {
            toast.error('Could not stake funds. Insufficient balance in your wallet.');
          } else {
            toast.error('Agreement created but could not transfer funds to escrow. Please use the dashboard to complete this step.');
          }
        }
      }

      toast.success('Partnership agreement created successfully');
      navigate(`/partnerships/${id}`);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to create agreement'
      );
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="agreement-form-container">
      <section className="agreement-form-header">
        <h1>Create Partnership Agreement</h1>
        <p>Establish terms and goals with {partner?.name}</p>
      </section>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="agreement-form">
        <div className="form-section">
          <h3>Agreement Details</h3>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Daily Exercise Partnership"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose and expectations of this partnership"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Goals</label>
            {formData.goals.map((goal, index) => (
              <div key={index} className="goal-input">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  placeholder="e.g., Exercise 30 minutes daily"
                  required={index === 0}
                />
                <button 
                  type="button" 
                  className="btn-icon remove"
                  onClick={() => removeGoalField(index)}
                  disabled={formData.goals.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-small"
              onClick={addGoalField}
            >
              Add Goal
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Duration</h3>
          <div className="date-inputs">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Financial Stake (Optional)</h3>
          <p className="help-text">Set an amount to commit to this agreement. This represents what you stand to lose if you don't meet your goals.</p>
          
          <div className="financial-stake-inputs">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.financialStake.amount}
                onChange={handleFinancialStakeChange}
                min="0"
                step="1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.financialStake.currency}
                onChange={handleFinancialStakeChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group submit-section">
          <button type="submit" className="btn btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Agreement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgreementForm; 