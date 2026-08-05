import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { proxtimeService } from '../services/proxtime';

interface AuthContextType {
  user: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (nikOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentRole: 'admin',
  isAuthenticated: false,
  isLoading: true,
  isAdmin: true,
  login: async () => {},
  logout: async () => {},
  switchRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      try {
        const profile = await proxtimeService.getUserProfile();
        setUser(profile);
        setCurrentRole(profile.role || 'admin');
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (nikOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await proxtimeService.login(nikOrEmail, password);
      setUser(loggedUser);
      setCurrentRole(loggedUser.role || 'admin');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: currentRole === 'admin',
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
