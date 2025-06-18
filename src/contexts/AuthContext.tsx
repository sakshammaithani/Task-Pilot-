// taskpilot-frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // We'll use axios for HTTP requests
import type { ReactNode } from 'react';
// Define the shape of the user object coming from the backend
interface User {
  id: string;
  googleId: string;
  displayName: string;
  email: string;
  profilePic?: string;
}

// Define the shape of the AuthContext value
interface AuthContextType {
  user: User | null;
  isLoading: boolean; // True while checking auth status
  login: () => void; // Initiates Google OAuth login
  logout: () => Promise<void>; // Logs out the user
  isAuthenticated: boolean;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true, checking auth status

  // Set axios defaults to send cookies (for session management)
  axios.defaults.withCredentials = true;
  const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000'; // Make sure this matches your backend URL

  // Function to check authentication status with the backend
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/status`);
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    checkAuthStatus(); // Check auth status on component mount
  }, [checkAuthStatus]);

  // Function to initiate Google OAuth login
  const login = useCallback(() => {
    // Redirect to your backend's Google OAuth initiation endpoint
    window.location.href = `${API_URL}/auth/google`;
  }, [API_URL]);

  // Function to logout
  const logout = useCallback(async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`);
      setUser(null); // Clear user state
      // Optionally, redirect to home or login page after logout
      // window.location.href = '/'; // Or a specific logout success page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [API_URL]);

  const isAuthenticated = !!user; // Simple boolean check for authentication

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};