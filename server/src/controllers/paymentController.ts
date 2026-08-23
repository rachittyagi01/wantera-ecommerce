import { Request, Response } from "express"
import crypto from "crypto"
import { razorpay } from "../config/razorpay"
import { Cart } from "../models/Cart"
import { Address } from "../models/Address"
import { Order } from "../models/Order"
import { Product } from "../models/Product"
import { validateCoupon } from "../utils/validateCoupon"
import { AuthRequest } from "../middleware/authMiddleware"
import { sendEmail } from "../utils/sendEmail"
import { User } from "../models/User"

// Step 1 of payment flow: create a Razorpay order using a SERVER-CALCULATED amount
export async function createPaymentOrder(req: AuthRequest, res: Response) {
  try {
    const { addressId, couponCode } = req.body

    if (!addressId) {
      return res.status(400).json({ message: "addressId is required" })
    }

    const address = await Address.findOne({ _id: addressId, user: req.user!.userId })
    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    const cart = await Cart.findOne({ user: req.user!.userId }).populate(
      "items.product",
      "name price discountPrice images stock isActive"
    )
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" })
    }

    let subtotal = 0
    const orderItems = []

    for (const item of cart.items) {
      const product = item.product as any
      if (!product || !product.isActive) {
        return res.status(400).json({ message: "A product in your cart is no longer available" })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Only ${product.stock} units of "${product.name}" available` })
      }

      const unitPrice = product.discountPrice ?? product.price
      subtotal += unitPrice * item.quantity

      orderItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        image: product.images?.[0],
      })
    }

    const shipping = subtotal > 999 ? 0 : 99
    const tax = Math.round(subtotal * 0.05)

    let discount = 0
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal)
      if (!couponResult.valid) {
        return res.status(400).json({ message: couponResult.message })
      }
      discount = couponResult.discount!
    }

    const total = subtotal + shipping + tax - discount

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    })

    const order = await Order.create({
      user: req.user!.userId,
      items: orderItems,
      shippingAddress: {
        name: address.name,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      subtotal,
      discount,
      shipping,
      tax,
      total,
      couponCode,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
    })

    res.status(201).json({
      message: "Payment order created",
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    })
  } catch (error) {
    console.error("Create payment order error:", error)
    res.status(500).json({ message: "Failed to create payment order" })
  }
}

// Step 2 of payment flow: verify the signature Razorpay returns to the frontend after payment.
// This is a fast-path UX confirmation — the webhook (Part 3) remains the ultimate source of truth.
export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details" })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    }

    await Cart.findOneAndUpdate({ user: order.user }, { items: [] })

    // Send order confirmation email — best-effort, won't crash this request if it fails
    const user = await User.findById(order.user)
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `WANTERA Order Confirmed — #${order._id}`,
        html: `
          <h2>Thanks for your order, ${user.name}!</h2>
          <p>Your order <strong>#${order._id}</strong> has been confirmed.</p>
          <p><strong>Total: ₹${order.total}</strong></p>
          <p>We'll notify you when it ships.</p>
        `,
      })
    }

    res.json({ message: "Payment verified successfully", order })
  } catch (error) {
    console.error("Verify payment error:", error)
    res.status(500).json({ message: "Payment verification failed" })
  }
}

// Called directly by Razorpay's servers — NOT by our frontend.
// This is the actual source of truth for whether a payment succeeded.
export async function razorpayWebhook(req: Request, res: Response) {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex")

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" })
    }

    const payload = JSON.parse(req.body.toString())

    if (payload.event === "payment.captured") {
      const razorpayOrderId = payload.payload.payment.entity.order_id
      const razorpayPaymentId = payload.payload.payment.entity.id

      const order = await Order.findOne({ razorpayOrderId })

      // Idempotency check: don't double-process if verifyPayment's fast path already marked this PAID
      if (order && order.paymentStatus !== "PAID") {
        order.paymentStatus = "PAID"
        order.orderStatus = "CONFIRMED"
        order.razorpayPaymentId = razorpayPaymentId
        await order.save()

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
        }

        await Cart.findOneAndUpdate({ user: order.user }, { items: [] })

        // Send order confirmation email — best-effort, won't crash this webhook if it fails
        const user = await User.findById(order.user)
        if (user) {
          await sendEmail({
            to: user.email,
            subject: `WANTERA Order Confirmed — #${order._id}`,
            html: `
              <h2>Thanks for your order, ${user.name}!</h2>
              <p>Your order <strong>#${order._id}</strong> has been confirmed.</p>
              <p><strong>Total: ₹${order.total}</strong></p>
              <p>We'll notify you when it ships.</p>
            `,
          })
        }
      }
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    res.status(500).json({ message: "Webhook processing failed" })
  }
}