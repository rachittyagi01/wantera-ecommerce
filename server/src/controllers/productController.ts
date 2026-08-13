import { Request, Response } from "express"
import { Product } from "../models/Product"
import { Category } from "../models/Category"
import { generateSlug } from "../utils/generateSlug"

// Public — list products with search, filtering, sorting, and pagination
export async function getProducts(req: Request, res: Response) {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>

    // Build the MongoDB filter object step by step
    const filter: Record<string, unknown> = { isActive: true }

    if (keyword) {
      filter.$text = { $search: keyword } // uses the text index from Phase 10
    }

    if (category) {
      // category comes in as a slug from the frontend (e.g. "electronics"),
      // but the Product model stores a Category ObjectId — so we look up the ID first
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        filter.category = categoryDoc._id
      } else {
        // Requested category doesn't exist — return empty results rather than erroring
        return res.json({ products: [], page: 1, totalPages: 0, totalProducts: 0 })
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice)
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice)
    }

    // Build the sort object
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 } // default: newest first
    if (sort === "price_asc") sortOption = { price: 1 }
    if (sort === "price_desc") sortOption = { price: -1 }
    if (sort === "rating") sortOption = { ratings: -1 }
    if (sort === "newest") sortOption = { createdAt: -1 }

    // Pagination math
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))
    const skip = (pageNum - 1) * limitNum

    // Run the query and count in parallel — faster than doing them one after another
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ])

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(totalProducts / limitNum),
      totalProducts,
    })
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