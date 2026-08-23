import { Request, Response, NextFunction } from "express"

// Recursively strips MongoDB operator keys ($ prefix) and dots from object keys —
// prevents NoSQL injection without needing a third-party package that conflicts
// with newer Express versions' read-only req.query property.
function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }

  const clean: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      continue // drop dangerous keys entirely
    }
    clean[key] = sanitizeObject(obj[key])
  }
  return clean
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeObject(req.body)
  if (req.params) req.params = sanitizeObject(req.params)
  // Deliberately NOT touching req.query — same reason the library broke:
  // it's a read-only getter in modern Express. Route logic in this project
  // reads query params directly as strings/numbers, not as raw Mongo filters,
  // so this is a safe, deliberate scope limitation.
  next()
}