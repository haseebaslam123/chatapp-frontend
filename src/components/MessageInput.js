import React, { useState, useEffect, useRef } from 'react';

const MessageInput = ({ onSendMessage, onUploadFile, emojis }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const emojiPickerRef = useRef(null); // 👈 Reference for emoji popup
  const emojiButtonRef = useRef(null); // 👈 Reference for emoji button
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile && onUploadFile) {
      onUploadFile(selectedFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      setSelectedFile(null);
      return;
    }
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // ✅ Keep emoji popup open when emoji is clicked
  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
    // ❌ Removed setShowEmojis(false);
  };

  // ✅ Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojis(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (

    <div className="p-4 relative glass border-t border-white/10">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">

        {/* Emoji Button */}
        <div className="relative">
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojis((prev) => !prev)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
            aria-label="Emoji picker"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Emoji Popup */}
          {showEmojis && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-80 max-h-64 overflow-y-auto"
            >
              <div className="grid grid-cols-8 gap-2">
                {emojis &&
                  emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 text-sm flex items-center justify-center w-8 h-8"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) {
                setSelectedFile(file);
                if (file.type && file.type.startsWith('image/')) {
                  setPreviewUrl(URL.createObjectURL(file));
                } else {
                  setPreviewUrl('');
                }
              }
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
            aria-label="Attach file"
            title="Attach file"
          >
            📎
          </button>
        </div>

        {/* Message Input */}
        
        <div className="flex-1 relative">
          {selectedFile && (
            <div className="mb-2 flex items-center space-x-3">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>📄</span>
                  <span>{selectedFile.name}</span>
                </div>
              )}
              <button type="button" onClick={() => { setSelectedFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(''); } }} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-3 pr-12 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-white/85 text-gray-900 shadow-md"
            rows="1"
            style={{
              minHeight: '48px',
              maxHeight: '128px',
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() && !selectedFile}
          className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
            message.trim() || selectedFile
              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:to-fuchsia-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-white/30 text-white/50 cursor-not-allowed border border-white/20'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
        
      </form>
      
    </div>
    
  );
};

export default MessageInput;
