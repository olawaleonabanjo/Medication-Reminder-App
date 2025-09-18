import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export  function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base URL for API
  axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || 'http://localhost:5500/api';

  // Save/remove token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      setAuthToken(token);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  // Register
  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
      });
      const { user, token } = response.data.data;
      setAuthToken(token);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Check token on first load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const response = await axios.get('/auth/me');
          setCurrentUser(response.data.user);
        } catch (error) {
          console.error(
            'Auth check failed:',
            error.response?.data || error.message
          );
          logout();
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
