import { prisma } from "@/lib/db";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <div className="card p-6 max-w-3xl">
        <ProductForm categories={categories} />
      </div>
    </>
  );
}
