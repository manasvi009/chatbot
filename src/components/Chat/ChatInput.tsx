import React, { useState, KeyboardEvent } from 'react';
import './ChatStyles.css';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTypingStart, onTypingStop }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing start/stop events
    if (value.trim() && !isTyping) {
      onTypingStart();
      setIsTyping(true);
    } else if (!value.trim() && isTyping) {
      onTypingStop();
      setIsTyping(false);
    }
  };

  // Clean up typing status when component unmounts or message is sent
  const handleBlur = () => {
    if (isTyping) {
      onTypingStop();
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        placeholder="Type your message..."
        rows={1}
      />
      <button 
        className="send-button" 
        onClick={handleSend}
        disabled={!message.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;