import { api } from "./api"

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<{ categories: Category[] }, void>({
      query: () => "/categories",
    }),
  }),
})

export const { useGetCategoriesQuery } = categoriesApi