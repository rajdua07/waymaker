import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    room: {
      OR: [
        { creatorId: session.user.id },
        { participants: { some: { userId: session.user.id } } },
      ],
      ...(search ? { title: { contains: search } } : {}),
    },
  };

  const [decisions, total] = await Promise.all([
    prisma.decision.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            title: true,
            criteria: true,
            participants: {
              include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            },
          },
        },
        acceptances: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { decisionDate: "desc" },
      take: limit,
      skip,
    }),
    prisma.decision.count({ where }),
  ]);

  return NextResponse.json({
    decisions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
