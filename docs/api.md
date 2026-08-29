# API Reference

Base URL (local): `http://localhost:5000`

## Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | Public | Create account |
| POST | `/login` | Public | Log in |
| POST | `/refresh` | Cookie | Rotate refresh token, issue new access token |
| POST | `/logout` | Public | Clear refresh token cookie |
| GET | `/me` | User | Get own profile |
| PUT | `/me` | User | Update own profile (name, image) |
| PUT | `/change-password` | User | Change password (requires current password) |

## Products — `/api/products`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List products — supports `?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=` |
| GET | `/:slug` | Public | Single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Deactivate product (soft delete) |

## Categories — `/api/categories`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List categories |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

## Cart — `/api/cart`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | User | Get own cart |
| POST | `/` | User | Add item (validates stock) |
| PUT | `/:productId` | User | Update item quantity |
| DELETE | `/:productId` | User | Remove item |
| DELETE | `/` | User | Clear cart |

## Wishlist — `/api/wishlist`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | User | Get own wishlist |
| POST | `/` | User | Add product |
| DELETE | `/:productId` | User | Remove product |

## Addresses — `/api/addresses`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | User | List own addresses |
| POST | `/` | User | Add address |
| PUT | `/:id` | User | Update own address |
| DELETE | `/:id` | User | Delete own address |

## Checkout — `/api/checkout`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/summary` | User | Server-calculated cart total |

## Coupons — `/api/coupons`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all coupons |
| POST | `/` | Admin | Create coupon |
| PUT | `/:id` | Admin | Update coupon |
| DELETE | `/:id` | Admin | Disable coupon |
| POST | `/apply` | User | Validate a coupon against a subtotal |

## Payments — `/api/payments`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | User | Create Razorpay order from cart |
| POST | `/verify` | User | Verify payment signature (fast-path) |
| POST | `/webhook` | Razorpay only | Source-of-truth payment confirmation |

## Orders — `/api/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/my-orders` | User | Own order history |
| GET | `/my-orders/:id` | User | Own single order |
| GET | `/admin/all` | Admin | All orders |
| PUT | `/admin/:id/status` | Admin | Update order status (validated transitions) |

## Admin — `/api/admin`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Revenue, order/user/product counts, recent orders, low-stock alerts |

## Upload — `/api/upload`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Admin | Upload image to Cloudinary (multipart/form-data, field name `image`) |
