"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DecisionItem {
  id: string;
  finalRecommendation: string;
  decisionDate: string;
  room: {
    id: string;
    title: string;
    participants: Array<{ user: { name: string | null } }>;
  };
  acceptances: Array<{ user: { name: string | null } }>;
}

export default function DecisionLogPage() {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/decisions?page=${page}&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => {
        setDecisions(data.decisions);
        setTotalPages(data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Decision Log</h1>
          <p className="text-sm text-slate-gray mt-1">Searchable history of all decisions</p>
        </div>
      </div>

      <Input
        placeholder="Search decisions..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="bg-navy-light border-white/10 text-white placeholder:text-slate-gray mb-6 max-w-md"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-white/[0.06] p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-gray text-sm">No decisions found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {decisions.map((d) => (
              <Link
                key={d.id}
                href={`/rooms/${d.room.id}`}
                className="block bg-card rounded-lg border border-white/[0.06] p-4 hover:border-teal/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{d.room.title}</h3>
                  <Badge className="bg-agree/20 text-agree text-[10px] shrink-0 ml-2">
                    Decided
                  </Badge>
                </div>
                <p className="text-xs text-white/70 line-clamp-2 mb-2">
                  {d.finalRecommendation}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-slate-gray">
                  <span>{new Date(d.decisionDate).toLocaleDateString()}</span>
                  <span>{d.room.participants.length} participants</span>
                  <span>{d.acceptances.length} accepted</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="bg-navy-light border border-white/10 text-white text-xs h-8 hover:bg-white/5"
              >
                Previous
              </Button>
              <span className="text-xs text-slate-gray">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-navy-light border border-white/10 text-white text-xs h-8 hover:bg-white/5"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
