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

  // Find or create users for each participant email
  const participantUsers = await Promise.all(
    parsed.data.participantEmails.map(async (email) => {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, name: email.split("@")[0] },
        });
      }
      return user;
    })
  );

  const room = await prisma.decisionRoom.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      teamId: parsed.data.teamId,
      creatorId: session.user.id,
      decisionType: parsed.data.decisionType,
      criteria: JSON.stringify(parsed.data.criteria),
      participants: {
        create: [
          // Include the creator as a participant
          { userId: session.user.id },
          // Include invited participants (skip if creator is also in the list)
          ...participantUsers
            .filter((u) => u.id !== session.user.id)
            .map((u) => ({ userId: u.id })),
        ],
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
