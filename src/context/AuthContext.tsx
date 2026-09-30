import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, BackendHealth } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (endpoint: string, credentials: Record<string, unknown>) => Promise<User>;
  register: (endpoint: string, payload: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  switchFacility: (facilityId: number) => Promise<void>;
  health: BackendHealth | null;
  refreshHealth: () => Promise<void>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hg_token'));
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<BackendHealth | null>(null);

  const refreshHealth = useCallback(async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      setHealth(null);
    }
  }, []);

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      refreshHealth();
      const storedToken = localStorage.getItem('hg_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/facility/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const fac = await res.json();
          setUser({
            id: 2,
            email: 'manager@hospital.gov',
            role: 'manager',
            hospital_name: fac.hospital_name || fac.name,
            address: fac.address,
            facility_id: fac.id,
          });
          setToken(storedToken);
        } else {
          // If 403, might be a viewer account
          const storedUser = localStorage.getItem('hg_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem('hg_token');
              localStorage.removeItem('hg_user');
            }
          } else {
            localStorage.removeItem('hg_token');
          }
        }
      } catch {
        // network issue, keep storedUser if any
        const storedUser = localStorage.getItem('hg_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshHealth]);

  const login = async (endpoint: string, credentials: Record<string, unknown>): Promise<User> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Sign in failed');
    }

    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('hg_token', data.access_token);
    localStorage.setItem('hg_user', JSON.stringify(data.user));
    refreshHealth();
    return data.user;
  };

  const register = async (endpoint: string, payload: Record<string, unknown>): Promise<User> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Account registration failed');
    }

    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('hg_token', data.access_token);
    localStorage.setItem('hg_user', JSON.stringify(data.user));
    refreshHealth();
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hg_token');
    localStorage.removeItem('hg_user');
  };

  const switchFacility = async (facilityId: number) => {
    try {
      const res = await authenticatedFetch('/api/facilities/switch', {
        method: 'POST',
        body: JSON.stringify({ facility_id: facilityId }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('hg_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Failed to switch facility:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchFacility,
        health,
        refreshHealth,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
