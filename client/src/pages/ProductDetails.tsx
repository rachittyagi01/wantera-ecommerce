import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { useGetProductBySlugQuery } from "@/services/productsApi"
import { useAddToCartMutation } from "@/services/cartApi"
import { toast } from "sonner"
import { useAddToWishlistMutation } from "@/services/wishlistApi"
import { useAppSelector } from "@/store/hooks"

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useGetProductBySlugQuery(slug!)
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation()
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation()
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
      toast.error(message || "Failed to add to cart")
    }
  }

  async function handleAddToWishlist() {
    if (!user) {
      navigate("/login")
      return
    }
    try {
      await addToWishlist(product._id).unwrap()
      toast.success("Added to wishlist!")
    } catch {
      toast.error("Failed to add to wishlist")
    }
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div>
          <div
            className="bg-surface rounded-card aspect-square overflow-hidden flex items-center justify-center touch-pan-y"
            onTouchStart={(e) => {
              const touch = e.touches[0]
              ;(e.currentTarget as HTMLDivElement).dataset.startX = String(touch.clientX)
            }}
            onTouchEnd={(e) => {
              const startX = Number((e.currentTarget as HTMLDivElement).dataset.startX || 0)
              const endX = e.changedTouches[0].clientX
              const diff = startX - endX

              if (Math.abs(diff) > 50) {
                if (diff > 0 && activeImageIndex < product.images.length - 1) {
                  setActiveImageIndex((i) => i + 1)
                } else if (diff < 0 && activeImageIndex > 0) {
                  setActiveImageIndex((i) => i - 1)
                }
              }
            }}
          >
            {product.images[activeImageIndex] ? (
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-text-muted">No image</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={img + index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-16 h-16 rounded-default overflow-hidden flex-shrink-0 border-2 ${
                    index === activeImageIndex ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
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

          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-2">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-2 pr-4 text-text-muted font-medium">{spec.key}</td>
                      <td className="py-2">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
            <button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className="border border-border hover:bg-surface px-8 py-3 rounded-default font-medium"
            >
              {isAddingToWishlist ? "Adding..." : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}