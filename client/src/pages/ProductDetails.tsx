import { useParams, Link, useNavigate } from "react-router"
import { useGetProductBySlugQuery } from "@/services/productsApi"
import { useAddToCartMutation } from "@/services/cartApi"
import { useAppSelector } from "@/store/hooks"

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useGetProductBySlugQuery(slug!)
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation()
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading product...</div>
  }

  if (isError || !data) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-error mb-4">Product not found.</p>
        <Link to="/shop" className="text-primary hover:underline">Back to Shop</Link>
      </div>
    )
  }

  const { product } = data
  const displayPrice = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const inStock = product.stock > 0

  async function handleAddToCart() {
    if (!user) {
      navigate("/login")
      return
    }
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap()
      navigate("/cart")
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to add to cart"
      alert(message || "Failed to add to cart")
    }
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-surface rounded-card aspect-square overflow-hidden flex items-center justify-center">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-text-muted">No image</span>
          )}
        </div>

        <div>
          <p className="text-text-muted text-sm mb-2">{product.category.name}</p>
          <h1 className="text-3xl font-display font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-semibold text-primary">₹{displayPrice}</span>
            {hasDiscount && (
              <span className="text-text-muted line-through">₹{product.price}</span>
            )}
          </div>

          <p className="text-text mb-6">{product.description}</p>

          <p className={`text-sm font-medium mb-6 ${inStock ? "text-success" : "text-error"}`}>
            {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-default font-medium"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
            <button className="border border-border hover:bg-surface px-8 py-3 rounded-default font-medium">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}