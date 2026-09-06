import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/services/ordersApi"

// Matches the exact allowedTransitions map from your Phase 18 backend —
// keeping the dropdown options in sync with what the server will actually accept
const allowedTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

export default function AdminOrders() {
  const { data, isLoading } = useGetAllOrdersQuery()
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!newStatus) return
    try {
      await updateStatus({ id: orderId, orderStatus: newStatus }).unwrap()
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to update status"
      alert(message || "Failed to update status")
    }
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Manage Orders</h1>

      {isLoading ? (
        <p className="text-text-muted">Loading orders...</p>
      ) : (
        <div className="border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((order) => {
                const nextOptions = allowedTransitions[order.orderStatus] || []
                return (
                  <tr key={order._id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="p-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-text-muted text-xs">{order.user?.email}</p>
                    </td>
                    <td className="p-3">₹{order.total}</td>
                    <td className="p-3">
                      <span className={order.paymentStatus === "PAID" ? "text-success" : "text-warning"}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">{order.orderStatus.replace(/_/g, " ")}</td>
                    <td className="p-3">
                      {nextOptions.length > 0 ? (
                        <select
                          disabled={updating}
                          value=""
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border border-border rounded-default px-2 py-1 text-xs"
                        >
                          <option value="">Change to...</option>
                          {nextOptions.map((status) => (
                            <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-text-muted text-xs">Final state</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}