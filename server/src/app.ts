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

const app = express()

// Middleware — runs on every request, in order
app.use(cors({
  origin: "http://localhost:5173", // our Vite frontend, during development
  credentials: true, // allows cookies (needed for our auth tokens later)
}))
app.use(express.json()) // parses incoming JSON request bodies
app.use(cookieParser()) // parses cookies from incoming requests

// Temporary test route — confirms the server works before we build real routes
app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/addresses", addressRoutes)
app.use("/api/checkout", checkoutRoutes)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "WANTERA API is running" })
})

export default app