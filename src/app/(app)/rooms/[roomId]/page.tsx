"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArenaGraph } from "@/components/room/arena-graph";
import { AnalysisPanel } from "@/components/room/analysis-panel";
import { PositionCard } from "@/components/room/position-card";
import { PositionInput } from "@/components/room/position-input";
import { ContextDocuments } from "@/components/room/context-documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoomEvents } from "@/hooks/use-room-events";
import { PARTICIPANT_COLORS } from "@/lib/constants";
import type { RoomWithDetails, ArenaNode, ArenaEdge, SynthesisData } from "@/types";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getNodePositions(count: number): Array<{ x: number; y: number }> {
  const cx = 300;
  const cy = 300;
  const radius = count <= 4 ? 180 : count <= 6 ? 160 : 140;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

function buildEdges(synthesis: SynthesisData | null, participants: Array<{ id: string }>): ArenaEdge[] {
  if (!synthesis) return participants.map((p) => ({ from: p.id, to: "center", type: "partial" as const }));

  const edges: ArenaEdge[] = [];

  // Edges from each participant to center
  synthesis.argumentRankings.forEach((arg) => {
    const type = arg.score >= 7 ? "agree" : arg.score <= 4 ? "conflict" : "partial";
    edges.push({ from: arg.userId, to: "center", type, label: `${arg.score}` });
  });

  // Cross-participant edges from conflicts
  synthesis.conflicts.forEach((conflict) => {
    // Find user IDs for conflict participants
    const conflictUserIds = synthesis.argumentRankings
      .filter((r) => conflict.participants.includes(r.userName))
      .map((r) => r.userId);

    for (let i = 0; i < conflictUserIds.length; i++) {
      for (let j = i + 1; j < conflictUserIds.length; j++) {
        edges.push({ from: conflictUserIds[i], to: conflictUserIds[j], type: "conflict" });
      }
    }
  });

  return edges;
}

const statusColors: Record<string, string> = {
  collecting: "bg-gold/15 text-gold border-gold/20",
  analyzing: "bg-blue-accent/15 text-blue-accent border-blue-accent/20",
  converging: "bg-teal/15 text-teal border-teal/20",
  decided: "bg-agree/15 text-agree border-agree/20",
};

export default function DecisionRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: session } = useSession();
  const [room, setRoom] = useState<RoomWithDetails | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingRound, setViewingRound] = useState<number | null>(null);

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      setRoom(data);
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Real-time updates via SSE
  useRoomEvents(roomId, () => {
    fetchRoom();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-gray">Room not found</p>
      </div>
    );
  }

  const displayRound = viewingRound ?? room.currentRound;
  const isViewingCurrent = displayRound === room.currentRound;

  const currentSynthesis = room.syntheses.find((s) => s.roundNumber === room.currentRound) || null;
  const displaySynthesis = room.syntheses.find((s) => s.roundNumber === displayRound) || null;
  const previousSynthesis = room.syntheses.find((s) => s.roundNumber === room.currentRound - 1) || null;
  const currentPositions = room.positions.filter((p) => p.roundNumber === room.currentRound);
  const displayPositions = room.positions.filter((p) => p.roundNumber === displayRound);
  const isCreator = session?.user?.id === room.creatorId;
  const canSynthesize = isCreator && (room.status === "collecting" || room.status === "converging") && currentPositions.length >= 2;
  const canDecide = isCreator && room.status === "converging" && currentSynthesis;

  // Build arena data
  const positions = getNodePositions(room.participants.length);
  const participantColorMap = new Map<string, string>();
  room.participants.forEach((p, i) => {
    participantColorMap.set(p.userId, PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length]);
  });

  const arenaNodes: ArenaNode[] = room.participants.map((p, i) => {
    const ranking = displaySynthesis?.argumentRankings.find((r) => r.userId === p.userId);
    return {
      id: p.userId,
      name: p.user.name || p.user.email,
      initials: getInitials(p.user.name),
      color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
      score: ranking?.score || null,
      x: positions[i].x,
      y: positions[i].y,
    };
  });

  const arenaEdges = buildEdges(
    displaySynthesis,
    room.participants.map((p) => ({ id: p.userId }))
  );

  async function handleSynthesize() {
    setSynthesizing(true);
    await fetch(`/api/rooms/${roomId}/synthesize`, { method: "POST" });
    await fetchRoom();
    setSynthesizing(false);
  }

  async function handleDecide() {
    if (!currentSynthesis) return;
    await fetch(`/api/rooms/${roomId}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalRecommendation: currentSynthesis.recommendation }),
    });
    await fetchRoom();
  }

  async function handleNewRound() {
    await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "collecting",
        currentRound: room!.currentRound + 1,
      }),
    });
    await fetchRoom();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Room Header */}
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-white">{room.title}</h1>
          <p className="text-xs text-slate-gray mt-1">
            {room.participants.length} participants &middot; Round {room.currentRound}
            {room.currentRound > 1 && (
              <span className="text-white/30"> &middot; Iterating toward consensus</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[room.status] || ""} text-xs font-semibold`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {room.status}
          </Badge>
          {canSynthesize && (
            <Button
              onClick={handleSynthesize}
              disabled={synthesizing}
              size="sm"
            >
              {synthesizing ? "Analyzing..." : "Run Synthesis"}
            </Button>
          )}
          {canDecide && (
            <>
              <div className="group relative">
                <Button
                  onClick={handleNewRound}
                  size="sm"
                  variant="secondary"
                  className="border-gold/30 text-gold hover:bg-gold/5"
                >
                  Refine → Round {room.currentRound + 1}
                </Button>
                <div className="absolute top-full right-0 mt-1 w-56 bg-surface-2 border border-white/[0.08] rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-[var(--shadow-elevated)]">
                  <p className="text-xs text-white font-semibold mb-1">Start a refinement round</p>
                  <p className="text-xs text-slate-gray leading-relaxed">
                    Participants can revise their positions based on the synthesis. The AI will re-analyze and track how opinions evolve toward consensus.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDecide}
                size="sm"
                className="bg-agree hover:bg-agree/80 text-white"
              >
                Accept &amp; Log Decision
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 grid grid-cols-[320px_1fr_340px] overflow-hidden">
        {/* Left: Positions */}
        <div className="border-r border-white/[0.04] flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-gray uppercase tracking-[2px]">
                Positions ({displayPositions.length})
              </h2>
              {!isViewingCurrent && (
                <button
                  onClick={() => setViewingRound(null)}
                  className="text-xs text-teal hover:text-teal-light font-medium transition-colors"
                >
                  ← Current
                </button>
              )}
            </div>
            {/* Round tabs */}
            {room.currentRound > 1 && (
              <div className="flex gap-1">
                {Array.from({ length: room.currentRound }, (_, i) => i + 1).map((r) => (
                  <button
                    key={r}
                    onClick={() => setViewingRound(r === room.currentRound ? null : r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      displayRound === r
                        ? "bg-teal/15 text-teal border border-teal/20"
                        : "bg-white/[0.04] text-slate-gray hover:text-white hover:bg-white/[0.08] border border-transparent"
                    }`}
                  >
                    R{r}
                    {r === room.currentRound && " ●"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Viewing past round banner */}
          {!isViewingCurrent && (
            <div className="px-4 py-2.5 bg-gold/5 border-b border-gold/15">
              <p className="text-xs text-gold font-medium">
                Viewing Round {displayRound} (historical)
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
            {displayPositions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                color={participantColorMap.get(pos.userId) || "#94A3B8"}
                isSelected={selectedParticipantId === pos.userId}
                onClick={() => setSelectedParticipantId(pos.userId === selectedParticipantId ? null : pos.userId)}
              />
            ))}
            {displayPositions.length === 0 && (
              <p className="text-xs text-slate-gray text-center py-8">
                No positions submitted for this round.
              </p>
            )}
          </div>
          {isViewingCurrent && (room.status === "collecting" || room.status === "converging") && (
            <PositionInput
              roomId={roomId}
              onSubmitted={fetchRoom}
              isCreator={isCreator}
              participants={room.participants}
              currentUserId={session?.user?.id}
              currentRound={room.currentRound}
              previousSynthesis={previousSynthesis}
            />
          )}
        </div>

        {/* Center: Arena Graph */}
        <div className="flex items-center justify-center p-6 overflow-hidden">
          <div className="w-full max-w-[600px] aspect-square relative">
            <div className="absolute inset-0 rounded-2xl bg-white/[0.01] border border-white/[0.04]" />
            <ArenaGraph
              nodes={arenaNodes}
              edges={arenaEdges}
              selectedId={selectedParticipantId}
              onSelectNode={(id) =>
                setSelectedParticipantId(id === selectedParticipantId ? null : id)
              }
              confidence={displaySynthesis?.confidence || null}
            />
          </div>
        </div>

        {/* Right: Analysis + Context Panel */}
        <div className="border-l border-white/[0.04] overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
            <h2 className="text-xs font-bold text-slate-gray uppercase tracking-[2px]">
              Analysis
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4">
              <ContextDocuments
                roomId={roomId}
                documents={room.documents}
                isCreator={isCreator}
                onUpdated={fetchRoom}
              />
            </div>
            <div className="border-t border-white/[0.04]">
              <AnalysisPanel
                status={isViewingCurrent ? room.status : "converging"}
                synthesis={displaySynthesis}
                isLoading={isViewingCurrent && (synthesizing || room.status === "analyzing")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
