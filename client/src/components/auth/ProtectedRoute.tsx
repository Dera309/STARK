import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AppSkeleton from "../ui/AppSkeleton";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const location = useLocation();

  // Wait for localStorage hydration before making any routing decision
  if (isLoading) return <AppSkeleton />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For admin routes: only redirect if user is fully loaded and confirmed non-admin
  if (adminOnly && user && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If adminOnly but user not yet loaded (shouldn't happen after isLoading=false, but guard anyway)
  if (adminOnly && !user) {
    return <AppSkeleton />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
