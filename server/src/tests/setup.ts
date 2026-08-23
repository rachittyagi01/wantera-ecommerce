import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

beforeAll(async () => {
  // Same Atlas cluster, but a DIFFERENT database name — keeps test data
  // completely separate from your real development data
  const testUri = process.env.MONGODB_URI!.replace(/\/[^/?]+(\?|$)/, "/wantera_test$1")
  await mongoose.connect(testUri)
})

afterEach(async () => {
  // Clean all collections between individual tests, so tests don't interfere with each other
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.close()
})