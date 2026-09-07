import { Link } from "react-router";
import { useGetProductsQuery } from "@/services/productsApi";

export default function Home() {
  const { data, isLoading, isError } = useGetProductsQuery({
    limit: "8",
    sort: "newest",
  });

  return (
    <div>
      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-surface via-background to-surface px-6 py-24 md:py-32 text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary mb-5 leading-tight">
            Want It. Find It. <span className="text-primary">Love It.</span>
          </h1>
          <p className="text-text-muted text-lg mb-10 max-w-xl mx-auto">
            Discover products that match your style — curated, modern, and
            delivered to your door.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-default font-medium text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* New arrivals */}
      <section className="px-6 py-16">
        <h2 className="text-2xl font-display font-bold mb-8">New Arrivals</h2>

        {isLoading && <p className="text-text-muted">Loading products...</p>}
        {isError && (
          <p className="text-error">
            Failed to load products. Is the backend running?
          </p>
        )}

        {data && data.products.length === 0 && (
          <p className="text-text-muted">No products yet — check back soon.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data?.products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product.slug}`}
              className="group bg-background rounded-card overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-surface aspect-square overflow-hidden flex items-center justify-center text-text-muted text-sm">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  "No image"
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-primary font-semibold">
                  ₹{product.discountPrice ?? product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
