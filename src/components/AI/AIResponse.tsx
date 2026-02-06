import React from 'react';
import { Message } from '../../types/chat';
import './AIResponse.css';

interface AIResponseProps {
  message: Message;
  showConfidence?: boolean;
  onFallbackClick?: () => void;
}

const AIResponse: React.FC<AIResponseProps> = ({ 
  message, 
  showConfidence = false,
  onFallbackClick 
}) => {
  // Function to get sentiment class for styling
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

  // Function to get sentiment icon
  const getSentimentIcon = () => {
    switch (message.sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  return (
    <div className={`ai-response ${getSentimentClass()}`}>
      <div className="ai-message-content">
        <div className="ai-icon">{getSentimentIcon()}</div>
        <div className="ai-text">
          <p>{message.content}</p>
          {showConfidence && message.sentiment && (
            <div className="confidence-indicator">
              <span>Sentiment: {message.sentiment}</span>
            </div>
          )}
        </div>
      </div>
      
      {onFallbackClick && (
        <div className="fallback-option">
          <p>Not helpful? <button onClick={onFallbackClick} className="fallback-btn">Contact Human Support</button></p>
        </div>
      )}
    </div>
  );
};

export default AIResponse;