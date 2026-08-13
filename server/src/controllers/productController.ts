import { Request, Response } from "express"
import { Product } from "../models/Product"
import { generateSlug } from "../utils/generateSlug"

// Public — list products (basic version; search/filter/pagination comes in Phase 12)
export async function getProducts(req: Request, res: Response) {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name slug") // pulls in category name/slug instead of just its ID
      .sort({ createdAt: -1 })

    res.json({ products })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Failed to fetch products" })
  }
}

// Public — single product by slug
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params
    const product = await Product.findOne({ slug, isActive: true }).populate("category", "name slug")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Failed to fetch product" })
  }
}

// Admin only — create a product
export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, discountPrice, images, category, brand, stock, featured } = req.body

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Name, description, price, and category are required" })
    }

    const slug = generateSlug(name)

    const existing = await Product.findOne({ slug })
    if (existing) {
      return res.status(409).json({ message: "A product with this name already exists" })
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      discountPrice,
      images: images || [],
      category,
      brand,
      stock: stock || 0,
      featured: featured || false,
    })

    res.status(201).json({ message: "Product created", product })
  } catch (error) {
    console.error("Create product error:", error)
    res.status(500).json({ message: "Failed to create product" })
  }
}

// Admin only — update a product
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // If name is being changed, regenerate the slug to match
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name)
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product updated", product })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ message: "Failed to update product" })
  }
}

// Admin only — deactivate a product (NOT a hard delete — protects order history)
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true })
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json({ message: "Product deactivated", product })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Failed to deactivate product" })
  }
}