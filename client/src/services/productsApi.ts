import { api } from "./api";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: { _id: string; name: string; slug: string };
  stock: number;
  ratings: number;
  reviewCount: number;
  featured: boolean;
}

interface ProductsResponse {
  products: Product[];
  page: number;
  totalPages: number;
  totalProducts: number;
}

interface ProductInput {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  brand?: string;
  images?: string[];
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
    createProduct: builder.mutation<{ product: Product }, ProductInput>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<{ product: Product }, { id: string; data: Partial<ProductInput> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;