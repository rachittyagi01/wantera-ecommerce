import { Response } from "express"
import { Cart } from "../models/Cart"
import { AuthRequest } from "../middleware/authMiddleware"

// Recalculates the cart total using CURRENT product prices from the database —
// never trusts any price the frontend might send.
export async function getCheckoutSummary(req: AuthRequest, res: Response) {
  try {
    const cart = await Cart.findOne({ user: req.user!.userId }).populate(
      "items.product",
      "name slug price discountPrice images stock isActive"
    )

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" })
    }

    let subtotal = 0
    const lineItems = []

    for (const item of cart.items) {
      const product = item.product as any // populated document

      if (!product || !product.isActive) {
        return res.status(400).json({ message: `A product in your cart is no longer available` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Only ${product.stock} units of "${product.name}" available` })
      }

      // Use discountPrice if set, otherwise regular price — this calculation happens
      // fresh, right now, from the database — not from anything the frontend sent
      const unitPrice = product.discountPrice ?? product.price
      const lineTotal = unitPrice * item.quantity
      subtotal += lineTotal

      lineItems.push({
        productId: product._id,
        name: product.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      })
    }

    // Simple shipping/tax rules for now — refined later if needed
    const shipping = subtotal > 999 ? 0 : 99 // free shipping over ₹999
    const tax = Math.round(subtotal * 0.05) // flat 5% tax, for demonstration
    const total = subtotal + shipping + tax

    res.json({
      lineItems,
      subtotal,
      shipping,
      tax,
      total,
    })
  } catch (error) {
    console.error("Checkout summary error:", error)
    res.status(500).json({ message: "Failed to calculate checkout summary" })
  }
}
