"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SynthesisData } from "@/types";

interface Participant {
  userId: string;
  user: { id: string; name: string | null; email: string };
}

interface PositionInputProps {
  roomId: string;
  onSubmitted: () => void;
  isCreator?: boolean;
  participants?: Participant[];
  currentUserId?: string;
  currentRound: number;
  previousSynthesis?: SynthesisData | null;
}

export function PositionInput({
  roomId,
  onSubmitted,
  isCreator = false,
  participants = [],
  currentUserId,
  currentRound,
  previousSynthesis,
}: PositionInputProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showPrevContext, setShowPrevContext] = useState(true);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);

    const body: Record<string, string> = { content: content.trim() };
    if (isCreator && selectedUserId && selectedUserId !== currentUserId) {
      body.onBehalfOfUserId = selectedUserId;
    }

    const res = await fetch(`/api/rooms/${roomId}/positions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      setContent("");
      onSubmitted();
    }
  }

  const isOnBehalf = selectedUserId && selectedUserId !== currentUserId;

  const placeholder =
    isOnBehalf
      ? "Enter their updated position..."
      : currentRound === 1
      ? "Share your initial position on this topic..."
      : "How has your position evolved? Address conflicts raised, build on consensus...";

  return (
    <div className="border-t border-white/[0.06]">
      {/* Round context banner for round 2+ */}
      {currentRound > 1 && previousSynthesis && (
        <div className="px-3 pt-3">
          <button
            onClick={() => setShowPrevContext(!showPrevContext)}
            className="w-full text-left"
          >
            <div className="bg-gold/5 border border-gold/20 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gold uppercase tracking-wider">
                  Round {currentRound} — Refine your position
                </p>
                <span className="text-[10px] text-slate-gray">
                  {showPrevContext ? "▲" : "▼"}
                </span>
              </div>
              {showPrevContext && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    The AI found {previousSynthesis.consensusPoints.length} consensus point{previousSynthesis.consensusPoints.length !== 1 ? "s" : ""} and {previousSynthesis.conflicts.length} conflict{previousSynthesis.conflicts.length !== 1 ? "s" : ""} last round ({previousSynthesis.confidence}% confidence).
                  </p>
                  {previousSynthesis.conflicts.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-conflict/80">Open conflicts:</p>
                      {previousSynthesis.conflicts.map((c, i) => (
                        <p key={i} className="text-[10px] text-white/50 ml-2">
                          &bull; {c.description}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-white/40 italic">
                    Consider these in your updated position.
                  </p>
                </div>
              )}
            </div>
          </button>
        </div>
      )}

      <div className="p-3">
        {isCreator && participants.length > 0 && (
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-navy border border-white/10 text-white text-xs rounded-md px-2 py-1.5 mb-2 outline-none focus:border-teal/50"
          >
            <option value="">My position</option>
            {participants
              .filter((p) => p.userId !== currentUserId)
              .map((p) => (
                <option key={p.userId} value={p.userId}>
                  On behalf of: {p.user.name || p.user.email}
                </option>
              ))}
          </select>
        )}
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="bg-navy border-white/10 text-white text-xs placeholder:text-slate-gray resize-none mb-2"
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          size="sm"
          className="w-full bg-teal hover:bg-teal-light text-white text-xs font-semibold"
        >
          {loading
            ? "Submitting..."
            : isOnBehalf
            ? "Submit on Their Behalf"
            : currentRound === 1
            ? "Submit Position"
            : "Submit Revised Position"}
        </Button>
      </div>
    </div>
  );
}
