import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UnauthorizedView } from './UnauthorizedView';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  sectionName?: string;
  onUnauthorizedRedirect?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  sectionName = 'Restricted Module',
  onUnauthorizedRedirect,
}) => {
  const { isAuthenticated, currentRole } = useApp();

  // 1. Authentication Guard
  if (!isAuthenticated) {
    return null; // Will trigger login redirect in App root
  }

  // 2. Role-Based Access Control (RBAC) Guard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return (
      <UnauthorizedView
        requiredRoles={allowedRoles}
        attemptedSection={sectionName}
        onReturnDashboard={onUnauthorizedRedirect}
      />
    );
  }

  return <>{children}</>;
};
