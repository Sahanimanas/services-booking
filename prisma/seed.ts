import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@globalservicemitra.in";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  // Admin user
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: Role.ADMIN },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin ready: ${adminEmail} / ${adminPassword}`);

  // Categories
  const categories = [
    { name: "AC Services", slug: "ac", icon: "snow" },
    { name: "RO & Water Purifier", slug: "ro", icon: "droplet" },
    { name: "Washing Machine", slug: "washing-machine", icon: "shirt" },
    { name: "Refrigerator", slug: "refrigerator", icon: "box" },
    { name: "Plumbing", slug: "plumbing", icon: "wrench" },
    { name: "Electrician", slug: "electrician", icon: "zap" },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
    catMap[c.slug] = row.id;
  }

  // Services
  const services = [
    {
      title: "Window AC Repair",
      slug: "window-ac-repair",
      description: "Expert window AC diagnosis and repair for all major brands.",
      priceCents: 29900,
      discountPct: 50,
      durationMin: 60,
      categoryId: catMap["ac"],
      imageUrl: "https://images.unsplash.com/photo-1631545806609-44f56f9b56b7?w=900",
    },
    {
      title: "Split AC Repair",
      slug: "split-ac-repair",
      description: "Comprehensive split AC repair including gas refill and PCB.",
      priceCents: 29900,
      discountPct: 50,
      durationMin: 75,
      categoryId: catMap["ac"],
      imageUrl: "https://images.unsplash.com/photo-1581275299888-536e0a4ee5c8?w=900",
    },
    {
      title: "AC Visit & Diagnosis",
      slug: "ac-visit-charge",
      description: "Technician visit to inspect your AC and provide a quote.",
      priceCents: 29900,
      discountPct: 0,
      durationMin: 30,
      categoryId: catMap["ac"],
    },
    {
      title: "Window AC Deep Cleaning",
      slug: "window-ac-cleaning",
      description: "Full strip-down deep clean for window AC.",
      priceCents: 39900,
      discountPct: 30,
      durationMin: 90,
      categoryId: catMap["ac"],
    },
    {
      title: "RO Repair",
      slug: "ro-repair",
      description: "Repair for all major RO water purifier brands.",
      priceCents: 29900,
      discountPct: 40,
      durationMin: 60,
      categoryId: catMap["ro"],
    },
    {
      title: "RO Filter & Spare Replacement",
      slug: "ro-filter-replacement",
      description: "Replace filters, membranes, and other RO spares.",
      priceCents: 29900,
      discountPct: 30,
      durationMin: 45,
      categoryId: catMap["ro"],
    },
    {
      title: "RO Annual Maintenance",
      slug: "ro-amc",
      description: "Annual maintenance service for your RO purifier.",
      priceCents: 29900,
      discountPct: 20,
      durationMin: 60,
      categoryId: catMap["ro"],
    },
    {
      title: "RO Uninstallation",
      slug: "ro-uninstall",
      description: "Safe uninstallation of your RO purifier.",
      priceCents: 39900,
      discountPct: 0,
      durationMin: 45,
      categoryId: catMap["ro"],
    },
    {
      title: "Washing Machine Repair",
      slug: "washing-machine-repair",
      description: "Repair for top-load, front-load and semi-automatic machines.",
      priceCents: 49900,
      discountPct: 50,
      durationMin: 75,
      categoryId: catMap["washing-machine"],
      imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=900",
    },
    {
      title: "Refrigerator Repair",
      slug: "refrigerator-repair",
      description: "Single-door, double-door and side-by-side refrigerator repair.",
      priceCents: 49900,
      discountPct: 50,
      durationMin: 90,
      categoryId: catMap["refrigerator"],
      imageUrl: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=900",
    },
    {
      title: "Refrigerator Spare Parts Replacement",
      slug: "refrigerator-spare-replacement",
      description: "Replace compressor, gasket, thermostat and other parts.",
      priceCents: 59900,
      discountPct: 50,
      durationMin: 90,
      categoryId: catMap["refrigerator"],
    },
    {
      title: "Tap & Pipe Leak Fix",
      slug: "plumbing-leak-fix",
      description: "Stop leaks and fix dripping taps quickly.",
      priceCents: 19900,
      discountPct: 20,
      durationMin: 45,
      categoryId: catMap["plumbing"],
    },
    {
      title: "Electrical Switch & Wiring",
      slug: "electrical-wiring",
      description: "Switchboard, wiring, and minor electrical repairs.",
      priceCents: 24900,
      discountPct: 20,
      durationMin: 60,
      categoryId: catMap["electrician"],
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  // Products
  const products = [
    {
      title: "AquaPure RO Membrane (75 GPD)",
      slug: "ro-membrane-75gpd",
      description: "High-performance RO membrane suitable for most domestic purifiers.",
      priceCents: 129900,
      discountPct: 15,
      stock: 50,
      categoryId: catMap["ro"],
    },
    {
      title: "Sediment Pre-Filter Set (3 pcs)",
      slug: "ro-sediment-filter",
      description: "Pack of 3 sediment pre-filters for RO purifiers.",
      priceCents: 49900,
      discountPct: 10,
      stock: 120,
      categoryId: catMap["ro"],
    },
    {
      title: "AC Capacitor 35 MFD",
      slug: "ac-capacitor-35",
      description: "Standard capacitor for window and split AC units.",
      priceCents: 29900,
      discountPct: 5,
      stock: 80,
      categoryId: catMap["ac"],
    },
    {
      title: "Washing Machine Drain Hose",
      slug: "wm-drain-hose",
      description: "Universal drain hose for washing machines.",
      priceCents: 24900,
      discountPct: 10,
      stock: 60,
      categoryId: catMap["washing-machine"],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // Localities
  const localities = [
    { name: "Kolkata - Salt Lake", city: "Kolkata", pincode: "700091" },
    { name: "Kolkata - New Town", city: "Kolkata", pincode: "700156" },
    { name: "Kolkata - Anandapur", city: "Kolkata", pincode: "700107" },
    { name: "Kolkata - Howrah", city: "Howrah", pincode: "711101" },
    { name: "Patna - Boring Road", city: "Patna", pincode: "800001" },
    { name: "Patna - Kankarbagh", city: "Patna", pincode: "800020" },
  ];

  for (const l of localities) {
    await prisma.locality.upsert({
      where: { name: l.name },
      update: l,
      create: l,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
