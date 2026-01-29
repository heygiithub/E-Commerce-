import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ role, children }) {
  const { user, loading } = useAuth();

  // wait for auth to hydrate
  if (loading) {
    return <div className="text-center mt-10">Checking authentication...</div>;
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // role not allowed
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // allowed
  return children;
}
