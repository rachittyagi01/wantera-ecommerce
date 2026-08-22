import mongoose, { Schema, Document, Types } from "mongoose"

interface IOrderItem {
  product: Types.ObjectId
  name: string // snapshot — protects order history if product name/price changes later
  price: number
  quantity: number
  image?: string
}

export interface IOrder extends Document {
  user: Types.ObjectId
  items: IOrderItem[]
  shippingAddress: {
    name: string
    phone: string
    addressLine: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode?: string
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  orderStatus: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
  razorpayOrderId: string
  razorpayPaymentId?: string
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    couponCode: { type: String },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
)

export const Order = mongoose.model<IOrder>("Order", orderSchema)