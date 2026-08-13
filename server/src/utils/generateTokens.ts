import jwt from "jsonwebtoken"

interface TokenPayload {
  userId: string
  role: string
}

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not defined in .env")

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || "15m") as jwt.SignOptions["expiresIn"],
  })
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined in .env")

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || "7d") as jwt.SignOptions["expiresIn"],
  })
}