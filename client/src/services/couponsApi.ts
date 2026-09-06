import { api } from "./api"

interface Coupon {
  _id: string
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minPurchase: number
  maxDiscount?: number
  expiry: string
  usageLimit: number
  usedCount: number
  isActive: boolean
}

interface CouponInput {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minPurchase?: number
  maxDiscount?: number
  expiry: string
  usageLimit?: number
}

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<{ coupons: Coupon[] }, void>({
      query: () => "/coupons",
      providesTags: ["Order"],
    }),
    createCoupon: builder.mutation<{ coupon: Coupon }, CouponInput>({
      query: (body) => ({
        url: "/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
    deleteCoupon: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
})

export const { useGetCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } = couponsApi