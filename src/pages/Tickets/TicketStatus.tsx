import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TicketCard from '../../components/Tickets/TicketCard';
import { Ticket } from '../../types/ticket';
import './TicketStatus.css';

const TicketStatus: React.FC = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  // Fetch tickets from the backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets', {
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

  // Handle creating a new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        const createdTicket = await response.json();
        setTickets([createdTicket, ...tickets]); // Add new ticket to the top
        setNewTicket({
          subject: '',
          description: '',
          category: '',
          priority: 'medium'
        });
        setShowCreateForm(false);
      } else {
        setError('Failed to create ticket');
      }
    } catch (err) {
      setError('Error creating ticket');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading tickets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ticket-status-page">
      <div className="page-header">
        <h1>Your Tickets</h1>
        <button 
          className="create-ticket-btn" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Ticket'}
        </button>
      </div>

      {showCreateForm && (
        <div className="ticket-form-container">
          <form onSubmit={handleCreateTicket} className="ticket-form">
            <h3>Create New Ticket</h3>
            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <input
                type="text"
                id="category"
                value={newTicket.category}
                onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority:</label>
              <select
                id="priority"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn">
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      <div className="tickets-list">
        {tickets.length === 0 ? (
          <div className="no-tickets">
            <p>You don't have any tickets yet.</p>
            <p>Need help? Start a chat or create a ticket above.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard 
              key={ticket._id} 
              ticket={ticket} 
              onClick={() => {
                // Could navigate to ticket detail page
                console.log('Ticket clicked:', ticket.ticketId);
              }} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TicketStatus;