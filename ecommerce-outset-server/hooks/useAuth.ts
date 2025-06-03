import { useState, useCallback } from 'react';
import { AuthService } from '../services/auth';
import { useUserStore } from '../store/userStore';
import type { User, LoginCredentials, RegisterData } from '../types/auth';

interface UseAuthOptions {
  debug?: boolean;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { debug = false } = options;

  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null
  });

  const { user, setUser, clearUser } = useUserStore();
  const authService = new AuthService();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.login(credentials);
      setUser(user);
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return user;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to login';
      setState(prev => ({ ...prev, isLoading: false, error }));
      if (debug) console.error('Login failed:', err);
      return null;
    }
  }, [setUser, debug]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.register(data);
      setUser(user);
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return user;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to register';
      setState(prev => ({ ...prev, isLoading: false, error }));
      if (debug) console.error('Registration failed:', err);
      return null;
    }
  }, [setUser, debug]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();
      clearUser();
      setState(prev => ({ ...prev, isLoading: false, error: null }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to logout';
      setState(prev => ({ ...prev, isLoading: false, error }));
      if (debug) console.error('Logout failed:', err);
    }
  }, [clearUser, debug]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return updatedUser;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update profile';
      setState(prev => ({ ...prev, isLoading: false, error }));
      if (debug) console.error('Profile update failed:', err);
      return null;
    }
  }, [setUser, debug]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authService.resetPassword(email);
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to reset password';
      setState(prev => ({ ...prev, isLoading: false, error }));
      if (debug) console.error('Password reset failed:', err);
      return false;
    }
  }, [debug]);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.verifyEmail(token);
      setUser(user);
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return user;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to verify email';
      setState(prev => ({ ...prev, isLoading: false, error }));
      if (debug) console.error('Email verification failed:', err);
      return null;
    }
  }, [setUser, debug]);

  return {
    ...state,
    user,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    verifyEmail
  };
}; 