import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminUserManagement.css';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  lastSeen: string;
  createdAt: string;
  profilePicture?: string;
}

const AdminUserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChatLogs, setShowChatLogs] = useState(false);
  const [chatLogs, setChatLogs] = useState<any[]>([]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        setError('Error fetching users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Handle user selection
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowChatLogs(false);
  };

  // Handle toggle user active status
  const handleToggleActive = async (userId: string) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: !selectedUser.isActive 
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update the user in the list
        setUsers(users.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        ));
        
        // Update the selected user
        setSelectedUser(updatedUser);
      } else {
        setError('Failed to update user status');
      }
    } catch (err) {
      setError('Error updating user status');
      console.error(err);
    }
  };

  // Handle toggle user blocked status
  const handleToggleBlocked = async (userId: string) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isBlocked: !selectedUser.isBlocked 
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update the user in the list
        setUsers(users.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        ));
        
        // Update the selected user
        setSelectedUser(updatedUser);
      } else {
        setError('Failed to update user blocked status');
      }
    } catch (err) {
      setError('Error updating user blocked status');
      console.error(err);
    }
  };

  // Handle view chat logs
  const handleViewChatLogs = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatLogs(data);
        setShowChatLogs(true);
      } else {
        setError('Failed to fetch chat logs');
      }
    } catch (err) {
      setError('Error fetching chat logs');
      console.error(err);
    }
  };

  if (loading) return <div className="admin-users-loading">Loading users...</div>;
  if (error) return <div className="admin-users-error">{error}</div>;

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      
      <div className="admin-users-grid">
        <div className="users-list">
          <h3>All Users</h3>
          {users.length === 0 ? (
            <p>No users available</p>
          ) : (
            users.map(user => (
              <div 
                key={user._id} 
                className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="user-info">
                  <div className="user-avatar">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} />
                    ) : (
                      <div className="default-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-role">{user.role}</div>
                  </div>
                </div>
                <div className="user-status">
                  <span className={`status-indicator ${user.isActive ? 'active' : 'inactive'}`}></span>
                  <span className={`status-indicator ${user.isBlocked ? 'blocked' : 'unblocked'}`}></span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="user-details">
          {selectedUser ? (
            <>
              <div className="user-info-card">
                <h3>User Details</h3>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p><strong>Blocked:</strong> 
                  <span className={`status-badge ${selectedUser.isBlocked ? 'blocked' : 'unblocked'}`}>
                    {selectedUser.isBlocked ? 'Yes' : 'No'}
                  </span>
                </p>
                <p><strong>Last Seen:</strong> {new Date(selectedUser.lastSeen).toLocaleString()}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="user-actions">
                <button 
                  className={`action-btn ${selectedUser.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleActive(selectedUser._id)}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </button>
                
                <button 
                  className={`action-btn ${selectedUser.isBlocked ? 'unblock' : 'block'}`}
                  onClick={() => handleToggleBlocked(selectedUser._id)}
                >
                  {selectedUser.isBlocked ? 'Unblock' : 'Block'}
                </button>
                
                <button 
                  className="action-btn view-chats"
                  onClick={() => handleViewChatLogs(selectedUser._id)}
                >
                  View Chat Logs
                </button>
              </div>
              
              {showChatLogs && (
                <div className="chat-logs">
                  <h4>Chat Logs</h4>
                  {chatLogs.length === 0 ? (
                    <p>No chat logs available for this user</p>
                  ) : (
                    chatLogs.map((chat, index) => (
                      <div key={index} className="chat-log">
                        <h5>Chat {index + 1}</h5>
                        <div className="chat-messages">
                          {chat.messages.map((message: any, msgIndex: number) => (
                            <div key={msgIndex} className={`message ${message.senderType}`}>
                              <div className="message-content">{message.content}</div>
                              <div className="message-meta">
                                {typeof message.sender === 'object' 
                                  ? message.sender.username 
                                  : 'User'} - {new Date(message.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="no-user-selected">
              <p>Select a user to view details and manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;