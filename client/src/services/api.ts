import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { API_BASE_URL } from "../constants/api"

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    credentials: "include", // sends cookies (needed for refresh token) with every request
  }),
  tagTypes: ["Product", "Cart", "Wishlist", "Order", "User"],
  endpoints: () => ({}),
})