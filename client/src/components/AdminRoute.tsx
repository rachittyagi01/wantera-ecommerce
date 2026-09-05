import { Navigate, Outlet } from "react-router"
import { useAppSelector } from "@/store/hooks"

export default function AdminRoute() {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}