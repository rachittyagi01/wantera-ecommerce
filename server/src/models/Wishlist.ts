import mongoose, { Schema, Document, Types } from "mongoose"

export interface IWishlist extends Document {
  user: Types.ObjectId
  products: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wishlist per user — enforced at the database level
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
)

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema)