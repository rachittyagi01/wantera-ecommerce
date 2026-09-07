import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from "@/services/categoriesApi"

export default function AdminCategories() {
  const { data, isLoading } = useGetCategoriesQuery()
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    try {
      await createCategory({ name, description: description || undefined }).unwrap()
      setName("")
      setDescription("")
      toast.success("Category created successfully")
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to create category"
      setError(message || "Failed to create category")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id).unwrap()
    } catch {
      toast.error("Failed to delete category — it may still have products assigned to it.")
    }
  }

  return (
    <div className="px-6 py-10 max-w-2xl mx-auto">
      <Link to="/admin/products" className="text-sm text-text-muted hover:underline mb-4 inline-block">
        ← Back to Products
      </Link>
      <h1 className="text-2xl font-display font-bold mb-8">Manage Categories</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="border border-border rounded-card p-5 mb-8 space-y-3">
        <h2 className="font-semibold">Add New Category</h2>
        <input
          required
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border rounded-default px-3 py-2 text-sm"
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-border rounded-default px-3 py-2 text-sm"
        />
        {error && <p className="text-error text-sm">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-default text-sm font-medium"
        >
          {creating ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* List */}
      {isLoading ? (
        <p className="text-text-muted">Loading categories...</p>
      ) : (
        <div className="space-y-2">
          {data?.categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between border border-border rounded-card p-4">
              <div>
                <p className="font-medium">{cat.name}</p>
                {cat.description && <p className="text-text-muted text-sm">{cat.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-error text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}