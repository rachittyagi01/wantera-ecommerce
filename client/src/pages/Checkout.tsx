import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useGetAddressesQuery, useCreateAddressMutation } from "@/services/addressApi"
import { useGetCheckoutSummaryQuery, useApplyCouponMutation } from "@/services/checkoutApi"
import { useAppSelector } from "@/store/hooks"

export default function Checkout() {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()

  const { data: addressData, isLoading: loadingAddresses } = useGetAddressesQuery(undefined, { skip: !user })
  const { data: summary, isLoading: loadingSummary } = useGetCheckoutSummaryQuery(undefined, { skip: !user })
  const [createAddress] = useCreateAddressMutation()
  const [applyCoupon, { isLoading: applyingCoupon }] = useApplyCouponMutation()

  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState("")

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
  })

  if (!user) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please log in to checkout.</p>
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (loadingAddresses || loadingSummary) {
    return <div className="px-6 py-16 text-text-muted">Loading checkout...</div>
  }

  if (!summary || summary.lineItems.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Your cart is empty.</p>
        <Link to="/shop" className="text-primary hover:underline">Continue Shopping</Link>
      </div>
    )
  }

  const addresses = addressData?.addresses || []
  const total = summary.subtotal + summary.shipping + summary.tax - discount

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createAddress(newAddress).unwrap()
      setSelectedAddressId(result.address._id)
      setShowNewAddressForm(false)
    } catch {
      alert("Failed to add address")
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    try {
      const result = await applyCoupon({ code: couponCode, subtotal: summary!.subtotal }).unwrap()
      setDiscount(result.discount)
      setCouponMessage(`Coupon applied! You saved ₹${result.discount}`)
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Invalid coupon"
      setDiscount(0)
      setCouponMessage(message || "Invalid coupon")
    }
  }

  function handleProceedToPayment() {
    if (!selectedAddressId) {
      alert("Please select a shipping address")
      return
    }
    // Payment integration comes in the next step — for now, just log what we'd send
    navigate("/checkout/payment", {
      state: { addressId: selectedAddressId, couponCode: discount > 0 ? couponCode : undefined },
    })
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: address + coupon */}
        <div className="md:col-span-2 space-y-8">
          {/* Address selection */}
          <div>
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block border rounded-card p-4 cursor-pointer ${
                    selectedAddressId === addr._id ? "border-primary" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mr-2"
                  />
                  <span className="font-medium">{addr.name}</span> — {addr.phone}
                  <p className="text-sm text-text-muted ml-6">
                    {addr.addressLine}, {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                </label>
              ))}
            </div>

            {!showNewAddressForm ? (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="text-primary text-sm mt-3 hover:underline"
              >
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="mt-4 space-y-3 border border-border rounded-card p-4">
                <input placeholder="Full Name" required value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full border border-border rounded-default px-3 py-2 text-sm" />
                <input placeholder="Phone" required value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full border border-border rounded-default px-3 py-2 text-sm" />
                <input placeholder="Address Line" required value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="w-full border border-border rounded-default px-3 py-2 text-sm" />
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="City" required value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="border border-border rounded-default px-3 py-2 text-sm" />
                  <input placeholder="State" required value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="border border-border rounded-default px-3 py-2 text-sm" />
                  <input placeholder="Postal Code" required value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="border border-border rounded-default px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-default text-sm font-medium">
                  Save Address
                </button>
              </form>
            )}
          </div>

          {/* Coupon */}
          <div>
            <h2 className="font-semibold mb-3">Coupon Code</h2>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 border border-border rounded-default px-3 py-2 text-sm"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={applyingCoupon}
                className="bg-secondary text-white px-4 py-2 rounded-default text-sm font-medium disabled:opacity-50"
              >
                {applyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponMessage && (
              <p className={`text-sm mt-2 ${discount > 0 ? "text-success" : "text-error"}`}>
                {couponMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: order summary */}
        <div className="border border-border rounded-card p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {summary.lineItems.map((item) => (
              <div key={item.productId} className="flex justify-between text-text-muted">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.lineTotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{summary.shipping === 0 ? "Free" : `₹${summary.shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{summary.tax}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-success"><span>Discount</span><span>−₹{discount}</span></div>
            )}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span><span className="text-primary">₹{total}</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-default font-medium mt-6"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  )
}