import { Outlet, Link, useNavigate } from "react-router"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout } from "@/features/auth/authSlice"
import { useLogoutApiMutation } from "@/services/authApi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function MainLayout() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logoutApi] = useLogoutApiMutation()

  async function handleLogout() {
    try {
      await logoutApi().unwrap()
    } catch {
      // even if the API call fails, we still clear local state below
    }
    dispatch(logout())
    navigate("/")
  }

  // Generates initials from a name, e.g. "Rachit Tyagi" -> "RT"
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          WANTERA
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <Link to="/cart" className="hover:text-primary">Cart</Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-error cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hover:text-primary">Login</Link>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-text-muted text-sm">
        © 2026 WANTERA. Want It. Find It. Love It.
      </footer>
    </div>
  )
}