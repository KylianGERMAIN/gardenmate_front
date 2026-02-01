import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { User, LoginRequest, AuthTokens } from '../types';
import { getUserIdFromToken } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            const userUid = getUserIdFromToken(accessToken);
            if (userUid) {
              const userData = await userService.getUser(userUid);
              setUser(userData);
              localStorage.setItem('userUid', userUid);
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading user:', error);
          }
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [isAuthenticated]);

  const login = async (credentials: LoginRequest) => {
    try {
      const tokens: AuthTokens = await authService.login(credentials);
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      const userUid = getUserIdFromToken(tokens.accessToken);
      if (userUid) {
        localStorage.setItem('userUid', userUid);
        const userData = await userService.getUser(userUid);
        setUser(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('userUid');
  };

  const refreshUser = async () => {
    const userUid = localStorage.getItem('userUid');
    if (userUid) {
      try {
        const userData = await userService.getUser(userUid);
        setUser(userData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error refreshing user:', error);
        }
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
