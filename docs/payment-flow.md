# Payment Flow

WANTERA integrates Razorpay in Test Mode, with the core principle that **the backend never trusts a price or payment status supplied by the frontend**.

## Full flow

```
Customer clicks Pay
      ↓
Frontend calls POST /api/payments/create-order  (only sends addressId + optional couponCode)
      ↓
Backend re-fetches the user's cart, validates stock, recalculates
subtotal/shipping/tax/discount entirely from live database values
      ↓
Backend creates a real Razorpay order via the Razorpay SDK
      ↓
Backend creates a local Order document, status PENDING (not yet a confirmed sale)
      ↓
Frontend opens the Razorpay Checkout widget using the returned order ID
      ↓
Customer completes payment
      ↓
Razorpay returns payment details to the frontend
      ↓
Frontend forwards those details to POST /api/payments/verify
      ↓
Backend recreates the expected HMAC-SHA256 signature using its own secret key
and compares it to what Razorpay sent — this is the fast-path confirmation
      ↓
IN PARALLEL: Razorpay also calls POST /api/payments/webhook directly,
independent of the browser — this is the actual source of truth
      ↓
Whichever path processes first marks the order PAID, decrements stock,
clears the cart, and sends a confirmation email — an idempotency check
(paymentStatus !== "PAID") ensures the second path becomes a safe no-op
```

## Why two confirmation paths

The frontend-callback path (`/verify`) only fires if the user's browser stays open and the request succeeds — if they close the tab immediately after paying, or lose connectivity, that path never completes, and a naive implementation would leave the order stuck at PENDING despite the customer having actually paid. The webhook is called directly by Razorpay's own servers, entirely independent of the customer's browser, making it the true source of truth. The frontend path exists purely as a fast, low-latency UX confirmation.

## Why the webhook route needs raw request bytes

Signature verification requires hashing the *exact* original bytes Razorpay sent. Express's global `express.json()` middleware parses and reformats the body before a controller sees it, which would produce a different hash than the one Razorpay actually signed. The webhook route therefore uses `express.raw({ type: "application/json" })` instead of the global JSON parser, specifically for that one endpoint.

## Idempotency

Because both the verify endpoint and the webhook can legitimately fire for the same successful payment, every state-changing operation (marking PAID, decrementing stock, clearing the cart, sending the confirmation email) is guarded by checking `order.paymentStatus !== "PAID"` first. Whichever path runs first performs the update; the second becomes a safe no-op, preventing double stock deduction or duplicate emails.

## What's never trusted from the client

- Cart contents and quantities (re-validated against live stock)
- Product prices (re-fetched from the database at order-creation time)
- Coupon discount amounts (recalculated server-side via the shared `validateCoupon` utility)
- Payment success itself (only a verified signature or a verified webhook call marks an order PAID)
