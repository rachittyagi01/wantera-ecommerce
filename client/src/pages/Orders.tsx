import { Link } from "react-router"
import { useGetMyOrdersQuery } from "@/services/ordersApi"
import { useAppSelector } from "@/store/hooks"

const statusColors: Record<string, string> = {
  PENDING: "text-warning",
  CONFIRMED: "text-info",
  PROCESSING: "text-info",
  SHIPPED: "text-info",
  OUT_FOR_DELIVERY: "text-info",
  DELIVERED: "text-success",
  CANCELLED: "text-error",
}

export default function Orders() {
  const user = useAppSelector((state) => state.auth.user)
  const { data, isLoading } = useGetMyOrdersQuery(undefined, { skip: !user })

  if (!user) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please log in to view your orders.</p>
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading orders...</div>
  }

  const orders = data?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">You haven't placed any orders yet.</p>
        <Link to="/shop" className="text-primary hover:underline">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block border border-border rounded-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-text-muted">
                  Order placed {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>
                <p className="text-xs text-text-muted mt-1">Order #{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <span className={`text-sm font-medium ${statusColors[order.orderStatus] || ""}`}>
                {order.orderStatus.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                {order.items.length} item{order.items.length > 1 ? "s" : ""} — {order.items[0]?.name}
                {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
              </p>
              <p className="font-semibold text-primary">₹{order.total}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}