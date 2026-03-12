import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { roomId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastUpdated = new Date(0);

      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const interval = setInterval(async () => {
        try {
          const room = await prisma.decisionRoom.findUnique({
            where: { id: roomId },
            select: {
              status: true,
              currentRound: true,
              updatedAt: true,
              _count: { select: { positions: true } },
            },
          });

          if (room && room.updatedAt > lastUpdated) {
            lastUpdated = room.updatedAt;
            sendEvent({
              status: room.status,
              currentRound: room.currentRound,
              positionCount: room._count.positions,
              updatedAt: room.updatedAt.toISOString(),
            });
          }
        } catch {
          clearInterval(interval);
        }
      }, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
