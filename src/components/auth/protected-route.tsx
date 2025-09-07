"use client";

import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || <LoadingSpinner message="Verifying access..." />;
  }

  if (!isAuthenticated) {
    return null; // Let middleware handle redirect
  }

  return <>{children}</>;
}
