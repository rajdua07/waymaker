"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PARTICIPANT_COLORS } from "@/lib/constants";

interface Room {
  id: string;
  title: string;
  description: string | null;
  status: string;
  currentRound: number;
  createdAt: string;
  creator: { id: string; name: string | null };
  participants: Array<{ user: { id: string; name: string | null } }>;
  _count: { positions: number };
}

const statusColors: Record<string, string> = {
  collecting: "bg-gold/15 text-gold border-gold/20",
  analyzing: "bg-blue-accent/15 text-blue-accent border-blue-accent/20",
  converging: "bg-teal/15 text-teal border-teal/20",
  decided: "bg-agree/15 text-agree border-agree/20",
};

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then(setRooms)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Decision Rooms</h1>
          <p className="text-sm text-slate-gray mt-2">Active rooms and recent decisions</p>
        </div>
        <Link
          href="/rooms/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-teal to-teal/90 text-white text-sm font-semibold rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[var(--glow-teal-sm)] hover:from-teal-light hover:to-teal transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 4v16m8-8H4" />
          </svg>
          New Room
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] p-6 h-44">
              <div className="skeleton h-4 w-3/4 mb-4" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-2/3 mb-6" />
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="skeleton w-7 h-7 rounded-full" />
                  ))}
                </div>
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-teal/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No Decision Rooms yet</h2>
          <p className="text-slate-gray text-sm mb-8 max-w-sm mx-auto">
            Create your first room to start making better decisions with your team.
          </p>
          <Link
            href="/rooms/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-teal to-teal/90 text-white font-semibold rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[var(--glow-teal-sm)] transition-all duration-200 active:scale-[0.98]"
          >
            Create Decision Room
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="group bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-white/[0.10] hover:-translate-y-[1px] transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold text-sm group-hover:text-teal-light transition-colors line-clamp-2 pr-3">
                  {room.title}
                </h3>
                <Badge className={`${statusColors[room.status] || "bg-white/[0.05] text-white/80"} text-xs font-semibold ml-2 shrink-0`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {room.status}
                </Badge>
              </div>

              {room.description && (
                <p className="text-slate-gray text-sm line-clamp-2 mb-5">{room.description}</p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                  {room.participants.slice(0, 4).map((p, i) => (
                    <Avatar key={p.user.id} className="h-7 w-7 border-2 border-surface-0">
                      <AvatarFallback
                        className="text-[10px] font-semibold text-white"
                        style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] + "30" }}
                      >
                        {(p.user.name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {room.participants.length > 4 && (
                    <div className="h-7 w-7 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] text-slate-gray border-2 border-surface-0">
                      +{room.participants.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-gray">
                  <span>Round {room.currentRound}</span>
                  <span className="text-white/20">|</span>
                  <span>{room._count.positions} positions</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
