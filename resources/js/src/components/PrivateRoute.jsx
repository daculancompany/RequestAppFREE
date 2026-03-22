// components/PrivateRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const location = useLocation();
  
  const isAuthenticated = () => {
    const user = localStorage.getItem('adminpro_user');
    const token = localStorage.getItem('adminpro_token');
    return !!(user && token);
  };

  if (!isAuthenticated()) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}