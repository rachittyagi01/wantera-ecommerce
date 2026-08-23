import { Router } from "express"
import { signup, login, refresh, logout, getMe, updateMe, changePassword } from "../controllers/authController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/refresh", refresh)
router.post("/logout", logout)
router.get("/me", protect, getMe)
router.put("/me", protect, updateMe)
router.put("/change-password", protect, changePassword)

export default router