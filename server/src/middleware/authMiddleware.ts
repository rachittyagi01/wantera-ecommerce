import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// Extend Express's Request type so TypeScript knows req.user can exist
export interface AuthRequest extends Request {
  user?: { userId: string; role: string }
}

export function protect(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No access token provided" })
  }

  const token = authHeader.split(" ")[1] // "Bearer <token>" → take just the token part

  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined")
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; role: string }
    req.user = decoded // attach decoded user info to the request for controllers to use
    next() // signal filedware to proceed to the actual controller
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" })
  }
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}