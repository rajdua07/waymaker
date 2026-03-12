import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSynthesis } from "@/lib/ai/synthesis";

export async function POST(
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
    include: { _count: { select: { positions: true } } },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the room creator can trigger synthesis" }, { status: 403 });
  }

  if (room.status !== "collecting" && room.status !== "converging") {
    return NextResponse.json({ error: "Room is not ready for synthesis" }, { status: 400 });
  }

  try {
    const result = await runSynthesis(roomId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Synthesis failed";
    // Reset status if synthesis failed
    await prisma.decisionRoom.update({
      where: { id: roomId },
      data: { status: "collecting" },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
