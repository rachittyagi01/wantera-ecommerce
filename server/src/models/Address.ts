import mongoose, { Schema, Document, Types } from "mongoose"

export interface IAddress extends Document {
  user: Types.ObjectId
  name: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  country: string
  addressType: "HOME" | "WORK" | "OTHER"
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India", trim: true },
    addressType: {
      type: String,
      enum: ["HOME", "WORK", "OTHER"],
      default: "HOME",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export const Address = mongoose.model<IAddress>("Address", addressSchema)