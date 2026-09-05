import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/services/productsApi";
import { useGetCategoriesQuery } from "@/services/categoriesApi";
import { useUploadImageMutation } from "@/services/uploadApi";
import { useGetProductsQuery } from "@/services/productsApi";

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: productsData } = useGetProductsQuery(
    { limit: "50" },
    { skip: !isEditMode },
  );
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    stock: "",
    brand: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  // If editing, pre-fill the form once we find the matching product
  useEffect(() => {
    if (isEditMode && productsData) {
      const existing = productsData.products.find((p) => p._id === id);
      if (existing) {
        setForm({
          name: existing.name,
          description: existing.description,
          price: String(existing.price),
          discountPrice: existing.discountPrice
            ? String(existing.discountPrice)
            : "",
          category: existing.category._id,
          stock: String(existing.stock),
          brand: "",
        });
        setImageUrl(existing.images[0] || "");
      }
    }
  }, [isEditMode, productsData, id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await uploadImage(formData).unwrap();
      setImageUrl(result.url);
    } catch {
      setError("Image upload failed");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.category) {
      setError("Please select a category");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice
        ? Number(form.discountPrice)
        : undefined,
      category: form.category,
      stock: Number(form.stock),
      brand: form.brand || undefined,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      if (isEditMode && id) {
        await updateProduct({ id, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      navigate("/admin/products");
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to save product";
      setError(message || "Failed to save product");
    }
  }

  return (
    <div className="px-6 py-10 max-w-2xl mx-auto">
      <Link
        to="/admin/products"
        className="text-sm text-text-muted hover:underline mb-4 inline-block"
      >
        ← Back to Products
      </Link>
      <h1 className="text-2xl font-display font-bold mb-8">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-border rounded-default px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-border rounded-default px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-border rounded-default px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Price (optional)
            </label>
            <input
              type="number"
              min="0"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({ ...form, discountPrice: e.target.value })
              }
              className="w-full border border-border rounded-default px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-border rounded-default px-3 py-2"
            >
              <option value="">Select category</option>
              {categoriesData?.categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-border rounded-default px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Brand (optional)
          </label>
          <input
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="w-full border border-border rounded-default px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-default file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium file:cursor-pointer hover:file:bg-primary-hover border border-border rounded-default px-3 py-2 w-full"
          />
          {uploading && (
            <p className="text-xs text-text-muted mt-1">Uploading...</p>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-default mt-2"
            />
          )}
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={creating || updating}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2 rounded-default font-medium"
        >
          {creating || updating
            ? "Saving..."
            : isEditMode
              ? "Update Product"
              : "Create Product"}
        </button>
      </form>
    </div>
  );
}
