import { api } from "./api"

export interface Review {
  _id: string
  user: { _id: string; name: string }
  rating: number
  comment: string
  createdAt: string
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<{ reviews: Review[] }, string>({
      query: (productId) => `/reviews/${productId}`,
      providesTags: ["Product"],
    }),
    createReview: builder.mutation<{ review: Review }, { productId: string; rating: number; comment: string }>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
})

export const { useGetProductReviewsQuery, useCreateReviewMutation } = reviewsApi