import { Request, Response } from "express"
import { Order } from "../models/Order"
import { Product } from "../models/Product"
import { User } from "../models/User"

export async function getDashboardStats(req: Request, res: Response) {
  try {
    // Run all these independent queries in parallel — same Promise.all pattern from Phase 12
    const [
      totalRevenueResult,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Sum the total of all PAID orders only — pending/failed orders aren't real revenue
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      User.countDocuments({ role: "USER" }),
      Product.countDocuments({ isActive: true }),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5),
      Product.find({ isActive: true, stock: { $lte: 10 } }).select("name stock"),
    ])

    const totalRevenue = totalRevenueResult[0]?.total || 0

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Failed to fetch dashboard stats" })
  }
}