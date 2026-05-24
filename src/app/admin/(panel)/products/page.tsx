import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveUnitCents } from "@/lib/pricing";
import DeleteRowButton from "@/components/DeleteRowButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary px-5 py-2.5">
          + Add Product
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-200/60">
                <td className="px-5 py-3 font-medium">{p.title}</td>
                <td className="px-5 py-3 text-ink-900/70">{p.category.name}</td>
                <td className="px-5 py-3">{rupees(effectiveUnitCents(p))}</td>
                <td className="px-5 py-3">{p.stock}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}`} className="text-slate-700 font-semibold mr-3">
                    Edit
                  </Link>
                  <DeleteRowButton url={`/api/admin/products/${p.id}`} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-ink-900/50">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
