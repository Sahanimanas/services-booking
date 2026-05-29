import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveDiscountPct, effectiveUnitCents } from "@/lib/pricing";
import AddServiceToCart from "./AddServiceToCart";

export async function generateStaticParams() {
  const list = await prisma.service.findMany({ where: { active: true }, select: { slug: true } });
  return list.map((s) => ({ slug: s.slug }));
}

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = await prisma.service.findUnique({ where: { slug: params.slug } });
  if (!s) return { title: "Service not found" };
  return {
    title: s.title,
    description: s.description,
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!service) notFound();

  const pct = effectiveDiscountPct(service);
  const finalCents = effectiveUnitCents(service);

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 grid lg:grid-cols-2 gap-10">
      <div>
        <Link href="/services" className="text-slate-700 text-sm hover:underline">
          ← Back to services
        </Link>
        <div className="mt-4 card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.imageUrl ?? "https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?w=1200"}
            alt={service.title}
            className="aspect-video w-full object-cover"
          />
        </div>
        <div className="mt-6">
          <div className="text-sm text-slate-500 font-semibold uppercase">
            {service.category.name}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">{service.title}</h1>
          <p className="mt-3 text-ink-900/70">{service.description}</p>
          <div className="mt-5 flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-extrabold">{rupees(finalCents)}</span>
            {pct > 0 && (
              <>
                <span className="text-lg text-ink-900/40 line-through">
                  {rupees(service.priceCents)}
                </span>
                <span className="text-accent-600 font-semibold">{pct}% OFF</span>
              </>
            )}
            {pct > 0 && service.saleEndsAt && (
              <span className="text-xs text-slate-700 bg-slate-100 rounded-full px-2 py-0.5">
                Sale ends {new Date(service.saleEndsAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Info icon="⏱" label="Duration" value={`${service.durationMin} min`} />
            <Info icon="🛡" label="Warranty" value="30-day service" />
            <Info icon="✅" label="Verified Pros" value="Background-checked" />
            <Info icon="📅" label="Availability" value="Same-day slots" />
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-2xl p-6 sticky top-24 bg-blue-50 border border-blue-200 shadow-md shadow-blue-900/5">
          <h2 className="text-xl font-bold mb-1 text-blue-900">Add to cart</h2>
          <p className="text-sm text-blue-900/70 mb-4">
            No sign-in needed — you'll log in only when you checkout.
          </p>
          <AddServiceToCart
            service={{
              id: service.id,
              slug: service.slug,
              title: service.title,
              imageUrl: service.imageUrl,
              unitCents: finalCents,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-ink-900/50">
        {icon} {label}
      </div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
