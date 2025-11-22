import prisma from "@/lib/prisma";

// GET → Return all links
export async function GET() {
  try {
    const links = await prisma.links.findMany({
      orderBy: { created_at: "desc" },
    });

    return Response.json(links);
  } catch (error) {
    console.error("GET /api/links error:", error);
    return Response.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST → Create a new short link
export async function POST(req: Request) {
  const { url, code } = await req.json();

  if (!url || !code) {
    return Response.json(
      { error: "URL and code are required" },
      { status: 400 }
    );
  }

  // Check if code already exists
  const exists = await prisma.links.findUnique({ where: { code } });

  if (exists) {
    return Response.json(
      { error: "Code already exists. Choose another." },
      { status: 409 }
    );
  }

  const newLink = await prisma.links.create({
    data: { code, url },
  });

  return Response.json(newLink);
}

