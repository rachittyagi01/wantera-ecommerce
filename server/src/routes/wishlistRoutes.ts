import { Router } from "express"
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

// All wishlist routes require login — no isAdmin needed, just protect
router.get("/", protect, getWishlist)
router.post("/", protect, addToWishlist)
router.delete("/:productId", protect, removeFromWishlist)

export default router