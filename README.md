# WANTERA

**Want It. Find It. Love It.**

A full-stack e-commerce platform built from scratch with React, TypeScript, Node.js, Express, MongoDB, and real Razorpay payment integration.

---

## Overview

WANTERA is a complete shopping experience — customers can browse and search products, manage a wishlist and cart, check out with saved addresses and coupon codes, and pay securely via Razorpay (Test Mode). Admins manage the entire catalog, orders, users, and coupons through a protected set of API endpoints. Every feature is fully functional — no mocked data, no fake payment success states.

## Features

### Customer
- Authentication with JWT access + refresh token rotation
- Product browsing with keyword search, category/price filtering, sorting, and pagination
- Wishlist and cart with real-time stock validation
- Multiple saved shipping addresses
- Coupon codes with percentage/fixed discounts and maximum-discount caps
- Server-side checkout total calculation (never trusts frontend pricing)
- Real Razorpay payments with signature verification and webhook confirmation
- Order history and order tracking with status transitions
- Profile management and secure password change

### Admin
- Product and category CRUD (with Cloudinary image uploads)
- Coupon management
- Order management with validated status transitions
- Dashboard analytics: revenue, order counts, low-stock alerts (all computed from live data)

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Redux Toolkit |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT (access + refresh rotation), httpOnly cookies, bcrypt |
| Validation | Zod |
| Payments | Razorpay (Test Mode) |
| Images | Cloudinary |
| Email | Nodemailer |
| Testing | Jest, Supertest |
| Security | Helmet, rate limiting, custom NoSQL sanitization |

## Architecture

```
React (Vite/TS) → Express API → Mongoose → MongoDB Atlas
                        ↓
        Cloudinary (images) / Razorpay (payments) / Nodemailer (email)
```

Every request flows: `Route → Middleware (auth/validation) → Controller → Model → MongoDB`.

## Folder Structure

```
wantera-ecommerce/
├── client/          React frontend
├── server/
│   └── src/
│       ├── config/       DB, Cloudinary, Razorpay, Mailer setup
│       ├── controllers/  Request handlers
│       ├── middleware/   Auth, sanitization
│       ├── models/       Mongoose schemas
│       ├── routes/       API route definitions
│       ├── utils/        Shared helpers (tokens, slugs, coupon validation)
│       ├── validators/   Zod schemas
│       └── tests/        Jest test suites
├── .env.example
└── README.md
```

## Installation

```bash
git clone https://github.com/rachittyagi01/wantera-ecommerce.git
cd wantera-ecommerce

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in your own values (MongoDB URI, JWT secrets, Razorpay keys, Cloudinary credentials, Gmail SMTP credentials). Never commit `.env`.

## Running Locally

```bash
# Terminal 1 — backend
cd server
npm run dev    # runs on http://localhost:5000

# Terminal 2 — frontend
cd client
npm run dev    # runs on http://localhost:5173
```

## Running Tests

```bash
cd server
npm test
```

## API Overview

| Base path | Purpose |
|---|---|
| `/api/auth` | Signup, login, refresh, logout, profile |
| `/api/products` | Product listing, search, filtering, admin CRUD |
| `/api/categories` | Category CRUD |
| `/api/cart` | Cart management with stock validation |
| `/api/wishlist` | Wishlist management |
| `/api/addresses` | Saved shipping addresses |
| `/api/checkout` | Server-calculated order summary |
| `/api/coupons` | Coupon validation and admin management |
| `/api/payments` | Razorpay order creation, verification, webhook |
| `/api/orders` | Order history and admin order management |
| `/api/admin` | Dashboard analytics |
| `/api/upload` | Cloudinary image upload |

Full endpoint documentation: see [`docs/api.md`](docs/api.md).

## Authentication Flow

WANTERA uses short-lived JWT access tokens (15 min) paired with longer-lived, rotating refresh tokens (7 days) stored in httpOnly cookies. Every refresh issues a brand-new refresh token, invalidating the old one — reuse of an already-rotated token is a theft signal. Full explanation: [`docs/authentication.md`](docs/authentication.md).

## Payment Flow

Prices are recalculated entirely server-side at checkout — the frontend never supplies a trusted amount. Payment confirmation relies on two layers: a fast-path signature verification when the frontend returns from the Razorpay Checkout widget, and a webhook called directly by Razorpay's servers as the actual source of truth, protected by an idempotency check. Full explanation: [`docs/payment-flow.md`](docs/payment-flow.md).

## Database

Core collections: User, Product, Category, Cart, Wishlist, Address, Order, Coupon. Products use a soft-delete (`isActive`) pattern to preserve historical order accuracy. Orders store line-item snapshots (name, price at time of purchase) rather than live product references. Full schema documentation: [`docs/database.md`](docs/database.md).

## Deployment

Frontend deploys to Vercel, backend to Render, database on MongoDB Atlas, images on Cloudinary — all free-tier. Full steps: [`docs/deployment.md`](docs/deployment.md).

## Future Improvements

- Product reviews and ratings submission (schema exists, UI pending)
- Email verification on signup
- Admin analytics charts
- Order cancellation by customers (currently admin-only status changes)

## Author

**Name:** Rachit Tyagi
**GitHub:** [rachittyagi01](https://github.com/rachittyagi01)
**LinkedIn:**
**Email:**