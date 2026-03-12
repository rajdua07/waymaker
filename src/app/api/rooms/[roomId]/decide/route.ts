import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lockDecisionSchema } from "@/lib/validators";

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
  const parsed = lockDecisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const room = await prisma.decisionRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the room creator can lock a decision" }, { status: 403 });
  }

  const decision = await prisma.decision.create({
    data: {
      roomId,
      finalRecommendation: parsed.data.finalRecommendation,
      acceptances: {
        create: { userId: session.user.id },
      },
    },
  });

  await prisma.decisionRoom.update({
    where: { id: roomId },
    data: { status: "decided" },
  });

  return NextResponse.json(decision, { status: 201 });
}
