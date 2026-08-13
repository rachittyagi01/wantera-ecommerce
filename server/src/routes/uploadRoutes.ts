import { Router } from "express"
import { uploadImage } from "../controllers/uploadController"
import { upload } from "../config/multer"
import { protect, isAdmin } from "../middleware/authMiddleware"

const router = Router()

// Admin only — "image" here is the field name the frontend must use when sending the file
router.post("/", protect, isAdmin, upload.single("image"), uploadImage)

export default router