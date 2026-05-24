import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductForm from "../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit Product · {product.title}</h1>
      <div className="card p-6 max-w-3xl">
        <ProductForm categories={categories} product={product} />
      </div>
    </>
  );
}
