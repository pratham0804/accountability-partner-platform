import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChatMessage from './ChatMessage';

const Chat = ({ partnershipId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch messages on initial load
  useEffect(() => {
    fetchMessages();
    fetchPartnershipDetails();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [partnershipId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPartnershipDetails = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) return;

      const response = await axios.get(
        `http://localhost:5000/api/partnerships/${partnershipId}`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      const partnership = response.data;
      const userId = userInfo._id;
      
      // Determine who the partner is based on requester/recipient
      const partner = partnership.requester._id === userId 
        ? partnership.recipient 
        : partnership.requester;
      
      setPartnerInfo(partner);
    } catch (error) {
      console.error('Error fetching partnership details:', error);
      setError('Could not load partnership details');
    }
  };

  const fetchMessages = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/messages/partnership/${partnershipId}?limit=100`,
        { 
          headers: { 
            Authorization: `Bearer ${userInfo.token}`
          } 
        }
      );

      // Sort messages by creation date
      const sortedMessages = response.data.messages.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      setMessages(sortedMessages);
      setLoading(false);
      setError(null); // Clear any previous errors

      // Mark unread messages as read
      const unreadMessages = sortedMessages.filter(
        msg => !msg.isRead && msg.sender._id !== userInfo._id
      );
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg._id));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Check if it's a 404 (no messages yet) or other error
      if (error.response?.status === 404) {
        // This is fine - just no messages yet
        setMessages([]);
        setLoading(false);
      } else {
        setError('Failed to load messages. Please try refreshing the page.');
        setLoading(false);
      }
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) return;

      await axios.put(
        'http://localhost:5000/api/messages/read',
        { messageIds },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Non-critical error, don't show to user
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/messages',
        {
          partnershipId,
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Add the new message to the state
      setMessages(prevMessages => [...prevMessages, response.data]);
      
      // Clear the input field after sending
      setNewMessage('');
      
      // Scroll to the bottom of the chat
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading-chat">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="chat-error">
        <p>{error}</p>
        <button onClick={fetchMessages} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  const userInfo = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="chat-container">
      {partnerInfo && (
        <div className="chat-header-info">
          <h3>Chatting with: {partnerInfo.name}</h3>
        </div>
      )}
      
      <div 
        className="messages-container"
        ref={chatContainerRef}
      >
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage
              key={message._id}
              message={message}
              isOwnMessage={message.sender._id === userInfo._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat; 