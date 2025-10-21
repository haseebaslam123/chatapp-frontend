import React, { useState, useEffect } from 'react';
import ProfileDropdown from './ProfileDropdown';
import apiService from '../services/api';
import socketService from '../services/socket';

const ChatSidebar = ({ 
  currentUser, 
  chats, 
  onChatSelect, 
  onNewChat, 
  onLogout, 
  selectedChat,
  setSelectedChat,
  onProfileUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [updatedChats, setUpdatedChats] = useState(chats || []);
  const [currentUserWithCache, setCurrentUserWithCache] = useState(currentUser);

  // Update local chats state when props change
  useEffect(() => {
    setUpdatedChats(chats || []);
  }, [chats]);

  // Update current user with cache-busted avatar
  useEffect(() => {
    if (currentUser) {
      setCurrentUserWithCache({
        ...currentUser,
        avatar: getBustCacheImageUrl(currentUser.avatar)
      });
    }
  }, [currentUser]);

  // Listen for message deletion events
  useEffect(() => {
    const handleMessageDeleted = (data) => {
      const { messageId, chatId } = data;
      
      setUpdatedChats(prevChats => 
        prevChats.map(chat => {
          if (chat._id === chatId || chat.chatId === chatId) {
            if (chat.lastMessage?._id === messageId || chat.lastMessage?.id === messageId) {
              return {
                ...chat,
                lastMessage: null
              };
            }
          }
          return chat;
        })
      );
    };

    socketService.onMessageDeleted(handleMessageDeleted);
  }, []);

  // Listen for new messages to update last message in sidebar
  useEffect(() => {
    const handleNewMessage = (data) => {
      const { message, chatId } = data;
      
      setUpdatedChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === chatId || chat.chatId === chatId) {
            return {
              ...chat,
              lastMessage: message,
              unread: !message.isOwn ? (chat.unread || 0) + 1 : chat.unread
            };
          }
          return chat;
        })
      );
    };

    socketService.onNewMessage(handleNewMessage);
  }, []);

  // Cache buster helper - adds timestamp to image URL to break browser cache
  const getBustCacheImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/40';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return `${imagePath}?cache=${Date.now()}`;
    }
    const api = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const origin = api.replace(/\/api$/, '');
    return `${origin}${imagePath}?cache=${Date.now()}`;
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setSearchLoading(true);
      try {
        const response = await apiService.searchUsers(query);
        if (response.success) {
          setSearchResults(response.data.users);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleUserSelect = async (user) => {
    try {
      const newChat = {
        _id: null,
        chatId: null,
        user: {
          id: user._id,
          username: user.username,
          avatar: user.avatar,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen
        },
        lastMessage: null,
        unread: 0
      };
      
      onNewChat(newChat);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };

  return (
    <div className="w-full md:w-80 border-r border-white/20 flex flex-col h-full glass">
      {/* Header */}
      <div className="p-4 border-b border-white/20 glass-strong relative z-[900]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white-800">Chats</h2>
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Profile menu"
            >
              <svg className="w-5 h-5 text-white-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showProfileDropdown && (
              <ProfileDropdown 
                currentUser={currentUserWithCache || currentUser}
                onLogout={onLogout}
                onClose={() => setShowProfileDropdown(false)}
                onProfileUpdate={onProfileUpdate}
              />
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white/80 text-gray-900 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="border-b border-white/10 bg-white/10">
          <div className="p-3">
            <h3 className="text-sm font-medium text-white-600 mb-2">Search Results</h3>
            {searchLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-white-500 text-sm">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map(user => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <img
                      src={getBustCacheImageUrl(user.avatar)}
                      alt={user.username}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{user.username}</p>
                      <p className="text-xs text-red-500">
                        {user.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <p className="text-white-500 text-sm">No users found</p>
            ) : (
              <p className="text-white-500 text-sm">Type at least 2 characters to search</p>
            )}
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {updatedChats && updatedChats.length > 0 ? (
          <div className="p-2">
            {updatedChats.map(chat => {
  const isSelected = selectedChat?._id === chat._id;

  return (
    <button
      key={chat._id}
      onClick={() => onChatSelect(chat)}
      className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
        isSelected
          ? 'bg-white text-black border-l-4 border-blue-500'
          : 'bg-transparent text-white hover:bg-white/10'
      }`}
    >
      <div className="relative">
        <img
          src={getBustCacheImageUrl(chat.user.avatar)}
          alt={chat.user.username}
          className="w-12 h-12 rounded-full object-cover relative z-0"
        />
        {chat.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {chat.unread}
          </span>
        )}
      </div>

      <div className="flex-1 ml-3 text-left overflow-hidden">
        <div className="flex items-center justify-between">
          <h3
            className={`font-medium truncate ${
              isSelected ? 'text-black' : 'text-white'
            }`}
          >
            {chat.user.username}
          </h3>
          <span
            className={`text-xs flex-shrink-0 ml-2 ${
              isSelected ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            {chat.lastMessage?.timestamp
              ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
        </div>

        <p
          className={`text-sm truncate ${
            isSelected ? 'text-gray-700' : 'text-gray-300'
          }`}
        >
          {chat.lastMessage
            ? chat.lastMessage.messageType === 'image'
              ? 'Image'
              : chat.lastMessage.messageType === 'file'
              ? 'File'
              : chat.lastMessage.content || chat.lastMessage.text || ''
            : 'No messages yet'}
        </p>
      </div>
    </button>
  );
})}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
           <p className="text-lg font-medium mb-2 text-white">No chats yet</p>
<p className="text-sm text-center text-white">Start a conversation by searching for users</p>

          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;