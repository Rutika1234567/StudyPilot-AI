import React, { createContext, useContext, useState, useEffect } from 'react';

// Global auth state — any component can read user/token without prop drilling
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);   // { id, username, email, roles, token }
  const [loading, setLoading] = useState(true);

  // On first load, check if user was previously logged in (token in localStorage)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData comes from the AuthResponse the server returns
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}