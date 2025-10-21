# Chat App Frontend

A modern, responsive chat application built with React.js and Tailwind CSS, featuring a WhatsApp-like interface with authentication, real-time messaging, and user search functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000` to view the application.

## 📁 Project Structure

```
src/
├── components/
│   ├── AuthPage.js          # Authentication (Login/Signup) component
│   ├── ChatInterface.js     # Main chat layout container
│   ├── ChatSidebar.js       # Left sidebar with chat list and search
│   ├── ChatWindow.js        # Right side chat window with messages
│   ├── MessageInput.js      # Message input with emoji picker
│   └── ProfileDropdown.js   # User profile dropdown menu
├── App.js                   # Main application component
├── index.js                 # React DOM entry point
└── index.css                # Global styles and Tailwind imports
```

## 📋 File Descriptions

### Core Application Files

- **`App.js`** - Main application component that manages authentication state and renders either the login page or chat interface
- **`index.js`** - React DOM entry point that renders the App component
- **`index.css`** - Global CSS file with Tailwind imports and custom component styles

### Component Files

- **`AuthPage.js`** - Handles user authentication with login and signup forms, includes form validation and error handling
- **`ChatInterface.js`** - Main container that manages chat state, handles chat selection, and coordinates between sidebar and chat window
- **`ChatSidebar.js`** - Left sidebar containing chat list, user search functionality, and new chat button
- **`ChatWindow.js`** - Right side chat window displaying selected conversation with message history and header
- **`MessageInput.js`** - Message input component with emoji picker, send button, and keyboard shortcuts
- **`ProfileDropdown.js`** - User profile dropdown menu with edit profile functionality and logout option

### Configuration Files

- **`package.json`** - Project dependencies and scripts
- **`tailwind.config.js`** - Tailwind CSS configuration with custom colors and animations
- **`postcss.config.js`** - PostCSS configuration for Tailwind CSS processing

## 🎨 Features

### Authentication
- Single page with toggle between Login and Signup
- Form validation with error messages
- Smooth animations and transitions

### Chat Interface
- **Left Sidebar:**
  - Chat list with user avatars and last messages
  - Search functionality to find users
  - New chat button
  - Profile dropdown menu

- **Right Chat Window:**
  - Chat header with user info
  - Message history with sent/received styling
  - Message input with emoji picker
  - Real-time message updates

### Design & Animations
- Modern, clean UI with Tailwind CSS
- Smooth animations for interactions
- Responsive design for all screen sizes
- Custom color scheme and hover effects

## 🛠️ Dependencies

### Production Dependencies
- `react` - React library for building user interfaces
- `react-dom` - React DOM rendering
- `react-scripts` - Create React App build tools

### Development Dependencies
- `tailwindcss` - Utility-first CSS framework
- `autoprefixer` - CSS vendor prefixing
- `postcss` - CSS post-processing

## 🎯 Key Features Implemented

1. **Authentication System** - Login and signup with form validation
2. **Chat List** - Display all conversations with user avatars and last messages
3. **User Search** - Search and start new conversations with other users
4. **Message Interface** - Send and receive messages with emoji support
5. **Profile Management** - Edit user profile information
6. **Responsive Design** - Works on desktop and mobile devices
7. **Smooth Animations** - Fade-in, slide-in, and hover effects

## 🔧 Customization

### Colors
The app uses a custom color scheme defined in `tailwind.config.js`:
- Primary colors: Blue theme (`#0ea5e9`)
- Chat colors: Light gray backgrounds
- Custom animations for smooth interactions

### Adding New Features
1. Create new components in the `src/components/` directory
2. Import and use them in the appropriate parent components
3. Follow the existing naming convention and structure

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🚀 Deployment

To build the application for production:

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🔮 Backend Integration

This frontend is designed to work with a backend API. The following endpoints would be needed:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /users/search` - Search users
- `GET /chats` - Get user's chats
- `POST /chats` - Create new chat
- `GET /messages/:chatId` - Get chat messages
- `POST /messages` - Send message
- `PUT /profile` - Update user profile

## 📝 Notes

- All user data is currently stored in component state (sample data)
- Replace sample data with actual API calls for production use
- The app includes sample users and messages for demonstration
- Profile images are generated using UI Avatars service
- Emoji picker includes 12 common emojis for quick selection

## 🎉 Ready to Use!

The frontend is now complete and ready for development. Simply run `npm start` to begin working with the application. The clean, minimal structure makes it easy to understand and modify as needed.
