import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;   // ✅ FIX for Next.js 20+

  if (!code) {
    console.error("Missing code param");
    return new NextResponse("Bad Request", { status: 400 });
  }

  const link = await prisma.links.findUnique({
    where: { code },
  });

  if (!link) {
    return new NextResponse("Not found", { status: 404 });
  }

  await prisma.links.update({
    where: { code },
    data: {
      clicks: (link.clicks ?? 0) + 1,
      last_clicked: new Date(),
    },
  });

  return NextResponse.redirect(link.url, 302);
}
