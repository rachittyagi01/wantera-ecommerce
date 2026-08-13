import { Request, Response } from "express"
import { Category } from "../models/Category"
import { generateSlug } from "../utils/generateSlug"

// Public — anyone can view categories
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Failed to fetch categories" })
  }
}

// Admin only — create a new category
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description, image } = req.body

    if (!name) {
      return res.status(400).json({ message: "Category name is required" })
    }

    const slug = generateSlug(name)

    const existing = await Category.findOne({ slug })
    if (existing) {
      return res.status(409).json({ message: "A category with this name already exists" })
    }

    const category = await Category.create({ name, slug, description, image })
    res.status(201).json({ message: "Category created", category })
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Failed to create category" })
  }
}

// Admin only — update a category
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { name, description, image } = req.body

    const updateData: Record<string, unknown> = { description, image }
    if (name) {
      updateData.name = name
      updateData.slug = generateSlug(name)
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true })
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({ message: "Category updated", category })
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ message: "Failed to update category" })
  }
}

// Admin only — delete a category
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }
    res.json({ message: "Category deleted" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Failed to delete category" })
  }
}