import { prisma } from "@/lib/db";
import ServiceForm from "../ServiceForm";

export default async function NewServicePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Add Service</h1>
      <div className="card p-6 max-w-3xl">
        <ServiceForm categories={categories} />
      </div>
    </>
  );
}
