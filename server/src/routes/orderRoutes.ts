import { Router } from "express"
import { getMyOrders, getMyOrderById, getAllOrders, updateOrderStatus } from "../controllers/orderController"
import { protect, isAdmin } from "../middleware/authMiddleware"

const router = Router()

router.get("/my-orders", protect, getMyOrders)
router.get("/my-orders/:id", protect, getMyOrderById)
router.get("/admin/all", protect, isAdmin, getAllOrders)
router.put("/admin/:id/status", protect, isAdmin, updateOrderStatus)

export default router