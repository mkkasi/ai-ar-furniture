import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('admin_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    if (token && !user) {
      authApi
        .profile()
        .then((res) => setUser(res.data.data.user))
        .catch(() => {
          localStorage.removeItem('admin_access_token');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The axios response interceptor dispatches this event on a 401 instead
  // of clearing storage/redirecting itself, so the in-memory `user` state
  // and localStorage never fall out of sync, and the redirect only ever
  // happens once even if several requests 401 at the same time.
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      setUser(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { user: loggedInUser, accessToken } = res.data.data;
      if (loggedInUser.role !== 'admin') {
        throw new Error('This account does not have admin access.');
      }
      localStorage.setItem('admin_access_token', accessToken);
      localStorage.setItem('admin_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
