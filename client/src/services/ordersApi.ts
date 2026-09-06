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

interface AdminOrder extends Order {
  user: { name: string; email: string }
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
    getAllOrders: builder.query<{ orders: AdminOrder[] }, void>({
      query: () => "/orders/admin/all",
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<{ order: Order }, { id: string; orderStatus: string }>({
      query: ({ id, orderStatus }) => ({
        url: `/orders/admin/${id}/status`,
        method: "PUT",
        body: { orderStatus },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
})

export const {
  useGetMyOrdersQuery,
  useGetMyOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersApi