import { api } from "./api"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  recentOrders: {
    _id: string
    total: number
    orderStatus: string
    user: { name: string; email: string }
    createdAt: string
  }[]
  lowStockProducts: { _id: string; name: string; stock: number }[]
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/admin/dashboard",
    }),
  }),
})

export const { useGetDashboardStatsQuery } = adminApi