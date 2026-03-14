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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Decision Log</h1>
          <p className="text-sm text-slate-gray mt-2">Searchable history of all decisions</p>
        </div>
      </div>

      <Input
        placeholder="Search decisions..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-6 max-w-md"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] p-5 h-24">
              <div className="skeleton h-4 w-1/2 mb-3" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-slate-gray text-sm">No decisions found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {decisions.map((d) => (
              <Link
                key={d.id}
                href={`/rooms/${d.room.id}`}
                className="block bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-white/[0.10] hover:-translate-y-[1px] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-teal-light transition-colors">{d.room.title}</h3>
                  <Badge className="bg-agree/15 text-agree border-agree/20 text-xs shrink-0 ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Decided
                  </Badge>
                </div>
                <p className="text-sm text-white/70 line-clamp-2 mb-3">
                  {d.finalRecommendation}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-gray">
                  <span>{new Date(d.decisionDate).toLocaleDateString()}</span>
                  <span className="text-white/20">|</span>
                  <span>{d.room.participants.length} participants</span>
                  <span className="text-white/20">|</span>
                  <span>{d.acceptances.length} accepted</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
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
