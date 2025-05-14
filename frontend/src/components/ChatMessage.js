import React, { useState } from 'react';

const ChatMessage = ({ message, isOwnMessage }) => {
  const [showDetails, setShowDetails] = useState(false);
  const messageClass = isOwnMessage ? 'own' : 'other';
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Check if message was filtered
  const isFiltered = message.isFiltered;
  
  // Get explanation text based on filter reason
  const getFilterExplanation = (reason) => {
    switch(reason) {
      case 'personal_info':
        return 'Your message contained personal information (email, phone, etc.) which was automatically removed for safety.';
      case 'inappropriate':
        return 'Your message contained inappropriate language which was automatically filtered.';
      case 'external_contact':
        return 'External contact attempts or links were removed for platform safety.';
      default:
        return 'Content was filtered according to platform guidelines.';
    }
  };
  
  // Get warning level class based on filter reason
  const getWarningClass = (reason) => {
    switch(reason) {
      case 'personal_info':
        return 'high-warning';
      case 'inappropriate':
        return 'medium-warning';
      case 'external_contact':
        return 'low-warning';
      default:
        return '';
    }
  };
  
  // Get penalty amount information based on filter reason
  const getPenaltyInfo = (reason) => {
    switch(reason) {
      case 'personal_info':
        return 'Sharing personal information carries a $5.00 penalty.';
      case 'inappropriate':
        return 'Using inappropriate language carries a $3.00 penalty.';
      case 'external_contact':
        return 'Attempting external contact carries a $2.00 penalty.';
      default:
        return 'Content violations may result in financial penalties.';
    }
  };
  
  return (
    <div className={`chat-message ${messageClass} ${isFiltered ? 'filtered-message' : ''}`}>
      {!isOwnMessage && (
        <div className="message-sender">{message.sender.name}</div>
      )}
      
      <div className="message-content">
        {message.content}
      </div>
      
      {isFiltered && (
        <div className={`filtered-notice ${getWarningClass(message.filterReason)}`}>
          <div className="filter-header" onClick={() => setShowDetails(!showDetails)}>
            <i className="filter-icon">⚠️</i> 
            Content was filtered
            <i className={`details-toggle ${showDetails ? 'open' : 'closed'}`}>
              {showDetails ? '▼' : '▶'}
            </i>
          </div>
          
          {showDetails && (
            <div className="filter-details">
              <p>{getFilterExplanation(message.filterReason)}</p>
              {isOwnMessage && (
                <>
                  <p className="penalty-info">
                    {getPenaltyInfo(message.filterReason)}
                  </p>
                  <p className="penalty-notice">
                    Repeated violations will result in penalties to your wallet balance.
                    This helps maintain a safe environment for all users.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="message-time">{formattedTime}</div>
    </div>
  );
};

export default ChatMessage; 