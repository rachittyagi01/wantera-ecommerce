import mongoose, { Schema, Document, Types } from "mongoose"

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: Types.ObjectId
  brand?: string
  stock: number
  isActive: boolean
  ratings: number
  reviewCount: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category", // this creates the actual link to the Category collection
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true, // "deactivate" instead of delete — from our Phase 0 planning
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Index for fast text search across name and description (used in Phase 12 — Search)
productSchema.index({ name: "text", description: "text" })

export const Product = mongoose.model<IProduct>("Product", productSchema)