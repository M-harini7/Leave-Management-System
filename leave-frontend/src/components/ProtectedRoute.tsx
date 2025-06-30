// ProtectedRoute.tsx
import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface IProtectedRouteProps {
  allowedRoles: string[];
  children: ReactElement;
}

interface IJwtPayload {
  role?: string;
  // add other fields you expect in your JWT payload here
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('[ProtectedRoute] No token found. Redirecting...');
    return <Navigate to="/auth" replace />;
  }

  try {
    const decoded = jwtDecode<IJwtPayload>(token);
    console.log('[ProtectedRoute] Decoded token:', decoded);

    const userRole = decoded.role?.toLowerCase();
    console.log('[ProtectedRoute] User role:', userRole);
    console.log('[ProtectedRoute] Allowed roles:', allowedRoles);

    if (!userRole || !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
      console.warn('[ProtectedRoute] Role not allowed. Redirecting...');
      return <Navigate to="/auth" replace />;
    }
  } catch (e) {
    console.error('[ProtectedRoute] Invalid token. Removing and redirecting...', e);
    localStorage.removeItem('token');
    return <Navigate to="/auth" replace />;
  }

  console.log('[ProtectedRoute] Access granted. Rendering children...');
  return children;
};

export default ProtectedRoute;
