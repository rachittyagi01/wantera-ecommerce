import { api } from "./api"

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: { _id: string; name: string; slug: string }
  stock: number
  ratings: number
  reviewCount: number
  featured: boolean
}

interface ProductsResponse {
  products: Product[]
  page: number
  totalPages: number
  totalProducts: number
}

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, Record<string, string> | void>({
      query: (params) => ({
        url: "/products",
        params: params || {},
      }),
      providesTags: ["Product"],
    }),
    getProductBySlug: builder.query<{ product: Product }, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: ["Product"],
    }),
  }),
})

export const { useGetProductsQuery, useGetProductBySlugQuery } = productsApi