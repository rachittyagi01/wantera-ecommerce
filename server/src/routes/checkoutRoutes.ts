import { Router } from "express"
import { getCheckoutSummary } from "../controllers/checkoutController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.get("/summary", protect, getCheckoutSummary)

export default router