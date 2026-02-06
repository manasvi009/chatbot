import React from 'react';
import { Ticket } from '../../types/ticket';
import './TicketStyles.css';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  // Function to get status badge class
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-open';
    }
  };

  // Function to get priority badge class
  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  // Format date
  const formatDate = (dateValue: string | Date) => {
    return new Date(dateValue).toLocaleDateString();
  };

  return (
    <div className={`ticket-card ${getStatusClass(ticket.status)}`} onClick={onClick}>
      <div className="ticket-header">
        <div className="ticket-id">#{ticket.ticketId}</div>
        <div className="ticket-priority-badge">
          <span className={`badge ${getPriorityClass(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
      </div>
      
      <div className="ticket-subject">{ticket.subject}</div>
      
      <div className="ticket-description">
        {ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}
      </div>
      
      <div className="ticket-meta">
        <div className="ticket-category">{ticket.category}</div>
        <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
      </div>
      
      <div className="ticket-footer">
        <div className="ticket-status-badge">
          <span className={`badge ${getStatusClass(ticket.status)}`}>
            {ticket.status.replace('-', ' ')}
          </span>
        </div>
        <div className="ticket-assigned">
          {ticket.assignedTo && typeof ticket.assignedTo === 'object' ? `Assigned to: ${(ticket.assignedTo as any).username}` : 'Unassigned'}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;