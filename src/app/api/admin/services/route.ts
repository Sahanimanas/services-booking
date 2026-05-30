import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

// Coerce common form-field shapes (NaN from empty number inputs, empty-string urls)
// into something Zod can validate or treat as missing, so we surface a *useful*
// error instead of a generic "Invalid input" when the admin leaves a field blank.
const nullableUrl = z
  .union([z.string().url(), z.literal(""), z.null()])
  .transform((v) => (v ? v : null))
  .nullable()
  .optional();

const Body = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  description: z.string().trim().min(1),
  priceRupees: z.number({ invalid_type_error: "Price must be a number" }).int().nonnegative(),
  discountPct: z.number({ invalid_type_error: "Discount must be a number" }).int().min(0).max(90),
  saleStartsAt: z.string().nullable().optional(),
  saleEndsAt: z.string().nullable().optional(),
  durationMin: z.number({ invalid_type_error: "Duration must be a number" }).int().min(5),
  imageUrl: nullableUrl,
  active: z.boolean(),
  categoryId: z.string().min(1, "Pick a category"),
});

// Friendly field labels used in the error response.
const LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  description: "Description",
  priceRupees: "Price",
  discountPct: "Discount",
  saleStartsAt: "Sale start",
  saleEndsAt: "Sale end",
  durationMin: "Duration",
  imageUrl: "Image",
  active: "Active",
  categoryId: "Category",
};

function formatZodError(err: z.ZodError): string {
  const issue = err.issues[0];
  const field = issue.path[0] as string | undefined;
  const label = field ? LABELS[field] ?? field : "Form";
  return `${label}: ${issue.message}`;
}

export async function GET() {
  await requireAdmin();
  const services = await prisma.service.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { priceRupees, saleStartsAt, saleEndsAt, ...rest } = parsed.data;
  try {
    const service = await prisma.service.create({
      data: {
        ...rest,
        priceCents: priceRupees * 100,
        saleStartsAt: saleStartsAt ? new Date(saleStartsAt) : null,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
      },
    });
    revalidateStorefront();
    return NextResponse.json({ ok: true, id: service.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
