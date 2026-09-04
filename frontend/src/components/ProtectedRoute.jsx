import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function FullLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (user === null) return <FullLoader />;
  if (user === false) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}
