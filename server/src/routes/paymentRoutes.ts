import { Router } from "express"
import express from "express"
import { createPaymentOrder, verifyPayment, razorpayWebhook } from "../controllers/paymentController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/create-order", protect, createPaymentOrder)
router.post("/verify", protect, verifyPayment)

router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook)

export default router