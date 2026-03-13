import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitPositionSchema } from "@/lib/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  const { searchParams } = new URL(req.url);
  const round = searchParams.get("round");

  const positions = await prisma.position.findMany({
    where: {
      roomId,
      ...(round ? { roundNumber: parseInt(round) } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(positions);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  const body = await req.json();
  const parsed = submitPositionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const room = await prisma.decisionRoom.findUnique({
    where: { id: roomId },
    include: { participants: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.status !== "collecting" && room.status !== "converging") {
    return NextResponse.json({ error: "Room is not accepting positions" }, { status: 400 });
  }

  const isParticipant = room.participants.some((p) => p.userId === session.user.id);
  const isCreator = room.creatorId === session.user.id;

  if (!isParticipant && !isCreator) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Allow the room creator to submit positions on behalf of other participants
  let targetUserId = session.user.id;
  if (parsed.data.onBehalfOfUserId) {
    if (!isCreator) {
      return NextResponse.json({ error: "Only the room creator can submit on behalf of others" }, { status: 403 });
    }
    const targetIsParticipant = room.participants.some((p) => p.userId === parsed.data.onBehalfOfUserId);
    if (!targetIsParticipant) {
      return NextResponse.json({ error: "Target user is not a participant" }, { status: 400 });
    }
    targetUserId = parsed.data.onBehalfOfUserId;
  }

  const position = await prisma.position.create({
    data: {
      roomId,
      userId: targetUserId,
      roundNumber: room.currentRound,
      content: parsed.data.content,
      ...(parsed.data.attachments && parsed.data.attachments.length > 0
        ? {
            attachments: {
              create: parsed.data.attachments.map((a) => ({
                url: a.url,
                filename: a.filename,
                contentType: a.contentType,
                size: a.size,
              })),
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      attachments: true,
    },
  });

  // Touch room updatedAt so SSE picks up the change
  await prisma.decisionRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(position, { status: 201 });
}
