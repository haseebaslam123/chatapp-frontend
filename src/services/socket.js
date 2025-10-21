import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const serverURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverURL, {
      auth: {
        token
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a chat room
  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  // Leave a chat room
  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  // Delete a message
  deleteMessage(messageId, chatId) {
    if (this.socket) {
      this.socket.emit('delete_message', { messageId, chatId });
    }
  }

  // Start typing indicator
  startTyping(chatId, receiverId) {
    if (this.socket) {
      this.socket.emit('typing_start', { chatId, receiverId });
    }
  }

  // Stop typing indicator
  stopTyping(chatId, receiverId) {
    if (this.socket) {
      this.socket.emit('typing_stop', { chatId, receiverId });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId) {
    if (this.socket) {
      this.socket.emit('mark_message_read', { messageId });
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('chat_message', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message_deleted', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message_read', callback);
    }
  }

  onJoinedChat(callback) {
    if (this.socket) {
      this.socket.on('joined_chat', callback);
    }
  }

  onLeftChat(callback) {
    if (this.socket) {
      this.socket.on('left_chat', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();