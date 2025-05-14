import React, { useState } from 'react';
import { toast } from 'react-toastify';

const EscrowGuide = ({ onClose }) => {
  const [step, setStep] = useState(1);
  
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onClose();
      toast.success('You\'re ready to use the escrow system!');
    }
  };
  
  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="escrow-guide-overlay">
      <div className="escrow-guide-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className="line"></div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>4</div>
        </div>
        
        {step === 1 && (
          <div className="guide-content">
            <h2>Step 1: Create an Agreement</h2>
            <p>First, you and your partner need to agree on terms for your accountability partnership.</p>
            <div className="guide-image">
              <img src="/images/agreement.png" alt="Create Agreement" />
            </div>
            <p>Include specific goals, timelines, and the amount you want to stake as a financial incentive.</p>
          </div>
        )}
        
        {step === 2 && (
          <div className="guide-content">
            <h2>Step 2: Add Funds to Your Wallet</h2>
            <p>Before you can stake funds, you need to have money in your wallet.</p>
            <div className="guide-image">
              <img src="/images/wallet.png" alt="Deposit Funds" />
            </div>
            <p>Use the "Quick Add $50" button or go to your wallet page to add funds. This is just a simulation - no real money is used.</p>
          </div>
        )}
        
        {step === 3 && (
          <div className="guide-content">
            <h2>Step 3: Transfer to Escrow</h2>
            <p>Once you have funds in your wallet, transfer your stake to escrow as a commitment.</p>
            <div className="guide-image">
              <img src="/images/escrow.png" alt="Transfer to Escrow" />
            </div>
            <p>These funds will be locked until the agreement is completed. You can't withdraw them until then.</p>
          </div>
        )}
        
        {step === 4 && (
          <div className="guide-content">
            <h2>Step 4: Complete the Agreement</h2>
            <p>When your agreement period ends, you can mark it as completed.</p>
            <div className="guide-image">
              <img src="/images/complete.png" alt="Complete Agreement" />
            </div>
            <p>If you met your goals, the funds will be returned to your wallet. If not, they will be forfeited as per your agreement.</p>
          </div>
        )}
        
        <div className="guide-nav">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={handlePrev}>Previous</button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {step < 4 ? 'Next' : 'Got It!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscrowGuide; 