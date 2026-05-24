import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ServiceForm from "../ServiceForm";
import AvailabilityEditor from "./AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const [service, categories, availabilities] = await Promise.all([
    prisma.service.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.serviceAvailability.findMany({
      where: { serviceId: params.id },
      orderBy: { date: "asc" },
    }),
  ]);
  if (!service) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit Service · {service.title}</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Details</h2>
          <ServiceForm categories={categories} service={service} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-1">Availability dates & slots</h2>
          <p className="text-sm text-ink-900/60 mb-4">
            Set the dates this service can be booked on, with time slots and capacity.
          </p>
          <AvailabilityEditor
            serviceId={service.id}
            initial={availabilities.map((a) => ({
              id: a.id,
              date: a.date.toISOString().slice(0, 10),
              slots: a.slots,
              capacity: a.capacity,
            }))}
          />
        </div>
      </div>
    </>
  );
}
