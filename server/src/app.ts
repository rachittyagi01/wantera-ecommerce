import express from "express"
import { User } from "./models/User"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authRoutes"
import categoryRoutes from "./routes/categoryRoutes"
import productRoutes from "./routes/productRoutes"
import uploadRoutes from "./routes/uploadRoutes"
import wishlistRoutes from "./routes/wishlistRoutes"
import cartRoutes from "./routes/cartRoutes"
import addressRoutes from "./routes/addressRoutes"
import checkoutRoutes from "./routes/checkoutRoutes"
import couponRoutes from "./routes/couponRoutes"
import paymentRoutes from "./routes/paymentRoutes"
import orderRoutes from "./routes/orderRoutes"
import adminRoutes from "./routes/adminRoutes"
import helmet from "helmet"
import { sanitizeInput } from "./middleware/sanitize"
import rateLimit from "express-rate-limit"


const app = express()

app.set("trust proxy", 1)
// Middleware — runs on every request, in order
app.use(cors({
  origin: "http://localhost:5173", // our Vite frontend, during development
  credentials: true, // allows cookies (needed for our auth tokens later)
}))
app.use(express.json()) // parses incoming JSON request bodies
app.use(cookieParser()) // parses cookies from incoming requests

// we use helmet
app.use(helmet())

// Sanitize all incoming data against NoSQL injection — strips $ and . from keys
app.use(sanitizeInput)


// General rate limit — applies to all API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per window
  message: { message: "Too many requests, please try again later" },
})
app.use("/api", generalLimiter)

// Stricter rate limit specifically for auth routes — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/signup attempts per IP per 15 minutes
  message: { message: "Too many authentication attempts, please try again later" },
})
app.use("/api/auth/login", authLimiter)
app.use("/api/auth/signup", authLimiter)

// Temporary test route — confirms the server works before we build real routes
app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/addresses", addressRoutes)
app.use("/api/checkout", checkoutRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin", adminRoutes)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "WANTERA API is running" })
})



export default app