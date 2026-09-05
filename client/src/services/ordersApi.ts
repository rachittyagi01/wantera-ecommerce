import { api } from "./api"

interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Order {
  _id: string
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    addressLine: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  orderStatus: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
  createdAt: string
}

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<{ orders: Order[] }, void>({
      query: () => "/orders/my-orders",
      providesTags: ["Order"],
    }),
    getMyOrderById: builder.query<{ order: Order }, string>({
      query: (id) => `/orders/my-orders/${id}`,
      providesTags: ["Order"],
    }),
  }),
})

export const { useGetMyOrdersQuery, useGetMyOrderByIdQuery } = ordersApi