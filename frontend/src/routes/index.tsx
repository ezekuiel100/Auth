import { Navigate, Outlet } from "react-router";
import { useUser } from "../AuthProvider";

export function PublicRoutes() {
  const { user } = useUser();

  if (user) return <Navigate to="/" />;

  return <Outlet />;
}

export function PrivateRoutes() {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" />;

  return <Outlet />;
}
