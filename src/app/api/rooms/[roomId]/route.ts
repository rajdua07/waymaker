import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRoomSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;

  const room = await prisma.decisionRoom.findUnique({
    where: { id: roomId },
    include: {
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      positions: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      syntheses: { orderBy: { roundNumber: "asc" } },
      decision: {
        include: {
          acceptances: {
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          },
        },
      },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Parse JSON fields
  const response = {
    ...room,
    criteria: JSON.parse(room.criteria),
    syntheses: room.syntheses.map((s) => ({
      ...s,
      consensusPoints: JSON.parse(s.consensusPoints),
      conflicts: JSON.parse(s.conflicts),
      argumentRankings: JSON.parse(s.argumentRankings),
    })),
  };

  return NextResponse.json(response);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  const body = await req.json();
  const parsed = updateRoomSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const room = await prisma.decisionRoom.findUnique({ where: { id: roomId } });
  if (!room || room.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const updated = await prisma.decisionRoom.update({
    where: { id: roomId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
