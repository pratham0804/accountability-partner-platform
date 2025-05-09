import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChatMessage from './ChatMessage';

const Chat = ({ partnershipId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    console.log('Chat component mounted with partnershipId:', partnershipId);
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [partnershipId]);

  const fetchMessages = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        return;
      }

      console.log('Fetching messages for partnership:', partnershipId);
      const response = await axios.get(
        `http://localhost:5000/api/messages/partnership/${partnershipId}?page=${page}`,
        { 
          headers: { 
            Authorization: `Bearer ${userInfo.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Received messages:', response.data);
      const { messages: newMessages, pages } = response.data;

      setMessages(prevMessages => {
        // Combine new messages with existing ones, avoiding duplicates
        const messageMap = new Map();
        [...prevMessages, ...newMessages].forEach(msg => {
          messageMap.set(msg._id, msg);
        });
        return Array.from(messageMap.values()).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
      });

      setHasMore(page < pages);
      setLoading(false);

      // Mark messages as read
      const unreadMessages = newMessages.filter(msg => !msg.isRead && msg.sender._id !== userInfo.id);
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg._id));
      }
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) return;

      console.log('Marking messages as read:', messageIds);
      await axios.put(
        'http://localhost:5000/api/messages/read',
        { messageIds },
        { 
          headers: { 
            Authorization: `Bearer ${userInfo.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error.response?.data || error.message);
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

      console.log('Sending message:', { partnershipId, content: newMessage });
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        {
          partnershipId,
          content: newMessage
        },
        { 
          headers: { 
            Authorization: `Bearer ${userInfo.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Message sent successfully:', response.data);
      setMessages(prevMessages => [...prevMessages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0 && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  const userInfo = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="chat-container">
      <div 
        className="messages-container"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {messages.map(message => (
          <ChatMessage
            key={message._id}
            message={message}
            isOwnMessage={message.sender._id === userInfo?.id}
          />
        ))}
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