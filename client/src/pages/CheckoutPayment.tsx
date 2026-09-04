import { useLocation, useNavigate, Link } from "react-router"
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from "@/services/paymentApi"
import { useAppSelector } from "@/store/hooks"
import { useState } from "react"

interface LocationState {
  addressId: string
  couponCode?: string
}

export default function CheckoutPayment() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [createOrder, { isLoading: creatingOrder }] = useCreatePaymentOrderMutation()
  const [verifyPayment] = useVerifyPaymentMutation()
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const state = location.state as LocationState | null

  if (!user) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please log in to continue.</p>
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (!state?.addressId) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-text-muted mb-4">Please complete checkout first.</p>
        <Link to="/checkout" className="text-primary hover:underline">Back to Checkout</Link>
      </div>
    )
  }
  const currentUser = user // TypeScript now knows this is non-null for the rest of the component
  async function handlePayNow() {
    setStatus("processing")
    setErrorMessage("")

    try {
      // Step 1: create the Razorpay order — amount comes ENTIRELY from the backend
      const orderData = await createOrder({
        addressId: state!.addressId,
        couponCode: state!.couponCode,
      }).unwrap()

      // Step 2: open the actual Razorpay Checkout widget
      const razorpay = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.razorpayOrderId,
        name: "WANTERA",
        description: "Order Payment",
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: "#4338CA", // matches our primary indigo from Phase 1
        },
        handler: async (response) => {
          // Step 3: this fires ONLY after successful payment — send details to backend for verification
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap()

            navigate("/order-confirmation", { state: { orderId: result.order._id } })
          } catch {
            setStatus("error")
            setErrorMessage("Payment succeeded but verification failed. Please contact support.")
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay widget without paying
            setStatus("idle")
          },
        },
      })

      razorpay.open()
    } catch (err) {
      setStatus("error")
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to initiate payment"
      setErrorMessage(message || "Failed to initiate payment")
    }
  }

  return (
    <div className="px-6 py-16 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-display font-bold mb-4">Complete Your Payment</h1>
      <p className="text-text-muted mb-8">
        You'll be redirected to Razorpay's secure checkout to complete your purchase.
      </p>

      {errorMessage && (
        <p className="text-error text-sm mb-4">{errorMessage}</p>
      )}

      <button
        onClick={handlePayNow}
        disabled={creatingOrder || status === "processing"}
        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-default font-medium"
      >
        {creatingOrder ? "Preparing payment..." : "Pay Now"}
      </button>

      <Link to="/checkout" className="block text-sm text-text-muted mt-4 hover:underline">
        ← Back to Checkout
      </Link>
    </div>
  )
}