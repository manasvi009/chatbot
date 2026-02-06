export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
}

export interface Message {
  _id: string;
  sender: string | User; // Can be user ID or populated user object
  senderType: 'user' | 'ai';
  content: string;
  timestamp: Date;
  read: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Chat {
  _id: string;
  participants: User[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isOnline: boolean;
}