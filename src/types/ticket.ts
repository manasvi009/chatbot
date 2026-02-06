export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface TicketMessage {
  _id: string;
  sender: string | User;
  senderType: 'user' | 'admin';
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ResolutionDetails {
  resolvedBy: string | User;
  resolutionNotes: string;
  resolvedAt: Date;
}

export interface Attachment {
  filename: string;
  url: string;
  uploadedAt: Date;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  userId: string | User;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  attachments: Attachment[];
  assignedTo: string | User | null;
  messages: TicketMessage[];
  resolutionDetails?: ResolutionDetails;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}