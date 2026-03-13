"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PositionWithUser } from "@/types";
import { cn } from "@/lib/utils";

function blobProxy(url: string) {
  return `/api/blob?url=${encodeURIComponent(url)}`;
}

interface PositionCardProps {
  position: PositionWithUser;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

export function PositionCard({ position, color, isSelected, onClick }: PositionCardProps) {
  const initials = position.user.name
    ? position.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-navy-light border rounded-lg p-3 transition-all",
        isSelected
          ? "border-teal/50 bg-teal/5"
          : "border-white/[0.06] hover:border-white/[0.12]"
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback
            className="text-[10px] font-semibold text-white"
            style={{ backgroundColor: color + "30" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs font-semibold text-white leading-tight">
            {position.user.name || position.user.email}
          </p>
          <p className="text-[10px] text-slate-gray">
            Round {position.roundNumber}
          </p>
        </div>
      </div>
      <p className="text-xs text-white/80 line-clamp-4 leading-relaxed">
        {position.content}
      </p>

      {/* Attachment thumbnails */}
      {position.attachments && position.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {position.attachments.map((att) =>
            att.contentType.startsWith("image/") ? (
              <a
                key={att.id}
                href={blobProxy(att.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block w-12 h-12 rounded overflow-hidden border border-white/10 hover:border-teal/40 transition-colors"
              >
                <img
                  src={blobProxy(att.url)}
                  alt={att.filename}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <a
                key={att.id}
                href={blobProxy(att.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 hover:border-teal/40 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-slate-gray shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-[9px] text-slate-gray truncate max-w-[60px]">
                  {att.filename}
                </span>
              </a>
            )
          )}
        </div>
      )}
    </button>
  );
}
