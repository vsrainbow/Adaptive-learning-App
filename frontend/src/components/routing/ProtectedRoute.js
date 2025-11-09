import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  if (auth.loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  if (!auth.user) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && auth.user.role !== role) {
    // Logged in, but wrong role
    // Redirect them to their own dashboard
    const dashboardPath = auth.user.role === 'student' ? '/student' : '/instructor';
    return <Navigate to={dashboardPath} state={{ from: location }} replace />;
  }

  // Logged in and has correct role (or no specific role required)
  return children;
};

export default ProtectedRoute;