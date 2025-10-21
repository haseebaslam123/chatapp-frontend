import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import apiService from "../services/api";
import socketService from "../services/socket";

const ChatInterface = ({ currentUser, onLogout, selectedChatId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showMobileChatWindow, setShowMobileChatWindow] = useState(false); // Mobile state

  // Load chat list and restore selected chat
  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await apiService.getChatList();
        if (response.success) {
          const loadedChats = response.chats || response.data?.chats || [];
          
          // Add mock welcome user for new users (users with no chats)
          const mockWelcomeUser = {
            _id: 'mock-welcome-user',
            chatId: 'mock-welcome-user',
            user: {
              id: 'mock-welcome-user',
              username: 'Welcome Bot',
              avatar: 'https://ui-avatars.com/api/?name=Welcome+Bot&background=4f46e5&color=fff',
              isOnline: true,
              lastSeen: new Date().toISOString()
            },
            lastMessage: {
              content: 'Welcome! I\'m here to help you get started with chatting.',
              timestamp: new Date().toISOString(),
              sender: 'mock-welcome-user'
            },
            unread: 0,
            isMockUser: true
          };

          // Add mock user if user has no chats (new user)
          const chatsWithMock = loadedChats.length === 0 ? [mockWelcomeUser, ...loadedChats] : loadedChats;
          setChats(chatsWithMock);
          
          // Set selected chat based on URL parameter or saved chat
          let chatToSelect = null;
          
          if (params.chatId) {
            // Find chat by URL parameter
            chatToSelect = loadedChats.find(chat => chat._id === params.chatId);
            if (chatToSelect) {
              setShowMobileChatWindow(true); // Show chat window on mobile if URL has chatId
            }
          } else {
            // Restore from localStorage if no URL parameter
            const savedChat = localStorage.getItem("selectedChat");
            if (savedChat) {
              try {
                const parsedChat = JSON.parse(savedChat);
                chatToSelect = loadedChats.find(chat => 
                  chat._id === parsedChat._id || 
                  (chat.user?.id && chat.user.id === parsedChat.user?.id)
                );
              } catch (error) {
                console.error("Error parsing saved chat:", error);
                localStorage.removeItem("selectedChat");
              }
            }
          }
          
          if (chatToSelect) {
            setSelectedChat(chatToSelect);
            socketService.joinChat(chatToSelect._id);
            // Update URL if needed
            if (!params.chatId) {
              navigate(`/chat/${chatToSelect._id}`, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadChats();
    }
  }, [currentUser]);

  // Load messages whenever chat changes
  useEffect(() => {
    if (!selectedChat || !selectedChat._id) {
      setMessages([]);
      return;
    }

    // Handle mock user - don't load messages from backend
    if (selectedChat.isMockUser) {
      const mockMessages = [
        {
          id: 'mock-welcome-1',
          text: 'Welcome! I\'m here to help you get started with chatting.',
          content: 'Welcome! I\'m here to help you get started with chatting.',
          messageType: 'text',
          sender: 'Welcome Bot',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: false
        }
      ];
      setMessages(mockMessages);
      localStorage.setItem("selectedChat", JSON.stringify(selectedChat));
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await apiService.getMessages(selectedChat._id);

        if (response.success && Array.isArray(response.messages)) {
          // Transform raw messages to match ChatWindow format
          const formattedMessages = response.messages.map(msg => {
            // Properly check if message is from current user
            const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
            const currentUserId = currentUser?._id || currentUser?.id;
            const isOwnMessage = String(senderId) === String(currentUserId);
            
            return {
              id: msg._id,
              text: msg.content,
              sender: msg.sender?.username || 'Unknown',
              timestamp: msg.createdAt 
                ? new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
              isOwn: isOwnMessage,
              content: msg.content
            };
          });
          
          setMessages(formattedMessages);
        } else {
          console.error("Server responded with error:", response);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      }
    };

    fetchMessages();
    localStorage.setItem("selectedChat", JSON.stringify(selectedChat));
  }, [selectedChat, currentUser?._id]);

  // Socket listeners
  useEffect(() => {
    if (!selectedChat || selectedChat.isMockUser) return;

    const handleNewMessage = (data) => {
      const { message } = data;
      const selectedChatId = selectedChat._id;
      
      if (message && message.chatId && message.chatId === selectedChatId) {
        // Properly check if message is from current user
        const senderId = message.sender?._id || message.sender?.id || message.sender;
        const currentUserId = currentUser?._id || currentUser?.id;
        const isOwnMessage = String(senderId) === String(currentUserId);
        
        const formattedMessage = {
          id: message.id,
          text: message.content,
          sender: message.sender?.username || 'Unknown',
          timestamp: message.timestamp 
            ? (typeof message.timestamp === 'string' 
                ? new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }))
            : new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
          isOwn: isOwnMessage,
          content: message.content
        };
        setMessages((prev) => [...prev, formattedMessage]);
      }
    };

    const handleMessageSent = (data) => {
      const { message } = data;
      const selectedChatId = selectedChat._id;
      
      if (message && message.chatId && message.chatId === selectedChatId) {
        const formattedMessage = {
          id: message.id,
          text: message.content,
          sender: message.sender?.username || currentUser?.username || 'You',
          timestamp: message.timestamp 
            ? (typeof message.timestamp === 'string' 
                ? new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }))
            : new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
          isOwn: true,
          content: message.content
        };
        setMessages((prev) => [...prev, formattedMessage]);
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageSent(handleMessageSent);

    return () => {
      socketService.removeAllListeners();
    };
  }, [selectedChat, currentUser?._id]);

  // Listen for message delete events
  useEffect(() => {
    const handleMessageDeleted = (data) => {
      console.log('Received message_deleted event:', data);
      const { messageId, chatId } = data || {};
      if (!messageId || !chatId) return;
      
      // Remove message from current chat if it matches
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== messageId);
          return next;
        });
      }
      
      // Update chat list to reflect the deletion
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === chatId) {
            // If the deleted message was the last message, update it
            const updatedMessages = messages.filter((m) => m.id !== messageId);
            const newLastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : null;
            
            return {
              ...chat,
              lastMessage: newLastMessage
                ? {
                    id: newLastMessage.id,
                    content: newLastMessage.content || newLastMessage.text || '',
                    messageType: newLastMessage.messageType || 'text',
                    timestamp: new Date().toISOString()
                  }
                : null
            };
          }
          return chat;
        })
      );
    };

    // Use the socket service method for consistency
    socketService.onMessageDeleted(handleMessageDeleted);

    return () => {
      if (socketService.socket) {
        socketService.socket.off('message_deleted', handleMessageDeleted);
      }
    };
  }, [selectedChat?._id, messages]);

  // Global socket listeners for chat updates
  useEffect(() => {
    const handleChatUpdate = (data) => {
      const { message } = data;
      if (message && message.chatId) {
        // Update chat list to show latest message
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === message.chatId) {
              return {
                ...chat,
                lastMessage: {
                  id: message.id || message._id,
                  content: message.content,
                  messageType: message.messageType || 'text',
                  timestamp: new Date(message.timestamp || Date.now()).toISOString()
                }
              };
            }
            return chat;
          });
        });
      }
    };

    socketService.onNewMessage(handleChatUpdate);
    socketService.onMessageSent(handleChatUpdate);

    return () => {
      // Clean up listeners
    };
  }, []);

  // Select chat - MOBILE RESPONSIVE
  const handleChatSelect = async (chat) => {
    // Handle mock welcome user specially
    if (chat.isMockUser) {
      setSelectedChat(chat);
      setShowMobileChatWindow(true); // Show chat on mobile
      localStorage.setItem("selectedChat", JSON.stringify(chat));
      
      // Navigate to the mock chat URL
      navigate(`/chat/${chat._id}`);
      
      // Set mock messages for welcome bot in ChatWindow format
      const mockMessages = [
        {
          id: 'mock-welcome-1',
          text: 'Welcome! I\'m here to help you get started with chatting.',
          content: 'Welcome! I\'m here to help you get started with chatting.',
          messageType: 'text',
          sender: 'Welcome Bot',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: false // This is from the bot, not the user
        }
      ];
      setMessages(mockMessages);
      
      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? { ...c, unread: 0 } : c))
      );
      return;
    }

    // If this is a new chat (no _id), create it first
    if (!chat._id) {
      try {
        const response = await apiService.createChat(chat.user.id);
        
        if (response.success) {
          const newChat = response.chat;
          setSelectedChat(newChat);
          setShowMobileChatWindow(true); // Show chat on mobile
          socketService.joinChat(newChat._id);
          localStorage.setItem("selectedChat", JSON.stringify(newChat));
          
          // Navigate to the new chat URL
          navigate(`/chat/${newChat._id}`);
          
          // Add to chats list if not already present
          setChats((prev) => {
            const exists = prev.some(chat => chat._id === newChat._id);
            return exists ? prev : [...prev, newChat];
          });
        }
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    } else {
      setSelectedChat(chat);
      setShowMobileChatWindow(true); // Show chat on mobile
      socketService.joinChat(chat._id);
      localStorage.setItem("selectedChat", JSON.stringify(chat));
      
      // Navigate to the chat URL
      navigate(`/chat/${chat._id}`);

      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? { ...c, unread: 0 } : c))
      );
    }
  };

  // Back to chat list (mobile only)
  const handleBackToList = () => {
    setShowMobileChatWindow(false);
    navigate('/chat', { replace: true });
  };

  // Send message
  const handleSendMessage = async (content) => {
    if (!selectedChat || !content.trim()) return;

    // Handle mock welcome user specially
    if (selectedChat.isMockUser) {
      // Create user message in ChatWindow format
      const userMessage = {
        id: `user-${Date.now()}`,
        text: content, // ChatWindow expects 'text' property
        content: content, // Keep content for compatibility
        messageType: 'text',
        sender: currentUser.username,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: true // This is the user's own message
      };

      // Add user message to messages
      setMessages(prev => [...prev, userMessage]);

      // Update chat list with user's message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, lastMessage: { content, messageType: 'text', timestamp: new Date().toISOString(), sender: currentUser._id } }
            : chat
        )
      );

      // Send user message to backend for storage
      try {
        const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            receiverId: 'mock-welcome-user',
            content,
            messageType: 'text'
          })
        });
        
        if (response.ok) {
          console.log('User message stored successfully for mock user');
        }
      } catch (error) {
        console.error('Failed to store mock user message:', error);
      }

      return;
    }

    const payload = {
      receiverId: selectedChat.user?.id,
      content,
      messageType: "text",
    };

    try {
      // Send via socket (this will handle both real-time delivery and persistence)
      socketService.sendMessage(payload);

      // Update chat list with new last message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, lastMessage: { content, messageType: 'text', timestamp: new Date().toISOString() } }
            : chat
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Upload file as message
  const handleUploadFile = async (file) => {
    if (!selectedChat || !file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', selectedChat.user?.id);

      const token = localStorage.getItem('token');
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/messages/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Upload failed');

      // Optimistic add to messages so it appears instantly
      const msg = data.data;
      const isImage = (msg?.messageType === 'image');
      const formatted = {
        id: msg?._id,
        text: isImage ? '' : (msg?.content || ''),
        content: msg?.content || '',
        messageType: msg?.messageType || 'file',
        sender: currentUser?.username || 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setMessages((prev) => [...prev, formatted]);

      // Update chat list subtitle to reflect file/image
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, lastMessage: { content: formatted.content, messageType: formatted.messageType, timestamp: new Date().toISOString(), id: formatted.id } }
            : chat
        )
      );
    } catch (e) {
      console.error('File upload failed:', e);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!selectedChat?._id) {
      console.error('No selected chat for deletion');
      return;
    }

    try {
      // Use socket service for real-time deletion and broadcasting
      socketService.deleteMessage(messageId, selectedChat._id);
      
      // Optimistically remove the message from UI immediately
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== messageId);
        const last = next.length > 0 ? next[next.length - 1] : null;
        
        // Update chat list with new last message
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  lastMessage: last
                    ? {
                        id: last.id,
                        content: last.content || last.text || '',
                        messageType: last.messageType || 'text',
                        timestamp: new Date().toISOString()
                      }
                    : null
                }
              : chat
          )
        );
        
        return next;
      });
      
    } catch (e) {
      console.error('Delete failed:', e);
      // If socket deletion fails, fall back to REST API
      try {
        const token = localStorage.getItem('token');
        const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + `/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Delete failed');
        }
      } catch (apiError) {
        console.error('API delete also failed:', apiError);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen chat-bg overflow-hidden">
      {/* Chat Sidebar - Hidden on mobile when chat is selected */}
      <div className={`
        ${showMobileChatWindow ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 flex-shrink-0
      `}>
        <ChatSidebar
          currentUser={currentUser}
          chats={chats}
          onChatSelect={handleChatSelect}
          onNewChat={handleChatSelect}
          onLogout={onLogout}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>

      {/* Chat Window - Hidden on mobile when no chat selected */}
      <div className={`
        ${showMobileChatWindow ? 'flex' : 'hidden md:flex'}
        w-full flex-1
      `}>
        <ChatWindow
          selectedChat={selectedChat}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onUploadFile={handleUploadFile}
          onDeleteMessage={handleDeleteMessage}
          messages={messages}
          onBackClick={handleBackToList}
          isMobile={showMobileChatWindow}
        />
      </div>
    </div>
  );
};

export default ChatInterface;