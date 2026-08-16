import { Coupon, ICoupon } from "../models/Coupon"

interface CouponValidationResult {
  valid: boolean
  message?: string
  discount?: number
  coupon?: ICoupon
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" }
  }

  if (coupon.expiry < new Date()) {
    return { valid: false, message: "This coupon has expired" }
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "This coupon has reached its usage limit" }
  }

  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`,
    }
  }

  // Calculate the actual discount amount
  let discount = 0
  if (coupon.type === "PERCENTAGE") {
    discount = (subtotal * coupon.value) / 100
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount // apply the cap
    }
  } else {
    // FIXED type
    discount = coupon.value
  }

  // Never let a discount exceed the subtotal itself (avoids a negative total)
  discount = Math.min(discount, subtotal)

  return { valid: true, discount: Math.round(discount), coupon }
}