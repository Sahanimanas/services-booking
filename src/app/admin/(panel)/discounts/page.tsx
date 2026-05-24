import { prisma } from "@/lib/db";
import BulkDiscountForm from "./BulkDiscountForm";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Bulk Discounts & Sales</h1>
      <p className="text-sm text-ink-900/60 mb-6">
        Apply a discount (and optional sale window) to many services or products at once.
      </p>
      <BulkDiscountForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
      />
    </>
  );
}
