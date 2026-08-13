import { Router } from "express"
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController"
import { protect, isAdmin } from "../middleware/authMiddleware"

const router = Router()

router.get("/", getProducts) // public
router.get("/:slug", getProductBySlug) // public
router.post("/", protect, isAdmin, createProduct) // admin only
router.put("/:id", protect, isAdmin, updateProduct) // admin only
router.delete("/:id", protect, isAdmin, deleteProduct) // admin only

export default router