import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './UIComponents';

/**
 * PrivateRoute
 * Wraps any <Route> that requires the user to be logged in.
 * If not logged in → redirect to /login.
 * While auth state is loading → show a full-page spinner.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-wrap" style={{ height: '100vh' }}>
        <Loader text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
