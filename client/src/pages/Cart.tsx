import { Link } from "react-router"
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/services/cartApi"
import { useAppSelector } from "@/store/hooks"

export default function Cart() {
  const user = useAppSelector((state) => state.auth.user)
  const { data, isLoading } = useGetCartQuery(undefined, { skip: !user })
  const [updateItem] = useUpdateCartItemMutation()
  const [removeItem] = useRemoveFromCartMutation()

  if (!user) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please log in to view your cart.</p>
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="px-6 py-16 text-text-muted">Loading cart...</div>
  }

  const items = data?.cart.items || []

  if (items.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Your cart is empty.</p>
        <Link to="/shop" className="text-primary hover:underline">Continue Shopping</Link>
      </div>
    )
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price
    return sum + price * item.quantity
  }, 0)

  async function handleQuantityChange(productId: string, newQuantity: number) {
    if (newQuantity < 1) return
    try {
      await updateItem({ productId, quantity: newQuantity }).unwrap()
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to update quantity"
      alert(message || "Failed to update quantity")
    }
  }

  async function handleRemove(productId: string) {
    await removeItem(productId).unwrap()
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const price = item.product.discountPrice ?? item.product.price
          return (
            <div key={item.product._id} className="flex items-center gap-4 border border-border rounded-card p-4">
              <div className="w-20 h-20 bg-surface rounded-default overflow-hidden flex-shrink-0">
                {item.product.images[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1">
                <Link to={`/product/${item.product.slug}`} className="font-medium hover:text-primary">
                  {item.product.name}
                </Link>
                <p className="text-primary font-semibold mt-1">₹{price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                  className="w-8 h-8 border border-border rounded-default hover:bg-surface"
                >
                  −
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                  className="w-8 h-8 border border-border rounded-default hover:bg-surface"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleRemove(item.product._id)}
                className="text-error text-sm hover:underline ml-4"
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border pt-6 flex justify-between items-center">
        <span className="text-lg font-medium">Subtotal</span>
        <span className="text-2xl font-semibold text-primary">₹{subtotal}</span>
      </div>

      <Link
        to="/checkout"
        className="block w-full text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-default font-medium mt-6"
      >
        Proceed to Checkout
      </Link>
    </div>
  )
}