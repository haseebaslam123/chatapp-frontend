import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';

const ChatPage = ({ currentUser, onLogout, isAuthenticated }) => {
  const { chatId } = useParams();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <ChatInterface 
      currentUser={currentUser} 
      onLogout={onLogout}
      selectedChatId={chatId}
    />
  );
};

export default ChatPage;

