import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionStore } from "@/store/session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
