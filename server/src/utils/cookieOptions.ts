import { CookieOptions } from "express"

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript on the frontend can NEVER read this cookie — blocks XSS token theft
  secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production; allows HTTP locally for dev
  sameSite: "strict", // browser won't send this cookie on cross-site requests — our CSRF defense/protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds — matches JWT_REFRESH_EXPIRY
  path: "/api/auth", // cookie is only sent to auth-related routes, not every single API call
}