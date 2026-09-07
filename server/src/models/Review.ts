import mongoose, { Schema, Document, Types } from "mongoose"

export interface IReview extends Document {
  user: Types.ObjectId
  product: Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

// A user can only review a specific product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

export const Review = mongoose.model<IReview>("Review", reviewSchema)