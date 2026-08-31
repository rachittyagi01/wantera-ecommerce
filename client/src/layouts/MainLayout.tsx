import { Outlet, Link } from "react-router"

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          WANTERA
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <Link to="/cart" className="hover:text-primary">Cart</Link>
          <Link to="/login" className="hover:text-primary">Login</Link>
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