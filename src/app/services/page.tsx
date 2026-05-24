import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveDiscountPct, effectiveUnitCents } from "@/lib/pricing";
import AddProductButton from "@/components/cart/AddProductButton";

export const metadata = {
  title: "Services & Products",
  description:
    "Browse all home services and products — AC, RO, washing machine, refrigerator, plumbing and more.",
};

export const revalidate = 60;

type SP = { [k: string]: string | string[] | undefined };

export default async function ServicesPage({ searchParams }: { searchParams: SP }) {
  const tab = (searchParams.tab as string) ?? "services";
  const catSlug = (searchParams.cat as string) ?? "all";
  const q = ((searchParams.q as string) ?? "").trim();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const services =
    tab === "services"
      ? await prisma.service.findMany({
          where: {
            active: true,
            ...(catSlug !== "all" && { category: { slug: catSlug } }),
            ...(q && {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }),
          },
          include: { category: true },
          orderBy: { title: "asc" },
        })
      : [];

  const products =
    tab === "products"
      ? await prisma.product.findMany({
          where: {
            active: true,
            ...(catSlug !== "all" && { category: { slug: catSlug } }),
            ...(q && { title: { contains: q, mode: "insensitive" } }),
          },
          include: { category: true },
          orderBy: { title: "asc" },
        })
      : [];

  return (
    <>
      {/* Hero strip */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Services &amp;{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-slate-600 mt-2 text-sm">
            <Link href="/" className="hover:underline">
              Home
            </Link>{" "}
            · Services &amp; Products
          </p>

          {/* Search */}
          <form action="/services" className="mt-6 max-w-2xl mx-auto">
            <input type="hidden" name="tab" value={tab} />
            <input type="hidden" name="cat" value={catSlug} />
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder={`Search ${tab}...`}
                className="w-full rounded-full px-6 py-4 pr-32 bg-white border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70 transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 btn-primary px-6 py-2.5"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link
            href={`/services?tab=services&cat=${catSlug}`}
            className={tab === "services" ? "chip-on" : "chip-off"}
          >
            🛠 Services
          </Link>
          <Link
            href={`/services?tab=products&cat=${catSlug}`}
            className={tab === "products" ? "chip-on" : "chip-off"}
          >
            🛍 Products
          </Link>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <Link
            href={`/services?tab=${tab}&cat=all`}
            className={catSlug === "all" ? "chip-on" : "chip-off"}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/services?tab=${tab}&cat=${c.slug}`}
              className={catSlug === c.slug ? "chip-on" : "chip-off"}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Listing */}
        {tab === "services" ? (
          <ServiceGrid services={services} />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </>
  );
}

function ServiceGrid({ services }: { services: any[] }) {
  if (services.length === 0) {
    return <EmptyState label="No services found." />;
  }
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Browse All Services - A to Z</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((s) => {
          const pct = effectiveDiscountPct(s);
          const unitCents = effectiveUnitCents(s);
          return (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="card-interactive group"
            >
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.imageUrl ?? "https://images.unsplash.com/photo-1631545806609-44f56f9b56b7?w=900"}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover zoom-on-hover"
                />
                {pct > 0 && (
                  <span className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pct}% OFF
                  </span>
                )}
                {s.saleEndsAt && pct > 0 && (
                  <span className="absolute top-3 right-3 bg-brand-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Ends {new Date(s.saleEndsAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs text-brand-600 font-semibold uppercase tracking-wide">
                  {s.category.name}
                </div>
                <div className="font-bold mt-1 group-hover:text-brand-700 line-clamp-1">
                  {s.title}
                </div>
                <p className="text-sm text-ink-900/60 mt-1 line-clamp-2">{s.description}</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-lg font-bold">{rupees(unitCents)}</span>
                  {pct > 0 && (
                    <span className="text-xs text-ink-900/40 line-through">
                      {rupees(s.priceCents)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function ProductGrid({ products }: { products: any[] }) {
  if (products.length === 0) {
    return <EmptyState label="No products found." />;
  }
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Shop All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => {
          const pct = effectiveDiscountPct(p);
          const unitCents = effectiveUnitCents(p);
          return (
            <div key={p.id} className="card-interactive group flex flex-col">
              <div className="relative aspect-square bg-brand-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl ?? "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=600"}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover zoom-on-hover"
                />
                {pct > 0 && (
                  <span className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pct}% OFF
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs text-brand-600 font-semibold uppercase tracking-wide">
                  {p.category.name}
                </div>
                <div className="font-bold mt-1 line-clamp-1">{p.title}</div>
                <p className="text-sm text-ink-900/60 mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-lg font-bold">{rupees(unitCents)}</span>
                  {pct > 0 && (
                    <span className="text-xs text-ink-900/40 line-through">
                      {rupees(p.priceCents)}
                    </span>
                  )}
                </div>
                <div className="text-xs mt-2 text-ink-900/50">
                  {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                </div>
                <div className="mt-auto">
                  <AddProductButton
                    product={{
                      id: p.id,
                      slug: p.slug,
                      title: p.title,
                      imageUrl: p.imageUrl,
                      unitCents,
                    }}
                    outOfStock={p.stock <= 0}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-3">🔎</div>
      <p className="text-ink-900/60">{label}</p>
    </div>
  );
}
