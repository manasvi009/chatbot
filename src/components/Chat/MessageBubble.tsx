import React from 'react';
import { Message } from '../../types/chat';
import './ChatStyles.css';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.senderType === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Determine sentiment color class
  const getSentimentClass = () => {
    switch (message.sentiment) {
      case 'positive':
        return 'sentiment-positive';
      case 'negative':
        return 'sentiment-negative';
      default:
        return 'sentiment-neutral';
    }
  };

  return (
    <div className={`message-bubble ${isUser ? 'user-message' : 'ai-message'} ${getSentimentClass()}`}>
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-meta">
        <span className="timestamp">{timestamp}</span>
      </div>
    </div>
  );
};

export default MessageBubble;