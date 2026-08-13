import { Request, Response } from "express"
import { User } from "../models/User"
import { signupSchema, loginSchema } from "../validators/authValidators"
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens"
import { refreshTokenCookieOptions } from "../utils/cookieOptions"

export async function signup(req: Request, res: Response) {
  try {
    // 1. Validate incoming data
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      })
    }
    const { name, email, password } = parsed.data

    // 2. Check if a user with this email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" })
    }

    // 3. Create the user — password gets hashed automatically by the pre("save") hook
    const user = await User.create({ name, email, password })

    // 4. Generate tokens
    const payload = { userId: user._id.toString(), role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // 5. Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions)

    // 6. Respond with access token + safe user info (never send password back, even hashed)
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