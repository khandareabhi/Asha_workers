import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initDatabase,
  createUser,
  getUserByEmail,
  getUserByEmailAndPassword,
} from '../db/sqlite';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
      } catch (e) {
        console.warn('DB init failed (may already be initialized):', e);
      }
      await checkAuthState();
    })();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('asha_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const foundUser = await getUserByEmailAndPassword(email, password);
      if (foundUser) {
        await AsyncStorage.setItem('asha_user', JSON.stringify(foundUser));
        setUser(foundUser);
        return { success: true, user: foundUser };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const exists = await getUserByEmail(userData.email);
      if (exists) {
        return { success: false, error: 'User already exists with this email' };
      }
      const created = await createUser({
        id: String(Date.now()),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        ashaId: userData.ashaId,
        phone: userData.phone,
        supervisorId: userData.supervisorId,
        territory_state: userData.territory?.state,
        territory_district: userData.territory?.district,
        territory_block: userData.territory?.block,
        territory_village: userData.territory?.village,
        preferred_language: 'en',
      });
      await AsyncStorage.setItem('asha_user', JSON.stringify(created));
      setUser(created);
      return { success: true, user: created };
    } catch (error) {
      if (String(error?.message).includes('EMAIL_EXISTS')) {
        return { success: false, error: 'User already exists with this email' };
      }
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('asha_user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};