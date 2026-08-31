import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { useGetProductsQuery } from "@/services/productsApi"
import { useGetCategoriesQuery } from "@/services/categoriesApi"

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keywordInput, setKeywordInput] = useState(searchParams.get("keyword") || "")

  const category = searchParams.get("category") || ""
  const sort = searchParams.get("sort") || "newest"

  const { data: categoriesData } = useGetCategoriesQuery()
  const { data, isLoading, isError } = useGetProductsQuery({
    keyword: searchParams.get("keyword") || "",
    category,
    sort,
    limit: "12",
  })

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateParam("keyword", keywordInput)
  }

  return (
    <div className="px-6 py-10">
      <h1 className="text-3xl font-display font-bold mb-6">Shop</h1>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="border border-border rounded-default px-3 py-2 text-sm w-64"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-default text-sm font-medium"
          >
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="border border-border rounded-default px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categoriesData?.categories.map((c) => (
            <option key={c._id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-border rounded-default px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Results */}
      {isLoading && <p className="text-text-muted">Loading products...</p>}
      {isError && <p className="text-error">Failed to load products.</p>}
      {data && data.products.length === 0 && (
        <p className="text-text-muted">No products match your search.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data?.products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product.slug}`}
            className="border border-border rounded-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="bg-surface aspect-square rounded-default mb-3 overflow-hidden flex items-center justify-center text-text-muted text-sm">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                "No image"
              )}
            </div>
            <h3 className="font-medium text-sm mb-1">{product.name}</h3>
            <p className="text-primary font-semibold">
              ₹{product.discountPrice ?? product.price}
            </p>
          </Link>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <p className="text-text-muted text-sm mt-8 text-center">
          Page {data.page} of {data.totalPages} — {data.totalProducts} products total
        </p>
      )}
    </div>
  )
}