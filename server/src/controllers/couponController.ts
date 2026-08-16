import { Request, Response } from "express"
import { Coupon } from "../models/Coupon"
import { validateCoupon } from "../utils/validateCoupon"

// Admin only — list all coupons
export async function getCoupons(req: Request, res: Response) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json({ coupons })
  } catch (error) {
    console.error("Get coupons error:", error)
    res.status(500).json({ message: "Failed to fetch coupons" })
  }
}

// Admin only — create a coupon
export async function createCoupon(req: Request, res: Response) {
  try {
    const { code, type, value, minPurchase, maxDiscount, expiry, usageLimit } = req.body

    if (!code || !type || value === undefined || !expiry) {
      return res.status(400).json({ message: "code, type, value, and expiry are required" })
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() })
    if (existing) {
      return res.status(409).json({ message: "A coupon with this code already exists" })
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      expiry,
      usageLimit,
    })

    res.status(201).json({ message: "Coupon created", coupon })
  } catch (error) {
    console.error("Create coupon error:", error)
    res.status(500).json({ message: "Failed to create coupon" })
  }
}

// Admin only — update a coupon
export async function updateCoupon(req: Request, res: Response) {
  try {
    const { id } = req.params
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true })
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" })
    }
    res.json({ message: "Coupon updated", coupon })
  } catch (error) {
    console.error("Update coupon error:", error)
    res.status(500).json({ message: "Failed to update coupon" })
  }
}

// Admin only — disable/delete a coupon
export async function deleteCoupon(req: Request, res: Response) {
  try {
    const { id } = req.params
    const coupon = await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true })
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" })
    }
    res.json({ message: "Coupon disabled", coupon })
  } catch (error) {
    console.error("Delete coupon error:", error)
    res.status(500).json({ message: "Failed to disable coupon" })
  }
}

// Public (logged-in user) — apply/preview a coupon against their current cart total
export async function applyCoupon(req: Request, res: Response) {
  try {
    const { code, subtotal } = req.body

    if (!code || subtotal === undefined) {
      return res.status(400).json({ message: "code and subtotal are required" })
    }

    const result = await validateCoupon(code, subtotal)

    if (!result.valid) {
      return res.status(400).json({ message: result.message })
    }

    res.json({ message: "Coupon applied", discount: result.discount })
  } catch (error) {
    console.error("Apply coupon error:", error)
    res.status(500).json({ message: "Failed to apply coupon" })
  }
}