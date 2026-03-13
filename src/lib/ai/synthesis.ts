import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { buildSynthesisPrompt } from "./prompts";
import type { SynthesisResult, CriterionDef, DecisionType } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): string {
  // Try to find JSON object in the response
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  throw new Error("No JSON found in response");
}

export async function runSynthesis(roomId: string): Promise<SynthesisResult> {
  const room = await prisma.decisionRoom.findUnique({
    where: { id: roomId },
    include: {
      positions: {
        where: { roundNumber: { equals: undefined } }, // will be overridden below
        include: { user: { select: { id: true, name: true } } },
      },
      syntheses: {
        orderBy: { roundNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!room) throw new Error("Room not found");

  // Re-fetch positions for current round
  const positions = await prisma.position.findMany({
    where: { roomId, roundNumber: room.currentRound },
    include: { user: { select: { id: true, name: true } } },
  });

  if (positions.length < 2) {
    throw new Error("Need at least 2 positions to synthesize");
  }

  // Parse previous synthesis if exists
  let previousSynthesis: SynthesisResult | undefined;
  if (room.syntheses.length > 0) {
    const prev = room.syntheses[0];
    previousSynthesis = {
      consensusPoints: JSON.parse(prev.consensusPoints),
      conflicts: JSON.parse(prev.conflicts),
      argumentRankings: JSON.parse(prev.argumentRankings),
      recommendation: prev.recommendation,
      confidence: prev.confidence,
    };
  }

  const criteria = JSON.parse(room.criteria) as CriterionDef[];
  const decisionType = (room.decisionType || "custom") as DecisionType;

  // Load context documents
  const documents = await prisma.roomDocument.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });

  const prompt = buildSynthesisPrompt({
    title: room.title,
    description: room.description || "",
    decisionType,
    criteria,
    positions: positions.map((p) => ({
      userId: p.userId,
      userName: p.user.name || "Anonymous",
      content: p.content,
    })),
    roundNumber: room.currentRound,
    previousSynthesis,
    contextDocuments: documents.map((d) => ({ title: d.title, content: d.content })),
  });

  // Update room status to analyzing
  await prisma.decisionRoom.update({
    where: { id: roomId },
    data: { status: "analyzing" },
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawResponse =
    message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: SynthesisResult;
  try {
    parsed = JSON.parse(extractJSON(rawResponse));
  } catch {
    throw new Error(`Failed to parse AI response: ${rawResponse.slice(0, 200)}`);
  }

  // Store synthesis (upsert so re-runs overwrite previous)
  await prisma.synthesis.upsert({
    where: { roomId_roundNumber: { roomId, roundNumber: room.currentRound } },
    create: {
      roomId,
      roundNumber: room.currentRound,
      consensusPoints: JSON.stringify(parsed.consensusPoints),
      conflicts: JSON.stringify(parsed.conflicts),
      argumentRankings: JSON.stringify(parsed.argumentRankings),
      recommendation: parsed.recommendation,
      confidence: parsed.confidence,
      rawAiResponse: rawResponse,
    },
    update: {
      consensusPoints: JSON.stringify(parsed.consensusPoints),
      conflicts: JSON.stringify(parsed.conflicts),
      argumentRankings: JSON.stringify(parsed.argumentRankings),
      recommendation: parsed.recommendation,
      confidence: parsed.confidence,
      rawAiResponse: rawResponse,
    },
  });

  // Update room status to converging
  await prisma.decisionRoom.update({
    where: { id: roomId },
    data: { status: "converging" },
  });

  return parsed;
}
