import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute
 * Only lets users with ROLE_ADMIN through.
 * Anyone else is redirected:
 *   - Not logged in → /login
 *   - Logged in but not admin → /dashboard
 */
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  // Still checking localStorage on initial render — wait
  if (loading) return null;

  if (!user)      return <Navigate to="/login"     replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  return children;
}

export default AdminRoute;
