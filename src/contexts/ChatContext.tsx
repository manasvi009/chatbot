import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message } from '../types/chat';

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  sendMessage: (content: string, chatId: string) => void;
  joinChat: (chatId: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  typingUser: string;
  setTypingUser: (user: string) => void;
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: `Bearer ${token}`
      }
    });

    setSocket(newSocket);

    // Listen for new messages
    newSocket.on('receive_message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', ({ user, isTyping: typingStatus }) => {
      if (typingStatus) {
        setTypingUser(user);
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.off('receive_message');
      newSocket.off('user_typing');
      newSocket.disconnect();
    };
  }, [token]);

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join_chat', chatId);
      setActiveChatId(chatId);
    }
  };

  const sendMessage = (content: string, chatId: string) => {
    if (socket && content.trim() !== '' && chatId) {
      const newMessage: Message = {
        _id: Date.now().toString(),
        sender: 'current_user', // This would be the actual user ID
        senderType: 'user',
        content,
        timestamp: new Date(),
        read: false,
        sentiment: 'neutral'
      };

      socket.emit('send_message', {
        chatId,
        message: newMessage
      });

      setMessages(prev => [...prev, newMessage]);
    }
  };

  return (
    <ChatContext.Provider value={{
      socket,
      messages,
      sendMessage,
      joinChat,
      isTyping,
      setIsTyping,
      typingUser,
      setTypingUser,
      activeChatId,
      setActiveChatId
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};