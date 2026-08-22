import { Request, Response } from "express"
import { Order } from "../models/Order"
import { AuthRequest } from "../middleware/authMiddleware"

// User — get their own order history
export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await Order.find({ user: req.user!.userId }).sort({ createdAt: -1 })
    res.json({ orders })
  } catch (error) {
    console.error("Get my orders error:", error)
    res.status(500).json({ message: "Failed to fetch orders" })
  }
}

// User — get a single order's details (only if it belongs to them)
export async function getMyOrderById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    // Same IDOR-prevention pattern used throughout: scope by BOTH order id AND the logged-in user
    const order = await Order.findOne({ _id: id, user: req.user!.userId })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ message: "Failed to fetch order" })
  }
}

// Admin — get ALL orders across all users
export async function getAllOrders(req: Request, res: Response) {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 })
    res.json({ orders })
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({ message: "Failed to fetch orders" })
  }
}

// Defines which status transitions are actually allowed — prevents e.g. jumping
// straight from PENDING to DELIVERED, or "un-cancelling" a cancelled order
const allowedTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [], // final state — no further transitions allowed
  CANCELLED: [], // final state — no further transitions allowed
}

// Admin — update an order's status, with transition validation
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { orderStatus } = req.body

    if (!orderStatus) {
      return res.status(400).json({ message: "orderStatus is required" })
    }

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const currentStatus = order.orderStatus
    const validNextStatuses = allowedTransitions[currentStatus] || []

    if (!validNextStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Cannot change order status from ${currentStatus} to ${orderStatus}`,
      })
    }

    order.orderStatus = orderStatus as typeof order.orderStatus
    await order.save()

    res.json({ message: "Order status updated", order })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Failed to update order status" })
  }
}