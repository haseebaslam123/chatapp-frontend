import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ChatPage from './components/ChatPage';
import apiService from './services/api';
import socketService from './services/socket';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success) {
            setCurrentUser(response.data.user);
            setIsAuthenticated(true);
            // Connect to socket
            socketService.connect(token);
          } else {
            // If response is not successful, clear token and set as not authenticated
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        // No token, ensure user is not authenticated
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (userData) => {
    try {
      const response = await apiService.login(userData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        // Connect to socket
        socketService.connect(response.data.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      socketService.disconnect();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} replace />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <SignupPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ChatPage 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                isAuthenticated={isAuthenticated}
              />
            } 
          />
          <Route 
            path="/chat/:chatId" 
            element={
              <ChatPage 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                isAuthenticated={isAuthenticated}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
