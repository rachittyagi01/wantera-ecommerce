import { useState } from "react"
import { Link } from "react-router"
import { useGetProductsQuery, useDeleteProductMutation } from "@/services/productsApi"

export default function AdminProducts() {
  const { data, isLoading } = useGetProductsQuery({ limit: "50" })
  const [deleteProduct] = useDeleteProductMutation()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  async function handleDeactivate(id: string) {
    await deleteProduct(id).unwrap()
    setConfirmingId(null)
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display font-bold">Manage Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-default text-sm font-medium"
        >
          + Add Product
        </Link>
      </div>

      {isLoading ? (
        <p className="text-text-muted">Loading products...</p>
      ) : (
        <div className="border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.products.map((product) => (
                <tr key={product._id} className="border-t border-border">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface rounded-default overflow-hidden flex-shrink-0">
                      {product.images[0] && (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    {product.name}
                  </td>
                  <td className="p-3 text-text-muted">{product.category?.name}</td>
                  <td className="p-3">₹{product.price}</td>
                  <td className="p-3">
                    <span className={product.stock <= 10 ? "text-warning font-medium" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-success text-xs">Active</span>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <Link to={`/admin/products/${product._id}/edit`} className="text-primary text-xs hover:underline">
                      Edit
                    </Link>
                    {confirmingId === product._id ? (
                      <>
                        <button onClick={() => handleDeactivate(product._id)} className="text-error text-xs hover:underline">
                          Confirm
                        </button>
                        <button onClick={() => setConfirmingId(null)} className="text-text-muted text-xs hover:underline">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmingId(product._id)} className="text-error text-xs hover:underline">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}