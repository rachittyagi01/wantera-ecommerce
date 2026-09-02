import { api } from "./api"

interface CheckoutSummary {
  lineItems: {
    productId: string
    name: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

interface ApplyCouponResponse {
  message: string
  discount: number
}

export const checkoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCheckoutSummary: builder.query<CheckoutSummary, void>({
      query: () => "/checkout/summary",
      providesTags: ["Cart"],
    }),
    applyCoupon: builder.mutation<ApplyCouponResponse, { code: string; subtotal: number }>({
      query: (body) => ({
        url: "/coupons/apply",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const { useGetCheckoutSummaryQuery, useApplyCouponMutation } = checkoutApi