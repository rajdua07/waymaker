"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PositionWithUser } from "@/types";
import { cn } from "@/lib/utils";

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
    </button>
  );
}
