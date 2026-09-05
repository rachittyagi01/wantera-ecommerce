import { Link } from "react-router"
import { useGetDashboardStatsQuery } from "@/services/adminApi"

export default function AdminDashboard() {
  const { data, isLoading, isError } = useGetDashboardStatsQuery()

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading dashboard...</div>
  }

  if (isError || !data) {
    return <div className="px-6 py-16 text-error">Failed to load dashboard.</div>
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-border rounded-card p-5">
          <p className="text-text-muted text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold text-primary">₹{data.totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="border border-border rounded-card p-5">
          <p className="text-text-muted text-sm mb-1">Total Orders</p>
          <p className="text-2xl font-semibold">{data.totalOrders}</p>
        </div>
        <div className="border border-border rounded-card p-5">
          <p className="text-text-muted text-sm mb-1">Total Users</p>
          <p className="text-2xl font-semibold">{data.totalUsers}</p>
        </div>
        <div className="border border-border rounded-card p-5">
          <p className="text-text-muted text-sm mb-1">Total Products</p>
          <p className="text-2xl font-semibold">{data.totalProducts}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-10">
        <Link to="/admin/products" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-default text-sm font-medium">
          Manage Products
        </Link>
        <Link to="/admin/orders" className="border border-border hover:bg-surface px-4 py-2 rounded-default text-sm font-medium">
          Manage Orders
        </Link>
        <Link to="/admin/coupons" className="border border-border hover:bg-surface px-4 py-2 rounded-default text-sm font-medium">
          Manage Coupons
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="border border-border rounded-card p-5">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-text-muted text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.user?.name || "Unknown"}</p>
                    <p className="text-text-muted text-xs">{order.orderStatus}</p>
                  </div>
                  <p className="font-medium">₹{order.total}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="border border-border rounded-card p-5">
          <h2 className="font-semibold mb-4">Low Stock Alerts</h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-text-muted text-sm">All products well-stocked.</p>
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <div key={p._id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-warning font-medium">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}