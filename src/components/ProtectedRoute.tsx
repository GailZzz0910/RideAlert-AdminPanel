import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = "/"
}) => {
  const { user, loading } = useUser();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role to their appropriate dashboard
    const userRedirect = user.role === "superadmin" ? "/super-admin" : "/dashboard";
    return <Navigate to={userRedirect} replace />;
  }

  return <>{children}</>;
};
