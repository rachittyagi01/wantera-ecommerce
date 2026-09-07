import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner"
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductsQuery,
} from "@/services/productsApi";
import { useGetCategoriesQuery } from "@/services/categoriesApi";
import { useUploadImageMutation } from "@/services/uploadApi";

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
  const [error, setError] = useState("");

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
        setImageUrls(existing.images || []);
        setSpecifications(existing.specifications || []);
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
      setImageUrls((prev) => [...prev, result.url]);
    } catch {
      setError("Image upload failed");
    }

    e.target.value = "";
  }

  function handleRemoveImage(urlToRemove: string) {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  }

  function addSpecRow() {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateSpecRow(index: number, field: "key" | "value", value: string) {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
  }

  function removeSpecRow(index: number) {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
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
      images: imageUrls,
      specifications: specifications.filter((s) => s.key.trim() && s.value.trim()),
    };

    try {
      if (isEditMode && id) {
        await updateProduct({ id, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      toast.success(isEditMode ? "Product updated successfully" : "Product created successfully")
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
          <label className="block text-sm font-medium mb-2">Specifications (optional)</label>
          <div className="space-y-2">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  placeholder="e.g. Battery Life"
                  value={spec.key}
                  onChange={(e) => updateSpecRow(index, "key", e.target.value)}
                  className="flex-1 border border-border rounded-default px-3 py-2 text-sm"
                />
                <input
                  placeholder="e.g. 30 hours"
                  value={spec.value}
                  onChange={(e) => updateSpecRow(index, "value", e.target.value)}
                  className="flex-1 border border-border rounded-default px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="text-error text-sm px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSpecRow}
            className="text-primary text-sm mt-2 hover:underline"
          >
            + Add Specification
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product Images
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

          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {imageUrls.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-default"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute -top-2 -right-2 bg-error text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-text-muted mt-2">
            Upload one at a time — the first image becomes the main product photo.
          </p>
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