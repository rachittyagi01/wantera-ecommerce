import { api } from "./api"

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
}

interface CategoryInput {
  name: string
  description?: string
  image?: string
}

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<{ categories: Category[] }, void>({
      query: () => "/categories",
      providesTags: ["Product"],
    }),
    createCategory: builder.mutation<{ category: Category }, CategoryInput>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
})

export const { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } = categoriesApi