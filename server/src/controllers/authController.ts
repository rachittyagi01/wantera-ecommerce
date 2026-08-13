import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/User"
import { signupSchema, loginSchema } from "../validators/authValidators"
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens"
import { refreshTokenCookieOptions } from "../utils/cookieOptions"

export async function signup(req: Request, res: Response) {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      })
    }
    const { name, email, password } = parsed.data

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" })
    }

    const user = await User.create({ name, email, password })

    const payload = { userId: user._id.toString(), role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions)

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: "Something went wrong during signup" })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      })
    }
    const { email, password } = parsed.data

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const payload = { userId: user._id.toString(), role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions)

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Something went wrong during login" })
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" })
    }

    const secret = process.env.JWT_REFRESH_SECRET
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is not defined")
    }

    // Verify the token's signature and expiry
    let decoded: { userId: string; role: string }
    try {
      decoded = jwt.verify(token, secret) as { userId: string; role: string }
    } catch (err) {
      // Invalid or expired refresh token — force a real re-login
      res.clearCookie("refreshToken", { path: "/api/auth" })
      return res.status(401).json({ message: "Invalid or expired refresh token, please log in again" })
    }

    // Confirm the user still exists (e.g., wasn't deleted since the token was issued)
    const user = await User.findById(decoded.userId)
    if (!user) {
      res.clearCookie("refreshToken", { path: "/api/auth" })
      return res.status(401).json({ message: "User no longer exists" })
    }

    // Rotation: issue a brand new access token AND a brand new refresh token
    const payload = { userId: user._id.toString(), role: user.role }
    const newAccessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    })
  } catch (error) {
    console.error("Refresh error:", error)
    res.status(500).json({ message: "Something went wrong during token refresh" })
  }
}