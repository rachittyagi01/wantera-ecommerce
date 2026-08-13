import { Router } from "express"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController"
import { protect, isAdmin } from "../middleware/authMiddleware"

const router = Router()

router.get("/", getCategories) // public
router.post("/", protect, isAdmin, createCategory) // admin only
router.put("/:id", protect, isAdmin, updateCategory) // admin only
router.delete("/:id", protect, isAdmin, deleteCategory) // admin only

export default router