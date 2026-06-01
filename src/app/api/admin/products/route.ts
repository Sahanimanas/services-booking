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

const nullableDate = z
  .union([z.string(), z.null()])
  .transform((v) => (typeof v === "string" && v.trim() === "" ? null : v))
  .nullable()
  .optional();

const Body = z.object({
  title: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  description: z.string().trim().min(1),
  priceRupees: z.number({ invalid_type_error: "Price must be a number" }).int().nonnegative(),
  discountPct: z.number({ invalid_type_error: "Discount must be a number" }).int().min(0).max(90),
  saleStartsAt: nullableDate,
  saleEndsAt: nullableDate,
  stock: z.number({ invalid_type_error: "Stock must be a number" }).int().min(0),
  imageUrl: nullableUrl,
  active: z.boolean(),
  categoryId: z.string().min(1, "Pick a category"),
});

const LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  description: "Description",
  priceRupees: "Price",
  discountPct: "Discount",
  saleStartsAt: "Sale start",
  saleEndsAt: "Sale end",
  stock: "Stock",
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

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { priceRupees, saleStartsAt, saleEndsAt, ...rest } = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        ...rest,
        priceCents: priceRupees * 100,
        saleStartsAt: saleStartsAt ? new Date(saleStartsAt) : null,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
      },
    });
    revalidateStorefront();
    return NextResponse.json({ ok: true, id: product.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
