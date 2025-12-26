'use client';

import { useState, useEffect, useCallback } from 'react';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  loginTime: number | null;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    loginTime: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          isAdmin: data.authenticated,
          isLoading: false,
          loginTime: data.loginTime || null,
        });
      } else {
        setAuthState({
          isAdmin: false,
          isLoading: false,
          loginTime: null,
        });
      }
    } catch (error) {
      setAuthState({
        isAdmin: false,
        isLoading: false,
        loginTime: null,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAdmin: false,
        isLoading: false,
        loginTime: null,
      });
    }
  }, []);

  const refreshLoginTime = useCallback(async () => {
    try {
      await fetch('/api/admin/refresh-session', {
        method: 'POST',
        credentials: 'include',
      });
      await checkAuth();
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAdmin: authState.isAdmin,
    isLoading: authState.isLoading,
    loginTime: authState.loginTime,
    checkAuth,
    logout,
    refreshLoginTime,
  };
}

export default useAdminAuth;
