import mongoose from "mongoose"

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env")
    }

    await mongoose.connect(uri)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    process.exit(1) // stop the server entirely if the DB can't connect — no point running without it
  }
}