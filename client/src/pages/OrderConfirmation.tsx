import { useLocation, Link } from "react-router"

export default function OrderConfirmation() {
  const location = useLocation()
  const state = location.state as { orderId: string } | null

  return (
    <div className="px-6 py-20 max-w-md mx-auto text-center">
      <div className="text-success text-5xl mb-4">✓</div>
      <h1 className="text-2xl font-display font-bold mb-2">Order Confirmed!</h1>
      <p className="text-text-muted mb-2">Thank you for shopping with WANTERA.</p>
      {state?.orderId && (
        <p className="text-sm text-text-muted mb-8">Order ID: {state.orderId}</p>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="text-primary hover:underline">View Orders</Link>
        <span className="text-text-muted">·</span>
        <Link to="/shop" className="text-primary hover:underline">Continue Shopping</Link>
      </div>
    </div>
  )
}