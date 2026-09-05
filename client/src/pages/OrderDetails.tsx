import { useParams, Link } from "react-router"
import { useGetMyOrderByIdQuery } from "@/services/ordersApi"

const statusSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useGetMyOrderByIdQuery(id!)

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading order...</div>
  }

  if (isError || !data) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-error mb-4">Order not found.</p>
        <Link to="/orders" className="text-primary hover:underline">Back to Orders</Link>
      </div>
    )
  }

  const { order } = data
  const isCancelled = order.orderStatus === "CANCELLED"
  const currentStepIndex = statusSteps.indexOf(order.orderStatus)

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <Link to="/orders" className="text-sm text-text-muted hover:underline mb-4 inline-block">
        ← Back to Orders
      </Link>

      <h1 className="text-2xl font-display font-bold mb-1">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="text-text-muted text-sm mb-8">
        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric"
        })}
      </p>

      {/* Status tracker */}
      {!isCancelled ? (
        <div className="flex items-center mb-10 overflow-x-auto">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center flex-1 min-w-[100px]">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i <= currentStepIndex ? "bg-primary text-white" : "bg-surface border border-border text-text-muted"
                  }`}
                >
                  {i <= currentStepIndex ? "✓" : ""}
                </div>
                <p className="text-xs text-text-muted mt-2 text-center">{step.replace(/_/g, " ")}</p>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-error font-medium mb-8">This order was cancelled.</p>
      )}

      {/* Items */}
      <div className="border border-border rounded-card p-5 mb-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface rounded-default overflow-hidden flex-shrink-0">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-text-muted text-sm">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping address */}
      <div className="border border-border rounded-card p-5 mb-6">
        <h2 className="font-semibold mb-2">Shipping Address</h2>
        <p className="text-sm text-text-muted">
          {order.shippingAddress.name} — {order.shippingAddress.phone}<br />
          {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
      </div>

      {/* Price breakdown */}
      <div className="border border-border rounded-card p-5">
        <h2 className="font-semibold mb-3">Payment Summary</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>₹{order.tax}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success"><span>Discount</span><span>−₹{order.discount}</span></div>
          )}
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold">
          <span>Total</span><span className="text-primary">₹{order.total}</span>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Payment Status: <span className={order.paymentStatus === "PAID" ? "text-success" : "text-warning"}>{order.paymentStatus}</span>
        </p>
      </div>
    </div>
  )
}