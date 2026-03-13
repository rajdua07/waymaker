"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SynthesisData, PositionAttachment } from "@/types";

function blobProxy(url: string) {
  return `/api/blob?url=${encodeURIComponent(url)}`;
}

interface Participant {
  userId: string;
  user: { id: string; name: string | null; email: string };
}

interface UploadedFile {
  url: string;
  filename: string;
  contentType: string;
  size: number;
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
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      if (attachments.length >= 5) break;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const uploaded: UploadedFile = await res.json();
          setAttachments((prev) => [...prev, uploaded]);
        }
      } catch {
        // silently skip failed uploads
      }
    }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  }

  function isImage(contentType: string) {
    return contentType.startsWith("image/");
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);

    const body: Record<string, unknown> = { content: content.trim() };
    if (isCreator && selectedUserId && selectedUserId !== currentUserId) {
      body.onBehalfOfUserId = selectedUserId;
    }
    if (attachments.length > 0) {
      body.attachments = attachments;
    }

    const res = await fetch(`/api/rooms/${roomId}/positions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      setContent("");
      setAttachments([]);
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
                  {showPrevContext ? "\u25B2" : "\u25BC"}
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

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att) => (
              <div
                key={att.url}
                className="relative group bg-white/5 border border-white/10 rounded-md overflow-hidden"
              >
                {isImage(att.contentType) ? (
                  <img
                    src={blobProxy(att.url)}
                    alt={att.filename}
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 flex flex-col items-center justify-center px-1">
                    <svg className="w-5 h-5 text-slate-gray mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-[8px] text-slate-gray truncate w-full text-center">
                      {att.filename.length > 12 ? att.filename.slice(0, 9) + "..." : att.filename}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.url)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || attachments.length >= 5}
            size="sm"
            variant="secondary"
            className="bg-navy-light border border-white/10 text-slate-gray hover:text-white hover:bg-white/5 text-xs shrink-0"
          >
            {uploading ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border border-slate-gray/30 border-t-slate-gray rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
                Attach
              </span>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            size="sm"
            className="flex-1 bg-teal hover:bg-teal-light text-white text-xs font-semibold"
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
    </div>
  );
}
