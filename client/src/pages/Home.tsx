import { Link } from "react-router"
import { useGetProductsQuery } from "@/services/productsApi"

export default function Home() {
  const { data, isLoading, isError } = useGetProductsQuery({ limit: "8", sort: "newest" })

  return (
    <div>
      {/* Hero section */}
      <section className="bg-surface px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4">
          Want It. Find It. <span className="text-primary">Love It.</span>
        </h1>
        <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto">
          Discover products that match your style — curated, modern, and delivered to your door.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-default font-medium"
        >
          Shop Now
        </Link>
      </section>

      {/* New arrivals */}
      <section className="px-6 py-16">
        <h2 className="text-2xl font-display font-bold mb-8">New Arrivals</h2>

        {isLoading && <p className="text-text-muted">Loading products...</p>}
        {isError && <p className="text-error">Failed to load products. Is the backend running?</p>}

        {data && data.products.length === 0 && (
          <p className="text-text-muted">No products yet — check back soon.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data?.products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product.slug}`}
              className="border border-border rounded-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="bg-surface aspect-square rounded-default mb-3 flex items-center justify-center text-text-muted text-sm">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-default" />
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
      </section>
    </div>
  )
}