import React, { useState, useRef, useEffect } from 'react';
import MessageInput from './MessageInput';
import apiService from '../services/api';
import socketService from '../services/socket';

// Utility function to bust cache for images - matches ChatSidebar implementation
const getBustCacheImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/40';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return `${imagePath}?cache=${Date.now()}`;
  }
  const api = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const origin = api.replace(/\/api$/, '');
  return `${origin}${imagePath}?cache=${Date.now()}`;
};

const MessageActions = ({ messageId, onDelete }) => {
  return (
    <div className="relative">
      <button
        onClick={() => { onDelete && onDelete(messageId); }}
        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
        aria-label="Delete message"
        title="Delete message"
      >
        🗑️
      </button>
    </div>
  );
};

const ChatWindow = ({
  selectedChat,
  currentUser,
  onSendMessage,
  onUploadFile,
  onDeleteMessage,
  messages = [],
  onBackClick,
  isMobile = false
}) => {
  const [loading, setLoading] = useState(false);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const lastMessageCountRef = useRef(0);

  // Update displayMessages when messages prop changes
  useEffect(() => {
    if (Array.isArray(messages)) {
      setDisplayMessages(messages);
    }
  }, [messages]);

  // Check if user is at bottom of chat
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
  };

  // Handle scroll events to track if user is at bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      shouldAutoScrollRef.current = isAtBottom();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to bottom with smooth animation when new message is sent
  useEffect(() => {
    const messageIncreased = displayMessages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = displayMessages.length;

    if (messageIncreased) {
      // Always scroll to bottom when sending a new message
      smoothScrollToBottom();
    } else if (shouldAutoScrollRef.current) {
      // For other changes (like deletes), only scroll if already at bottom
      smoothScrollToBottom();
    }
  }, [displayMessages]);

  // Scroll to bottom when chat is first opened
  useEffect(() => {
    if (selectedChat) {
      // Reset auto-scroll to true when opening a new chat
      shouldAutoScrollRef.current = true;
      lastMessageCountRef.current = 0;
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        smoothScrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedChat?.id]);

  const smoothScrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleSendMessage = (messageText) => {
    if (!selectedChat || !messageText.trim()) return;
    onSendMessage(messageText);
    // Force scroll to bottom when sending message
    shouldAutoScrollRef.current = true;
  };

 const handleDeleteMessage = (messageId) => {
  // Add message to deleting set
  setDeletingMessageIds(prev => new Set(prev).add(messageId));

  // Wait for animation (600ms) before removing it
  setTimeout(() => {
    setDisplayMessages(prev => prev.filter(msg => msg.id !== messageId));
    onDeleteMessage && onDeleteMessage(messageId);

    // Clean up
    setDeletingMessageIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  }, 600); // matches animation duration
};

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', 
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', 
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
    '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
    '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
    '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦',
    '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
    '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿',
    '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖',
    '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '👏',
    '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎', '👏', '🙌',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
    '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
    '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
    '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
    '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
    '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
    'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂',
    '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶',
    '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒',
    '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣',
    '8️⃣', '9️⃣', '🔟', '🎉', '🎊', '🎈', '🎁', '🏆', '🏅', '🥇',
    '🥈', '🥉', '🏵️', '🎗️', '🎖️', '🎫', '🎟️', '🎪', '🤹', '🎭',
    '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎙️', '🎚️',
    '🎛️', '📻', '🎚️', '🎛️', '📻', '📺', '📷', '📹', '📼', '🔍',
    '🔎', '🔬', '🔭', '📡', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️',
    '💽', '💾', '💿', '📀', '🧮', '🎥', '📽️', '🎞️', '📱', '☎️',
    '📞', '📟', '📠', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯',
    '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎',
    '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱',
    '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️',
    '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️',
    '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🧬', '🦠', '🧫',
    '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀',
    '🧴', '🧷', '🧸', '🧵', '🧶', '🪡', '🪢', '🧤', '🧥', '🥼',
    '🦺', '👕', '👖', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳',
    '👙', '👚', '👛', '👜', '👝', '🎒', '🩴', '👞', '👟', '🥾',
    '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢',
    '🪖', '⛑️', '📿', '💄', '💍', '💎', '🔇', '🔈', '🔉', '🔊',
    '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '🎤', '🎧', '📻',
    '🎷', '🪗', '🎸', '🎺', '🎻', '🪕', '🥁', '🪘', '🎹', '🎼',
    '🎯', '🎳', '🎮', '🕹️', '🎰', '🧩', '🎲', '♠️', '♥️', '♦️',
    '♣️', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶'
  ];

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Welcome to Chat</h3>
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  // Safely get user avatar and username
  const userAvatar = selectedChat?.user?.avatar || 'https://via.placeholder.com/40';
  const userName = selectedChat?.user?.username || 'User';

  const toAbsolute = (maybePath) => {
    if (!maybePath) return '';
    if (maybePath.startsWith('http://') || maybePath.startsWith('https://')) return maybePath;
    const api = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const origin = api.replace(/\/api$/, '');
    return `${origin}${maybePath}`;
  };

  // Get properly formatted avatar URL with cache busting
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return 'https://via.placeholder.com/40';
    const absoluteUrl = toAbsolute(avatarPath);
    return getBustCacheImageUrl(absoluteUrl);
  };

  return (
    <div className="flex-1 flex flex-col chat-bg">
      {/* Add CSS animations in style tag */}
      <style>{`
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* 🔥 Folding & shrinking delete animation */
  @keyframes foldAndFadeOut {
    0% {
      opacity: 1;
      transform: scale(1) rotateX(0deg);
    }
    40% {
      transform: scale(0.97) rotateX(15deg);
    }
    70% {
      transform: scale(0.85) rotateX(60deg);
      opacity: 0.6;
    }
    100% {
      opacity: 0;
      transform: scale(0.6) rotateX(90deg);
      height: 0;
      margin: 0;
      padding: 0;
    }
  }

  .message-enter {
    animation: slideInUp 0.3s ease-out forwards;
  }

  .message-exit {
    animation: foldAndFadeOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-origin: top center;
    overflow: hidden;
  }

  .message-bubble {
    transition: all 0.2s ease;
  }

  .message-bubble:hover {
    transform: scale(1.02);
  }
`}</style>



      {/* Chat Header */}
      <div className="glass-strong border-b border-white/20 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Back Button (Mobile Only) */}
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Back to chat list"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <img
            src={getAvatarUrl(userAvatar)}
            alt={userName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{userName}</h3>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white-100 rounded-full transition-colors duration-200" aria-label="Call">
            <svg className="w-5 h-5 text-white-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 20 3 14.284 3 7V5z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-white-100 rounded-full transition-colors duration-200" aria-label="Video call">
            <svg className="w-5 h-5 text-white-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {displayMessages && displayMessages.length > 0 ? (
          displayMessages.map((message) => {
            const isDeleting = deletingMessageIds.has(message.id);
            
            return (
             <div
  key={message.id}
  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} ${
    deletingMessageIds.has(message.id) ? 'message-exit' : 'message-enter'
  }`}
  onMouseEnter={() => {
    if (message.isOwn && !deletingMessageIds.has(message.id)) {
      setHoveredMessageId(message.id);
    }
  }}
>

                <div className={`flex max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse' : 'flex-row'} items-start relative`}>
                  
                  {/* Delete button - appears on hover, positioned outside left */}
                  {message.isOwn && hoveredMessageId === message.id && !isDeleting && (
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                      <MessageActions messageId={message.id} onDelete={handleDeleteMessage} />
                    </div>
                  )}

                  {!message.isOwn && (
                    <img
                      src={getAvatarUrl(userAvatar)}
                      alt={userName}
                      className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                    />
                  )}
                  <div className={`message-bubble ${message.isOwn ? 'message-sent' : 'message-received'}`}>
                    {/* Message content: supports text, image, file */}
                    {message.messageType === 'image' ? (
                      <img src={toAbsolute(message.content || message.text)} alt="attachment" className="max-w-full rounded" />
                    ) : message.messageType === 'file' ? (
                      <a href={toAbsolute(message.content || '#')} target="_blank" rel="noreferrer" className="underline flex items-center space-x-2">
                        <span>📄</span>
                        <span>{(message.content || '').split('/').pop() || 'Download file'}</span>
                      </a>
                    ) : (
                      <p className="text-sm break-words">{message.text}</p>
                    )}
                    {message.timestamp && (
                      <p className={`message-time ${message.isOwn ? 'text-blue-100' : 'text-gray-700'}`}>
                        {message.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8 text-white-500">
            No messages yet
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} onUploadFile={onUploadFile} emojis={emojis} />
    </div>
  );
};

export default ChatWindow;