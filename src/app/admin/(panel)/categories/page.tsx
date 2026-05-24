import { prisma } from "@/lib/db";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { services: true, products: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <CategoryManager initial={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? "",
        services: c._count.services,
        products: c._count.products,
      }))} />
    </>
  );
}
