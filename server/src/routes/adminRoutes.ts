import { Router } from "express"
import { getDashboardStats } from "../controllers/adminController"
import { protect, isAdmin } from "../middleware/authMiddleware"

const router = Router()

router.get("/dashboard", protect, isAdmin, getDashboardStats)

export default router