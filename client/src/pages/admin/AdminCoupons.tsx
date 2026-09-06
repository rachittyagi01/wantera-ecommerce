import { useState } from "react"
import { useGetCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } from "@/services/couponsApi"

export default function AdminCoupons() {
  const { data, isLoading } = useGetCouponsQuery()
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation()
  const [deleteCoupon] = useDeleteCouponMutation()

  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    expiry: "",
    usageLimit: "",
  })
  const [error, setError] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    try {
      await createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiry: form.expiry,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      }).unwrap()
      setForm({ code: "", type: "PERCENTAGE", value: "", minPurchase: "", maxDiscount: "", expiry: "", usageLimit: "" })
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to create coupon"
      setError(message || "Failed to create coupon")
    }
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-8">Manage Coupons</h1>

      <form onSubmit={handleCreate} className="border border-border rounded-card p-5 mb-8 space-y-3">
        <h2 className="font-semibold mb-2">Create Coupon</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            required placeholder="Code (e.g. SAVE10)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="border border-border rounded-default px-3 py-2 text-sm"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}
            className="border border-border rounded-default px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
          <input
            required type="number" placeholder="Value" value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="border border-border rounded-default px-3 py-2 text-sm"
          />
          <input
            type="number" placeholder="Min Purchase (optional)" value={form.minPurchase}
            onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
            className="border border-border rounded-default px-3 py-2 text-sm"
          />
          {form.type === "PERCENTAGE" && (
            <input
              type="number" placeholder="Max Discount (optional)" value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              className="border border-border rounded-default px-3 py-2 text-sm"
            />
          )}
          <input
            required type="date" value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            className="border border-border rounded-default px-3 py-2 text-sm"
          />
          <input
            type="number" placeholder="Usage Limit (optional)" value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="border border-border rounded-default px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={creating}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-default text-sm font-medium"
        >
          {creating ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-text-muted">Loading coupons...</p>
      ) : (
        <div className="space-y-2">
          {data?.coupons.map((coupon) => (
            <div key={coupon._id} className="flex items-center justify-between border border-border rounded-card p-4">
              <div>
                <p className="font-medium">{coupon.code}</p>
                <p className="text-text-muted text-xs">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `₹${coupon.value} off`}
                  {coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""}
                  {" · "}Used {coupon.usedCount}/{coupon.usageLimit}
                  {" · "}Expires {new Date(coupon.expiry).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={coupon.isActive ? "text-success text-xs" : "text-text-muted text-xs"}>
                  {coupon.isActive ? "Active" : "Disabled"}
                </span>
                <button onClick={() => deleteCoupon(coupon._id)} className="text-error text-sm hover:underline">
                  Disable
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}