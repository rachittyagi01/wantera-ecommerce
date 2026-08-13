import { Response } from "express"
import { Cart } from "../models/Cart"
import { Product } from "../models/Product"
import { AuthRequest } from "../middleware/authMiddleware"

// Get the logged-in user's cart
export async function getCart(req: AuthRequest, res: Response) {
  try {
    const cart = await Cart.findOne({ user: req.user!.userId }).populate(
      "items.product",
      "name slug price discountPrice images stock"
    )

    if (!cart) {
      return res.json({ cart: { items: [] } })
    }

    res.json({ cart })
  } catch (error) {
    console.error("Get cart error:", error)
    res.status(500).json({ message: "Failed to fetch cart" })
  }
}

// Add an item to the cart (or increase quantity if it's already there)
export async function addToCart(req: AuthRequest, res: Response) {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ message: "productId is required" })
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" })
    }

    // Validate the product exists, is active, and has enough stock
    const product = await Product.findOne({ _id: productId, isActive: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} units available` })
    }

    let cart = await Cart.findOne({ user: req.user!.userId })

    if (!cart) {
      // First item ever added — create the cart document
      cart = await Cart.create({
        user: req.user!.userId,
        items: [{ product: productId, quantity }],
      })
    } else {
      // Check if this product is already in the cart
      const existingItem = cart.items.find((item) => item.product.toString() === productId)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (product.stock < newQuantity) {
          return res.status(400).json({ message: `Only ${product.stock} units available` })
        }
        existingItem.quantity = newQuantity
      } else {
        cart.items.push({ product: productId, quantity })
      }

      await cart.save()
    }

    const populatedCart = await cart.populate("items.product", "name slug price discountPrice images stock")
    res.status(200).json({ message: "Added to cart", cart: populatedCart })
  } catch (error) {
    console.error("Add to cart error:", error)
    res.status(500).json({ message: "Failed to add to cart" })
  }
}

// Update quantity of an existing cart item
export async function updateCartItem(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} units available` })
    }

    const cart = await Cart.findOne({ user: req.user!.userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    const item = cart.items.find((item) => item.product.toString() === productId)
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" })
    }

    item.quantity = quantity
    await cart.save()

    const populatedCart = await cart.populate("items.product", "name slug price discountPrice images stock")
    res.json({ message: "Cart updated", cart: populatedCart })
  } catch (error) {
    console.error("Update cart error:", error)
    res.status(500).json({ message: "Failed to update cart" })
  }
}

// Remove an item from the cart entirely
export async function removeFromCart(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params

    const cart = await Cart.findOneAndUpdate(
      { user: req.user!.userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate("items.product", "name slug price discountPrice images stock")

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    res.json({ message: "Removed from cart", cart })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({ message: "Failed to remove from cart" })
  }
}

// Clear the entire cart (used after successful checkout later)
export async function clearCart(req: AuthRequest, res: Response) {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user!.userId },
      { items: [] },
      { new: true }
    )
    res.json({ message: "Cart cleared", cart })
  } catch (error) {
    console.error("Clear cart error:", error)
    res.status(500).json({ message: "Failed to clear cart" })
  }
}