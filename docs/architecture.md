# Architecture

## Request Flow

```
React Component
      ↓
API call (fetch/RTK Query)
      ↓
Express Route
      ↓
Middleware (protect / isAdmin / sanitizeInput / rate limiter)
      ↓
Controller (business logic)
      ↓
Mongoose Model
      ↓
MongoDB Atlas
```

## Why a monorepo with two independent projects

`client/` and `server/` are two completely separate Node projects (separate `package.json`, separate `node_modules`) living in one Git repository. They run on different ports during development (5173 and 5000) and deploy to different platforms (Vercel and Render) in production. Keeping them in one repo simplifies portfolio presentation without coupling their build/deploy processes.

## Why Express Router modules per feature

Each feature (`auth`, `products`, `cart`, etc.) has its own `routes/*.ts` file, mounted under a prefix in `app.ts` (e.g. `app.use("/api/cart", cartRoutes)`). This keeps route definitions close to the feature they belong to, rather than one large file listing every endpoint in the whole app.

## Why controllers are separate from routes

Routes define *which URL maps to which function*; controllers contain the actual logic. This separation means a route file stays a readable, one-line-per-endpoint map, while controllers can grow as complex as a feature needs without cluttering the routing layer.

## Security layers, in the order they run

1. **CORS** — restricts which origins can call the API
2. **Helmet** — sets protective HTTP headers
3. **Custom sanitizeInput middleware** — strips MongoDB operator keys from `req.body`/`req.params`
4. **Rate limiting** — general API limit, plus a stricter limit on auth routes
5. **`protect` middleware** — verifies JWT access token, attaches `req.user`
6. **`isAdmin` middleware** — checks `req.user.role`, layered after `protect`

Order matters: defensive middleware must run before the routes it protects.
