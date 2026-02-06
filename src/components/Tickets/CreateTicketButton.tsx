import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types/chat';
import { createTicketFromChat, extractTicketInfoFromChat } from '../../utils/ticketUtils';
import './TicketStyles.css';

interface CreateTicketButtonProps {
  messages: Message[];
  onTicketCreated?: (ticket: any) => void;
}

const CreateTicketButton: React.FC<CreateTicketButtonProps> = ({ messages, onTicketCreated }) => {
  const { token } = useAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTicket = async () => {
    if (!token) {
      setError('User not authenticated');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Extract relevant information from the chat
      const ticketInfo = extractTicketInfoFromChat(messages);

      // Create the ticket
      const ticket = await createTicketFromChat(
        token,
        ticketInfo.subject,
        ticketInfo.description,
        ticketInfo.category
      );

      // Call the callback if provided
      if (onTicketCreated) {
        onTicketCreated(ticket);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-ticket-section">
      <button 
        className="create-ticket-from-chat-btn"
        onClick={handleCreateTicket}
        disabled={creating}
      >
        {creating ? 'Creating Ticket...' : 'Create Support Ticket'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CreateTicketButton;