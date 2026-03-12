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
  collecting: "bg-gold/20 text-gold",
  analyzing: "bg-blue-accent/20 text-blue-accent",
  converging: "bg-teal/20 text-teal",
  decided: "bg-agree/20 text-agree",
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Decision Rooms</h1>
          <p className="text-sm text-slate-gray mt-1">Active rooms and recent decisions</p>
        </div>
        <Link
          href="/rooms/new"
          className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-light transition-colors"
        >
          New Room
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-white/[0.06] p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-lg font-semibold text-white mb-2">No Decision Rooms yet</h2>
          <p className="text-slate-gray text-sm mb-6">
            Create your first room to start making better decisions with your team.
          </p>
          <Link
            href="/rooms/new"
            className="inline-flex px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-light transition-colors"
          >
            Create Decision Room
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="bg-card rounded-xl border border-white/[0.06] p-5 hover:border-teal/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold text-sm group-hover:text-teal transition-colors line-clamp-2">
                  {room.title}
                </h3>
                <Badge className={`${statusColors[room.status] || "bg-muted text-muted-foreground"} text-[10px] font-semibold ml-2 shrink-0`}>
                  {room.status}
                </Badge>
              </div>

              {room.description && (
                <p className="text-slate-gray text-xs line-clamp-2 mb-4">{room.description}</p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                  {room.participants.slice(0, 4).map((p, i) => (
                    <Avatar key={p.user.id} className="h-6 w-6 border-2 border-card">
                      <AvatarFallback
                        className="text-[9px] font-semibold text-white"
                        style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] + "40" }}
                      >
                        {(p.user.name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {room.participants.length > 4 && (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] text-muted-foreground border-2 border-card">
                      +{room.participants.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-gray">
                  <span>Round {room.currentRound}</span>
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
