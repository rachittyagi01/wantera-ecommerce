import { Router } from "express"
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController"
import { protect, isAdmin } from "../middleware/authMiddleware"

const router = Router()

router.get("/", protect, isAdmin, getCoupons)
router.post("/", protect, isAdmin, createCoupon)
router.put("/:id", protect, isAdmin, updateCoupon)
router.delete("/:id", protect, isAdmin, deleteCoupon)
router.post("/apply", protect, applyCoupon) // any logged-in user, not admin-only

export default router