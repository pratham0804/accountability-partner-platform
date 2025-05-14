import React from 'react';

const ChatMessage = ({ message, isOwnMessage }) => {
  const messageClass = isOwnMessage ? 'own' : 'other';
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Check if message was filtered
  const isFiltered = message.isFiltered;
  
  return (
    <div className={`chat-message ${messageClass} ${isFiltered ? 'filtered-message' : ''}`}>
      {!isOwnMessage && (
        <div className="message-sender">{message.sender.name}</div>
      )}
      
      <div className="message-content">
        {message.content}
      </div>
      
      {isFiltered && (
        <div className="filtered-reason">
          {message.filterReason === 'personal_info' && 'Personal information was removed'}
          {message.filterReason === 'inappropriate' && 'Inappropriate content was filtered'}
          {message.filterReason === 'external_contact' && 'External contact information was removed'}
        </div>
      )}
      
      <div className="message-time">{formattedTime}</div>
    </div>
  );
};

export default ChatMessage; 