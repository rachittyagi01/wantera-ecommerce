import { Request, Response } from "express"
import { Review } from "../models/Review"
import { Product } from "../models/Product"
import { AuthRequest } from "../middleware/authMiddleware"

// Public — get all reviews for a product
export async function getProductReviews(req: Request, res: Response) {
  try {
    const { productId } = req.params
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })

    res.json({ reviews })
  } catch (error) {
    console.error("Get reviews error:", error)
    res.status(500).json({ message: "Failed to fetch reviews" })
  }
}

// User — submit a review (one per product per user)
export async function createReview(req: AuthRequest, res: Response) {
  try {
    const { productId, rating, comment } = req.body

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "productId, rating, and comment are required" })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const existing = await Review.findOne({ user: req.user!.userId, product: productId })
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this product" })
    }

    const review = await Review.create({
      user: req.user!.userId,
      product: productId,
      rating,
      comment,
    })

    // Recalculate the product's average rating and review count
    const allReviews = await Review.find({ product: productId })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    product.ratings = Math.round(avgRating * 10) / 10 // round to 1 decimal
    product.reviewCount = allReviews.length
    await product.save()

    const populatedReview = await review.populate("user", "name")

    res.status(201).json({ message: "Review submitted", review: populatedReview })
  } catch (error) {
    console.error("Create review error:", error)
    res.status(500).json({ message: "Failed to submit review" })
  }
}