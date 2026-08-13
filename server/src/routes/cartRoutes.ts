import { Router } from "express"
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.get("/", protect, getCart)
router.post("/", protect, addToCart)
router.put("/:productId", protect, updateCartItem)
router.delete("/:productId", protect, removeFromCart)
router.delete("/", protect, clearCart)

export default router