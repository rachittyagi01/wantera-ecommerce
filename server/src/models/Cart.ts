import mongoose, { Schema, Document, Types } from "mongoose"

interface ICartItem {
  product: Types.ObjectId
  quantity: number
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { _id: false } // cart items don't need their own separate _id — they're identified by product
)

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
)

export const Cart = mongoose.model<ICart>("Cart", cartSchema)