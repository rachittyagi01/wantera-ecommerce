# Database

MongoDB Atlas + Mongoose. Collections and their relationships:

## User
Core identity. Password hashed via bcrypt in a `pre("save")` hook, excluded from query results by default (`select: false`), explicitly opted into during login (`select("+password")`). Role is `"USER"` or `"ADMIN"`.

## Product
References `Category` via ObjectId. Uses `isActive` as a soft-delete flag rather than hard deletion — deactivated products stop appearing in public listings but remain intact for any past order that references them. Has a text index on `name`/`description` for keyword search.

## Category
Simple name/slug/description/image. Slugs are auto-generated server-side from the name.

## Cart / Wishlist
One document per user (`unique: true` on the `user` field). Cart items are sub-documents with `product` + `quantity`; Wishlist is a simpler array of product references. `$addToSet` prevents wishlist duplicates; cart quantity accumulation is checked against live product stock on every add.

## Address
Multiple per user (no uniqueness constraint). All queries scope by both the address `_id` and the logged-in user's ID together, preventing one user from accessing another's saved addresses (IDOR protection).

## Order
The most important model. Line items store a **snapshot** of `name` and `price` at the time of purchase, not a live reference — so editing a product later never rewrites historical order data. Tracks both `paymentStatus` (PENDING/PAID/FAILED) and `orderStatus` (PENDING → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED, or CANCELLED), with transitions validated against an explicit allowed-transitions map.

## Coupon
Supports percentage or fixed discounts, with an optional `maxDiscount` cap for percentage coupons, minimum purchase requirements, expiry, and usage limits. Validation logic lives in a shared utility (`utils/validateCoupon.ts`) so checkout preview and actual order creation enforce identical rules.

## Design decisions worth explaining in an interview

- **Soft-delete over hard-delete** for Products and Coupons — protects historical order accuracy.
- **Line-item price snapshots** on Order — the single most important data-integrity decision in the schema.
- **Every "my data" query scopes by both resource ID and user ID** — a consistent IDOR-prevention pattern applied across Address, Cart, Wishlist, and Order.
