import { Response } from "express"
import { Wishlist } from "../models/Wishlist"
import { AuthRequest } from "../middleware/authMiddleware"

// Get the logged-in user's wishlist
export async function getWishlist(req: AuthRequest, res: Response) {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user!.userId }).populate(
      "products",
      "name slug price discountPrice images stock"
    )

    // If the user has never added anything, there's no document yet — that's fine, return an empty one
    if (!wishlist) {
      return res.json({ wishlist: { products: [] } })
    }

    res.json({ wishlist })
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({ message: "Failed to fetch wishlist" })
  }
}

// Add a product to the wishlist
export async function addToWishlist(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.body
    if (!productId) {
      return res.status(400).json({ message: "productId is required" })
    }

    // findOneAndUpdate with upsert: true — creates the wishlist document if it doesn't exist yet,
    // updates it if it does. Avoids writing separate "create" vs "update" logic.
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user!.userId },
      { $addToSet: { products: productId } }, // $addToSet prevents duplicate entries automatically
      { new: true, upsert: true }
    ).populate("products", "name slug price discountPrice images stock")

    res.status(200).json({ message: "Added to wishlist", wishlist })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    res.status(500).json({ message: "Failed to add to wishlist" })
  }
}

// Remove a product from the wishlist
export async function removeFromWishlist(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user!.userId },
      { $pull: { products: productId } }, // $pull removes the matching item from the array
      { new: true }
    ).populate("products", "name slug price discountPrice images stock")

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" })
    }

    res.json({ message: "Removed from wishlist", wishlist })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({ message: "Failed to remove from wishlist" })
  }
}