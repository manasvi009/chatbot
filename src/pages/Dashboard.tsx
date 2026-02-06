import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/Chat/ChatWindow';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string>('default-chat-id');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <h2>Welcome, {user?.username}!</h2>
          <span className="role">Role: {user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="sidebar">
          <h3>Chats</h3>
          <ul className="chat-list">
            <li 
              className={`chat-item ${activeChatId === 'default-chat-id' ? 'active' : ''}`}
              onClick={() => setActiveChatId('default-chat-id')}
            >
              <div className="chat-preview">
                <div className="status-indicator online"></div>
                <div className="chat-details">
                  <strong>AI Support</strong>
                  <small>Last message: Just now</small>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div className="chat-area">
          <ChatWindow chatId={activeChatId} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;