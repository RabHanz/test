import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin' | 'coach';
  programs: string[]; // Array of program IDs
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // TODO: Implement actual session check with your backend
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Verify token and get user data
        // const userData = await verifyToken(token);
        // setUser(userData);
      }
    } catch (err) {
      setError('Failed to authenticate session');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement actual login with your backend
      // const response = await loginAPI(email, password);
      // const { token, user } = response;
      
      // For demo purposes, using mock data
      const mockUser: User = {
        id: '1',
        email,
        name: 'Demo User',
        role: 'client',
        programs: ['launch', 'scale'],
      };
      
      // localStorage.setItem('auth_token', token);
      setUser(mockUser);
      router.push('/portal');
    } catch (err) {
      setError('Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual logout with your backend
      // await logoutAPI();
      localStorage.removeItem('auth_token');
      setUser(null);
      router.push('/login');
    } catch (err) {
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 