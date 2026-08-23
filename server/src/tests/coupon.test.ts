import { Coupon } from "../models/Coupon"
import { validateCoupon } from "../utils/validateCoupon"

describe("Coupon validation", () => {
  it("should reject a coupon that doesn't exist", async () => {
    const result = await validateCoupon("FAKECODE", 1000)
    expect(result.valid).toBe(false)
    expect(result.message).toBe("Invalid coupon code")
  })

  it("should reject a coupon below minimum purchase", async () => {
    await Coupon.create({
      code: "MIN500",
      type: "FIXED",
      value: 50,
      minPurchase: 500,
      expiry: new Date(Date.now() + 86400000), // tomorrow
      usageLimit: 10,
    })

    const result = await validateCoupon("MIN500", 300)
    expect(result.valid).toBe(false)
  })

  it("should cap a percentage discount at maxDiscount", async () => {
    await Coupon.create({
      code: "SAVE10",
      type: "PERCENTAGE",
      value: 10,
      minPurchase: 0,
      maxDiscount: 500,
      expiry: new Date(Date.now() + 86400000),
      usageLimit: 10,
    })

    // 10% of 11996 = 1199.6, but should be capped at 500
    const result = await validateCoupon("SAVE10", 11996)
    expect(result.valid).toBe(true)
    expect(result.discount).toBe(500)
  })

  it("should reject an expired coupon", async () => {
    await Coupon.create({
      code: "OLDCODE",
      type: "FIXED",
      value: 50,
      minPurchase: 0,
      expiry: new Date(Date.now() - 86400000), // yesterday — already expired
      usageLimit: 10,
    })

    const result = await validateCoupon("OLDCODE", 1000)
    expect(result.valid).toBe(false)
    expect(result.message).toBe("This coupon has expired")
  })
})