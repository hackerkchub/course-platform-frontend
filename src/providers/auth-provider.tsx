'use client';

import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { UserProfile, UserRole } from '@/types/auth';
import { normalizeUserProfile } from '@/lib/auth/normalize';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  isLoggingOut: false,
  logout: async () => {},
  logoutAll: async () => {},
  refetchUser: async () => {},
});

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<UserProfile | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.auth.me);
        return normalizeUserProfile(res.data?.data?.user || res.data?.data);
      } catch {
        return null;
      }
    },
    initialData: initialUser,
    staleTime: 5 * 60 * 1000,
  });

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch {
      // Ignore network failure on logout or already expired sessions
    } finally {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries();
      window.location.href = '/';
    }
  };

  const logoutAll = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiClient.post(API_ENDPOINTS.auth.logoutAll);
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries();
      window.location.href = '/login';
    } catch (err) {
      setIsLoggingOut(false);
      throw err;
    }
  };

  const refetchUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        isLoggingOut,
        logout,
        logoutAll,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
