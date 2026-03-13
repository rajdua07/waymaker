import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRoomSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rooms = await prisma.decisionRoom.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { participants: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      _count: { select: { positions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createRoomSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  // Verify creator is a member of the team
  const creatorMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: parsed.data.teamId, userId: session.user.id } },
  });

  if (!creatorMembership) {
    return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });
  }

  // Verify all participant IDs are members of the team
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId: parsed.data.teamId },
    select: { userId: true },
  });
  const teamMemberIds = new Set(teamMembers.map((m) => m.userId));

  for (const userId of parsed.data.participantUserIds) {
    if (!teamMemberIds.has(userId)) {
      return NextResponse.json({ error: `User ${userId} is not a member of this team` }, { status: 400 });
    }
  }

  // Collect unique participant IDs (always include creator)
  const allParticipantIds = new Set([session.user.id, ...parsed.data.participantUserIds]);

  const room = await prisma.decisionRoom.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      teamId: parsed.data.teamId,
      creatorId: session.user.id,
      decisionType: parsed.data.decisionType,
      criteria: JSON.stringify(parsed.data.criteria),
      participants: {
        create: [...allParticipantIds].map((userId) => ({ userId })),
      },
    },
    include: {
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  });

  return NextResponse.json(room, { status: 201 });
}
