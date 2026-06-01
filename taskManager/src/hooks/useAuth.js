import { useState } from 'react';
import { loginUser } from '../api/authService';

/**
 * Authentication Hook
 * Manages the user session, token storage, and login/logout logic.
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('tm_token');
      const savedUser = sessionStorage.getItem('tm_user');
      return (token && savedUser) ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading] = useState(false);

  /**
   * Attempts to authenticate the user
   * @param {string} identifier - Email or Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Success status and error message if any
   */
  const login = async (identifier, password) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    try {
      const data = await loginUser(identifier, password, controller.signal);
      clearTimeout(timeout);
      
      if (data.success) {
        // Prepare standardized user object
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.username,
          role: data.user.role || 'user',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        };
        
        // Persist session
        localStorage.setItem('tm_token', data.token);
        sessionStorage.setItem('tm_user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || 'Authentication failed' };
      }
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { success: false, message: 'Request timed out. Please check your connection.' };
      }
      return { success: false, message: 'Cannot connect to server. Is the backend running?' };
    }
  };

  /**
   * Updates the current user state and persisted session storage
   * @param {Object} newUser - Updated user data from API
   */
  const updateUser = (newUser) => {
    const updatedUser = {
      ...user,
      email: newUser.email,
      name: newUser.username || newUser.name,
      role: newUser.role || user.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.email}`,
    };
    sessionStorage.setItem('tm_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  /**
   * Clears session and logs out the user
   */
  const logout = () => {
    localStorage.removeItem('tm_token');
    sessionStorage.removeItem('tm_user');
    setUser(null);
  };

  return { user, login, logout, loading, updateUser };
};
