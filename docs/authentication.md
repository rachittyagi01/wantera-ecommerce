# Authentication

WANTERA uses a short-lived access token paired with a longer-lived, rotating refresh token — the standard pattern for balancing security with a smooth user experience.

## The flow

```
Signup/Login
      ↓
Server issues:
  - accessToken  (15 min, returned in response body, held in memory on the frontend)
  - refreshToken (7 days, httpOnly + sameSite=strict cookie, NOT readable by JavaScript)
      ↓
Every API request → Authorization: Bearer <accessToken>
      ↓
Access token expires → frontend calls /api/auth/refresh
      ↓
Server verifies the refresh token, then ROTATES it:
  - issues a new access token
  - issues a new refresh token, replacing the old cookie
      ↓
If an already-rotated (old) refresh token is ever reused →
  treated as a theft signal
```

## Why two tokens instead of one long-lived token

A single long-lived token that leaked would grant an attacker extended access with no way to limit the damage short of changing every credential. Splitting into a short-lived access token (small blast radius if leaked) and a refresh token (used only to mint new access tokens) limits exposure significantly.

## Why the refresh token lives in an httpOnly cookie, not localStorage

`httpOnly` means client-side JavaScript cannot read the cookie at all — even if the app had an XSS vulnerability, injected script couldn't exfiltrate the refresh token. `localStorage`, by contrast, is fully readable by any JavaScript running on the page. `sameSite: "strict"` additionally prevents the cookie from being sent on cross-site requests, which is WANTERA's CSRF defense.

## Why rotation matters

Every time the refresh token is used, a brand-new one is issued and the old one becomes invalid. If a stolen refresh token were reused after the legitimate user had already rotated past it, the mismatch is a detectable signal of compromise — without rotation, a stolen refresh token would remain silently valid for its entire 7-day lifetime.

## Role-based authorization

The user's role (`USER` or `ADMIN`) is embedded directly in the JWT payload, signed and therefore tamper-proof. The `isAdmin` middleware checks this value with no database lookup required, layered on top of `protect` (which only confirms the token itself is valid).
