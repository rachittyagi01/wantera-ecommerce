import express from "express"
import { User } from "./models/User"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Middleware — runs on every request, in order
app.use(cors({
  origin: "http://localhost:5173", // our Vite frontend, during development
  credentials: true, // allows cookies (needed for our auth tokens later)
}))
app.use(express.json()) // parses incoming JSON request bodies
app.use(cookieParser()) // parses cookies from incoming requests

// Temporary test route — confirms the server works before we build real routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "WANTERA API is running" })
})

export default app