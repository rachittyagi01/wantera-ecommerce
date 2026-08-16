import mongoose, { Schema, Document } from "mongoose"

export interface ICoupon extends Document {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minPurchase: number
  maxDiscount?: number
  expiry: Date
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true, // always store/compare codes in uppercase — "SAVE10" and "save10" should be the same
      trim: true,
    },
    type: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: [0, "Value cannot be negative"],
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number, // only meaningful for PERCENTAGE type — caps the discount amount
    },
    expiry: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema)