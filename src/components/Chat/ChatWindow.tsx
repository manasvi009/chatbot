import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import { Message } from '../../types/chat';

interface ChatWindowProps {
  chatId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: `Bearer ${token}`
      }
    });

    setSocket(newSocket);

    // Join the specific chat room
    newSocket.emit('join_chat', chatId);

    // Listen for new messages
    newSocket.on('receive_message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', ({ user, isTyping: typingStatus }) => {
      if (typingStatus) {
        setTypingUser(user);
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.off('receive_message');
      newSocket.off('user_typing');
      newSocket.disconnect();
    };
  }, [chatId, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (socket && content.trim() !== '') {
      const newMessage: Message = {
        _id: Date.now().toString(),
        sender: 'current_user', // This would be the actual user ID
        senderType: 'user',
        content,
        timestamp: new Date(),
        read: false,
        sentiment: 'neutral'
      };

      socket.emit('send_message', {
        chatId,
        message: newMessage
      });

      setMessages(prev => [...prev, newMessage]);
    }
  };

  // Handle typing start/stop
  const handleTypingStart = () => {
    if (socket) {
      socket.emit('typing_start', { chatId, user: 'current_user' });
    }
  };

  const handleTypingStop = () => {
    if (socket) {
      socket.emit('typing_stop', { chatId, user: 'current_user' });
    }
  };

  return (
    <div className="chat-window">
      <ChatHeader chatId={chatId} />
      
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble 
            key={message._id} 
            message={message} 
          />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            {typingUser} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
};

export default ChatWindow;