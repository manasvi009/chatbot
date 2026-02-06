import { Message } from '../types/chat';

// Function to create a ticket from chat conversation
export const createTicketFromChat = async (
  token: string,
  subject: string,
  description: string,
  category: string = 'General Inquiry',
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<any> => {
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject,
        description,
        category,
        priority
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }

    const ticket = await response.json();
    return ticket;
  } catch (error) {
    console.error('Error creating ticket from chat:', error);
    throw error;
  }
};

// Function to convert chat messages to ticket description
export const formatChatAsTicketDescription = (messages: Message[]): string => {
  let description = "Customer Support Chat Transcript:\n\n";
  
  messages.forEach((message, index) => {
    const senderType = message.senderType === 'user' ? 'Customer' : 'AI Support';
    const timestamp = new Date(message.timestamp).toLocaleString();
    
    description += `[${timestamp}] ${senderType}: ${message.content}\n\n`;
  });
  
  return description;
};

// Function to extract relevant information from chat for ticket creation
export const extractTicketInfoFromChat = (messages: Message[]) => {
  // Look for the first user message as the main issue
  const firstUserMessage = messages.find(msg => msg.senderType === 'user');
  
  // Extract category based on keywords in the conversation
  let category = 'General Inquiry';
  const allText = messages.map(m => m.content.toLowerCase()).join(' ');
  
  if (allText.includes('bug') || allText.includes('error') || allText.includes('issue')) {
    category = 'Technical Issue';
  } else if (allText.includes('payment') || allText.includes('billing') || allText.includes('charge')) {
    category = 'Billing';
  } else if (allText.includes('account') || allText.includes('profile') || allText.includes('login')) {
    category = 'Account';
  } else if (allText.includes('refund') || allText.includes('return')) {
    category = 'Refund/Return';
  }
  
  return {
    subject: firstUserMessage ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') : 'Support Request',
    description: formatChatAsTicketDescription(messages),
    category
  };
};