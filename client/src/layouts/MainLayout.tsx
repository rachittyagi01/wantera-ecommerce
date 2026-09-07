import { Outlet, Link, useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { useLogoutApiMutation } from "@/services/authApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MainLayout() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutApiMutation();

  async function handleLogout() {
    try {
      await logoutApi().unwrap();
    } catch {
      // even if the API call fails, we still clear local state below
    }
    dispatch(logout());
    navigate("/");
  }

  // Generates initials from a name, e.g. "Rachit Tyagi" -> "RT"
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          WANTERA
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/30 transition-all">
                    <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 z-50 bg-background"
              >
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
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-error cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hover:text-primary">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface px-6 py-12 mt-auto">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-2xl font-display font-bold text-primary mb-2">
            WANTERA
          </p>
          <p className="text-text-muted text-sm mb-6">
            Want It. Find It. Love It.
          </p>
          <div className="flex justify-center gap-6 text-sm text-text-muted mb-6">
            <Link to="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <Link to="/orders" className="hover:text-primary transition-colors">
              Orders
            </Link>
            <Link
              to="/account"
              className="hover:text-primary transition-colors"
            >
              Account
            </Link>
          </div>
          <p className="text-xs text-text-muted">
            © 2026 WANTERA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
