"use client";

import type { SynthesisData } from "@/types";
import { Badge } from "@/components/ui/badge";

interface AnalysisPanelProps {
  status: string;
  synthesis: SynthesisData | null;
  isLoading: boolean;
}

const phases = [
  { key: "collecting", label: "Inputs Collected", description: "Participants submit their positions" },
  { key: "analyzing", label: "Research Complete", description: "AI is analyzing all inputs" },
  { key: "converging", label: "Scoring Arguments", description: "Arguments ranked by evidence" },
  { key: "decided", label: "Recommendation Ready", description: "Decision logged and tracked" },
];

function getPhaseState(currentStatus: string, phaseKey: string) {
  const order = ["collecting", "analyzing", "converging", "decided"];
  const currentIdx = order.indexOf(currentStatus);
  const phaseIdx = order.indexOf(phaseKey);
  if (phaseIdx < currentIdx) return "done";
  if (phaseIdx === currentIdx) return "active";
  return "future";
}

export function AnalysisPanel({ status, synthesis, isLoading }: AnalysisPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Phase Tracker */}
      <div>
        <h3 className="text-xs font-bold text-slate-gray uppercase tracking-[2px] mb-4">
          Progress
        </h3>
        <div className="space-y-0">
          {phases.map((phase, i) => {
            const state = getPhaseState(status, phase.key);
            return (
              <div key={phase.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                      state === "done"
                        ? "bg-teal border-teal shadow-[var(--glow-teal-sm)]"
                        : state === "active"
                        ? "border-gold bg-gold/20 animate-glow-pulse shadow-[var(--glow-gold-sm)]"
                        : "border-white/[0.12] bg-transparent"
                    }`}
                  />
                  {i < phases.length - 1 && (
                    <div
                      className={`w-0.5 h-10 transition-colors duration-500 ${
                        state === "done" ? "bg-gradient-to-b from-teal/60 to-teal/20" : "bg-white/[0.06]"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-xs font-semibold ${state === "active" ? "text-gold" : state === "done" ? "text-teal" : "text-slate-gray/50"}`}>
                    {phase.label}
                  </p>
                  <p className="text-xs text-slate-gray/60">{phase.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-gray">Analyzing positions...</p>
        </div>
      )}

      {/* Synthesis Results */}
      {synthesis && (
        <>
          {/* Consensus Points */}
          {synthesis.consensusPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-gray uppercase tracking-[2px] mb-3">
                Consensus
              </h3>
              <div className="space-y-2.5">
                {synthesis.consensusPoints.map((point, i) => (
                  <div
                    key={i}
                    className="bg-agree/5 border border-agree/15 rounded-xl p-4 animate-fade-in-up backdrop-blur-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <p className="text-sm text-white/90 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {synthesis.conflicts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-gray uppercase tracking-[2px] mb-3">
                Key Conflicts
              </h3>
              <div className="space-y-2.5">
                {synthesis.conflicts.map((conflict, i) => (
                  <div
                    key={i}
                    className="bg-conflict/5 border-l-[3px] border-l-conflict border border-conflict/10 rounded-xl p-4 animate-fade-in-up backdrop-blur-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <p className="text-sm text-white/90 mb-3">{conflict.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {conflict.participants.map((p) => (
                        <Badge key={p} className="bg-conflict/15 text-conflict border-conflict/20 text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Argument Rankings */}
          {synthesis.argumentRankings.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-gray uppercase tracking-[2px] mb-3">
                Argument Rankings
              </h3>
              <div className="space-y-3">
                {synthesis.argumentRankings
                  .sort((a, b) => b.score - a.score)
                  .map((arg, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-white">{arg.userName}</span>
                        <span className="text-xs text-slate-gray font-mono font-bold bg-white/[0.05] px-2 py-0.5 rounded">
                          #{i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 mb-3 leading-relaxed">{arg.argument}</p>
                      {/* Score bars */}
                      <div className="space-y-2.5 mb-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-gray">Argument Strength</span>
                            <span className="text-xs font-bold text-gold tabular-nums">{arg.score}/10</span>
                          </div>
                          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-700 relative overflow-hidden"
                              style={{ width: `${arg.score * 10}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-bar_2s_ease-in-out_infinite]" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-gray">Thoughtfulness</span>
                            <span className={`text-xs font-bold tabular-nums ${(arg.thoughtfulness || 0) >= 7 ? "text-teal" : (arg.thoughtfulness || 0) >= 4 ? "text-blue-accent" : "text-conflict"}`}>
                              {arg.thoughtfulness || 0}/10
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${(arg.thoughtfulness || 0) >= 7 ? "bg-gradient-to-r from-teal/80 to-teal" : (arg.thoughtfulness || 0) >= 4 ? "bg-gradient-to-r from-blue-accent/80 to-blue-accent" : "bg-gradient-to-r from-conflict/80 to-conflict"}`}
                              style={{ width: `${(arg.thoughtfulness || 0) * 10}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-bar_2s_ease-in-out_infinite]" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-gray leading-relaxed">{arg.reasoning}</p>
                      {arg.thoughtfulnessReasoning && (
                        <p className="text-xs text-slate-gray/70 mt-1 italic leading-relaxed">{arg.thoughtfulnessReasoning}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gradient-to-br from-teal/10 via-teal/5 to-agree/10 border border-teal/20 rounded-2xl p-5 shadow-[var(--glow-teal-md)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recommendation
              </h3>
              <Badge className="bg-teal/20 text-teal border-teal/30 text-xs font-bold shadow-[var(--glow-teal-sm)]">
                {synthesis.confidence}% confidence
              </Badge>
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              {synthesis.recommendation}
            </p>
            {/* Confidence bar */}
            <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-agree transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${synthesis.confidence}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-bar_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </>
      )}

      {!synthesis && !isLoading && (
        <div className="text-center py-8">
          <p className="text-xs text-slate-gray">
            Waiting for positions before analysis can begin.
          </p>
        </div>
      )}
    </div>
  );
}
