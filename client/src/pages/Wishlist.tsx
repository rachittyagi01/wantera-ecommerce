import { Link } from "react-router"
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/services/wishlistApi"
import { useAddToCartMutation } from "@/services/cartApi"
import { useAppSelector } from "@/store/hooks"

export default function Wishlist() {
  const user = useAppSelector((state) => state.auth.user)
  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !user })
  const [removeFromWishlist] = useRemoveFromWishlistMutation()
  const [addToCart] = useAddToCartMutation()

  if (!user) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please log in to view your wishlist.</p>
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading wishlist...</div>
  }

  const products = data?.wishlist.products || []

  if (products.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Your wishlist is empty.</p>
        <Link to="/shop" className="text-primary hover:underline">Browse Products</Link>
      </div>
    )
  }

  async function handleMoveToCart(productId: string) {
    await addToCart({ productId, quantity: 1 }).unwrap()
    await removeFromWishlist(productId).unwrap()
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Your Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="border border-border rounded-card p-4">
            <Link to={`/product/${product.slug}`}>
              <div className="bg-surface aspect-square rounded-default mb-3 overflow-hidden">
                {product.images[0] && (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <h3 className="font-medium text-sm mb-1">{product.name}</h3>
              <p className="text-primary font-semibold">₹{product.discountPrice ?? product.price}</p>
            </Link>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleMoveToCart(product._id)}
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs py-2 rounded-default font-medium"
              >
                Move to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="text-error text-xs px-3 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}