# Full-Stack Chat App Setup Guide

This guide will help you set up and run the complete full-stack chat application with React.js frontend and Express.js backend.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/atlas)
- **Git** (optional) - [Download here](https://git-scm.com/)

## 🗂️ Project Structure

```
web app/
├── server/                 # Backend (Express.js + MongoDB)
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── models/
│   │   ├── User.js         # User model
│   │   ├── Message.js      # Message model
│   │   └── Chat.js         # Chat model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── users.js        # User management routes
│   │   └── messages.js     # Message routes
│   ├── socket/
│   │   └── socketHandler.js # Socket.io handlers
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Main server file
│   └── env.example        # Environment variables template
├── src/                    # Frontend (React.js)
│   ├── components/         # React components
│   ├── services/           # API and Socket services
│   └── ...                 # Other frontend files
├── package.json            # Frontend dependencies
└── README.md               # Project documentation
```

## 🚀 Step-by-Step Setup

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (choose the free tier)

2. **Get Database Credentials**
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It will look like: `mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority`

3. **Create Database User**
   - Go to "Database Access" in your Atlas dashboard
   - Click "Add New Database User"
   - Create a username and password
   - Note these credentials for the `.env` file

### 2. Backend Setup

1. **Navigate to Server Directory**
   ```bash
   cd server
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   ```bash
   # Copy the example file
   cp env.example .env
   ```

4. **Configure Environment Variables**
   Edit the `.env` file with your actual values:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration (Replace with your actual values)
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/chat-app?retryWrites=true&w=majority

   # JWT Configuration (Change this to a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRE=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=uploads/
   ```

5. **Start Backend Server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Or production mode
   npm start
   ```

   You should see:
   ```
   🚀 Server running on port 5000
   📱 Environment: development
   🌐 CORS enabled for: http://localhost:3000
   MongoDB Connected: your-cluster.mongodb.net
   ```

### 3. Frontend Setup

1. **Navigate to Root Directory**
   ```bash
   cd ..  # Go back to the main project directory
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Start Frontend Development Server**
   ```bash
   npm start
   ```

   The frontend will open at `http://localhost:3000`

## 🔧 Backend Dependencies

The following packages are installed for the backend:

### Production Dependencies
- **express** - Web framework for Node.js
- **mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **socket.io** - Real-time communication
- **multer** - File upload handling
- **express-validator** - Input validation

### Development Dependencies
- **nodemon** - Auto-restart server during development

## 🎯 Frontend Dependencies

The following packages are installed for the frontend:

### Production Dependencies
- **react** - React library
- **react-dom** - React DOM rendering
- **react-scripts** - Create React App build tools
- **socket.io-client** - Socket.io client for real-time communication

### Development Dependencies
- **tailwindcss** - CSS framework
- **autoprefixer** - CSS vendor prefixing
- **postcss** - CSS post-processing

## 📁 File Explanations

### Backend Files

#### **`server/server.js`**
- Main server file that starts the Express server
- Configures middleware, routes, and Socket.io
- Handles error handling and graceful shutdown

#### **`server/config/database.js`**
- MongoDB connection configuration
- Handles connection errors and retries

#### **`server/models/User.js`**
- User schema with username, email, password
- Password hashing and validation
- Avatar generation and online status

#### **`server/models/Message.js`**
- Message schema with sender, receiver, content
- Chat ID generation and message types
- Read status and timestamps

#### **`server/models/Chat.js`**
- Chat schema for managing conversations
- Participant management and last message tracking

#### **`server/middleware/auth.js`**
- JWT token verification middleware
- Protects routes that require authentication

#### **`server/routes/auth.js`**
- User registration and login endpoints
- JWT token generation and validation
- Password comparison and user authentication

#### **`server/routes/users.js`**
- User search and profile management
- Profile update and user listing endpoints

#### **`server/routes/messages.js`**
- Message sending and retrieval
- Chat list and message history
- Message read status management

#### **`server/socket/socketHandler.js`**
- Real-time messaging with Socket.io
- User online/offline status
- Typing indicators and message events

### Frontend Files

#### **`src/services/api.js`**
- API service for HTTP requests to backend
- Handles authentication headers
- Centralized API endpoint management

#### **`src/services/socket.js`**
- Socket.io client service
- Real-time communication setup
- Event listeners and emitters

#### **`src/components/AuthPage.js`**
- Login and registration forms
- Form validation and error handling
- API integration for authentication

#### **`src/components/ChatInterface.js`**
- Main chat container
- Chat list management
- Real-time message updates

#### **`src/components/ChatSidebar.js`**
- User search functionality
- Chat list display
- Profile dropdown menu

#### **`src/components/ChatWindow.js`**
- Message display and input
- Real-time message updates
- Socket.io integration

## 🚀 Running the Complete Application

### Option 1: Run Both Servers Separately

1. **Terminal 1 - Backend**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 - Frontend**
   ```bash
   npm start
   ```

### Option 2: Use a Process Manager (Advanced)

You can use `concurrently` to run both servers with one command:

1. **Install concurrently globally**
   ```bash
   npm install -g concurrently
   ```

2. **Create a start script in root package.json**
   ```json
   {
     "scripts": {
       "dev": "concurrently \"npm run server\" \"npm run client\"",
       "server": "cd server && npm run dev",
       "client": "npm start"
     }
   }
   ```

3. **Run both servers**
   ```bash
   npm run dev
   ```

## 🔍 Testing the Application

1. **Open the application** at `http://localhost:3000`
2. **Register a new account** or login
3. **Search for users** in the sidebar
4. **Start a new chat** by clicking on a user
5. **Send messages** and see real-time updates
6. **Test with multiple browser tabs** to see real-time messaging

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB Atlas connection string
   - Ensure your IP is whitelisted in Atlas
   - Verify username and password are correct

2. **CORS Errors**
   - Check that CLIENT_URL in .env matches your frontend URL
   - Ensure backend is running on port 5000

3. **Socket.io Connection Issues**
   - Verify backend server is running
   - Check that Socket.io is properly configured
   - Look for console errors in browser

4. **Authentication Issues**
   - Check JWT_SECRET is set in .env
   - Verify token is being stored in localStorage
   - Check browser network tab for API errors

### Environment Variables Checklist

Make sure these are properly set in `server/.env`:

- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - A secure random string
- ✅ `CLIENT_URL` - Your frontend URL (http://localhost:3000)
- ✅ `PORT` - Backend port (5000)

## 📱 Features Implemented

### Authentication
- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Profile management

### Real-time Messaging
- ✅ Socket.io integration
- ✅ Instant message delivery
- ✅ Online/offline status
- ✅ Typing indicators

### Chat Management
- ✅ User search functionality
- ✅ Chat list with last messages
- ✅ Message history
- ✅ Read status tracking

### Database
- ✅ MongoDB Atlas integration
- ✅ User and message models
- ✅ Chat relationships
- ✅ Data validation

## 🎉 Success!

Your full-stack chat application is now running! You can:

- Register new users
- Search and start conversations
- Send real-time messages
- Update user profiles
- See online/offline status

The application is ready for production deployment or further development.
