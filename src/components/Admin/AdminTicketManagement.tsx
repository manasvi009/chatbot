import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket } from '../../types/ticket';
import './AdminTicketManagement.css';

const AdminTicketManagement: React.FC = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [agentId, setAgentId] = useState('');
  const [status, setStatus] = useState('');

  // Fetch all tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/admin/tickets', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        } else {
          setError('Failed to fetch tickets');
        }
      } catch (err) {
        setError('Error fetching tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  // Handle ticket selection
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewMessage('');
  };

  // Handle assigning ticket to agent
  const handleAssignTicket = async () => {
    if (!selectedTicket || !agentId) return;

    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agentId })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        
        // Update the ticket in the list
        setTickets(tickets.map(t => 
          t._id === updatedTicket._id ? updatedTicket : t
        ));
        
        // Update the selected ticket
        setSelectedTicket(updatedTicket);
      } else {
        setError('Failed to assign ticket');
      }
    } catch (err) {
      setError('Error assigning ticket');
      console.error(err);
    }
  };

  // Handle updating ticket status
  const handleUpdateStatus = async () => {
    if (!selectedTicket || !status) return;

    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        
        // Update the ticket in the list
        setTickets(tickets.map(t => 
          t._id === updatedTicket._id ? updatedTicket : t
        ));
        
        // Update the selected ticket
        setSelectedTicket(updatedTicket);
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
      console.error(err);
    }
  };

  // Handle adding a message to ticket
  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket || !newMessage) return;

    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.ticketId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        
        // Update the ticket in the list
        setTickets(tickets.map(t => 
          t._id === updatedTicket._id ? updatedTicket : t
        ));
        
        // Update the selected ticket
        setSelectedTicket(updatedTicket);
        setNewMessage('');
      } else {
        setError('Failed to add message');
      }
    } catch (err) {
      setError('Error adding message');
      console.error(err);
    }
  };

  if (loading) return <div className="admin-tickets-loading">Loading tickets...</div>;
  if (error) return <div className="admin-tickets-error">{error}</div>;

  return (
    <div className="admin-ticket-management">
      <h2>Ticket Management</h2>
      
      <div className="admin-tickets-grid">
        <div className="tickets-list">
          <h3>All Tickets</h3>
          {tickets.length === 0 ? (
            <p>No tickets available</p>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket._id} 
                className={`ticket-item ${selectedTicket?._id === ticket._id ? 'selected' : ''}`}
                onClick={() => handleSelectTicket(ticket)}
              >
                <div className="ticket-header">
                  <span className="ticket-id">#{ticket.ticketId}</span>
                  <span className={`ticket-status ${ticket.status}`}>{ticket.status}</span>
                </div>
                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-meta">
                  <span>Priority: {ticket.priority}</span>
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="ticket-details">
          {selectedTicket ? (
            <>
              <div className="ticket-info">
                <h3>Ticket #{selectedTicket.ticketId}</h3>
                <p><strong>Subject:</strong> {selectedTicket.subject}</p>
                <p><strong>Category:</strong> {selectedTicket.category}</p>
                <p><strong>Priority:</strong> {selectedTicket.priority}</p>
                <p><strong>Status:</strong> {selectedTicket.status}</p>
                <p><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                <p><strong>User:</strong> {typeof selectedTicket.userId === 'object' ? selectedTicket.userId.username : 'N/A'}</p>
                {selectedTicket.assignedTo && (
                  <p><strong>Assigned To:</strong> {typeof selectedTicket.assignedTo === 'object' ? selectedTicket.assignedTo.username : 'N/A'}</p>
                )}
              </div>
              
              <div className="ticket-actions">
                <div className="action-group">
                  <label htmlFor="agent-select">Assign to Agent:</label>
                  <input
                    type="text"
                    id="agent-select"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="Agent ID"
                  />
                  <button onClick={handleAssignTicket}>Assign</button>
                </div>
                
                <div className="action-group">
                  <label htmlFor="status-select">Update Status:</label>
                  <select
                    id="status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={handleUpdateStatus}>Update</button>
                </div>
              </div>
              
              <div className="ticket-messages">
                <h4>Messages</h4>
                <div className="messages-list">
                  {selectedTicket.messages.map((message, index) => (
                    <div key={index} className={`message ${message.senderType}`}>
                      <div className="message-header">
                        <span className="sender">{typeof message.sender === 'object' ? message.sender.username : 'User'}</span>
                        <span className="timestamp">{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="message-content">{message.content}</div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleAddMessage} className="add-message-form">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                  />
                  <button type="submit">Send Response</button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-ticket-selected">
              <p>Select a ticket to view details and manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketManagement;