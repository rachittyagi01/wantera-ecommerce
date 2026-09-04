import { api } from "./api"

interface CreateOrderResponse {
  message: string
  razorpayOrderId: string
  razorpayKeyId: string
  amount: number
  currency: string
  orderId: string
}

interface VerifyPaymentResponse {
  message: string
  order: {
    _id: string
    total: number
    orderStatus: string
  }
}

interface VerifyPaymentBody {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentOrder: builder.mutation<CreateOrderResponse, { addressId: string; couponCode?: string }>({
      query: (body) => ({
        url: "/payments/create-order",
        method: "POST",
        body,
      }),
    }),
    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentBody>({
      query: (body) => ({
        url: "/payments/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart", "Order"],
    }),
  }),
})

export const { useCreatePaymentOrderMutation, useVerifyPaymentMutation } = paymentApi