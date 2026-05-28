import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export async function GET() {
  const localities = await prisma.locality.findMany({
    where: { active: true },
    orderBy: [{ city: "asc" }, { name: "asc" }],
    select: { id: true, name: true, city: true, pincode: true },
  });
  return NextResponse.json({ localities });
}
