import React from 'react';
import './ChatStyles.css';

interface ChatHeaderProps {
  chatId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatId }) => {
  // In a real app, this would come from props or context
  const isOnline = true; // Placeholder for actual online status
  const participantName = 'AI Assistant'; // Placeholder for actual participant name
  const sentiment = 'positive'; // Placeholder for actual sentiment

  // Determine sentiment color class
  const getSentimentClass = () => {
    switch (sentiment as string) {
      case 'positive':
        return 'sentiment-positive';
      case 'negative':
        return 'sentiment-negative';
      default:
        return 'sentiment-neutral';
    }
  };

  return (
    <div className="chat-header">
      <div className="header-info">
        <div className="participant-info">
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
          <h3>{participantName}</h3>
        </div>
        <div className={`sentiment-indicator ${getSentimentClass()}`}>
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
        </div>
      </div>
      <div className="header-actions">
        <button className="header-action-btn">Info</button>
        <button className="header-action-btn">More</button>
      </div>
    </div>
  );
};

export default ChatHeader;