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
        <h3 className="text-[11px] font-bold text-slate-gray uppercase tracking-[2px] mb-4">
          Progress
        </h3>
        <div className="space-y-0">
          {phases.map((phase, i) => {
            const state = getPhaseState(status, phase.key);
            return (
              <div key={phase.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      state === "done"
                        ? "bg-teal border-teal"
                        : state === "active"
                        ? "border-gold bg-transparent animate-pulse-glow"
                        : "border-slate-gray/30 bg-transparent"
                    }`}
                  />
                  {i < phases.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        state === "done" ? "bg-teal/40" : "bg-white/[0.06]"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-xs font-semibold ${state === "active" ? "text-gold" : state === "done" ? "text-teal" : "text-slate-gray/50"}`}>
                    {phase.label}
                  </p>
                  <p className="text-[10px] text-slate-gray/60">{phase.description}</p>
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
              <h3 className="text-[11px] font-bold text-slate-gray uppercase tracking-[2px] mb-3">
                Consensus
              </h3>
              <div className="space-y-2">
                {synthesis.consensusPoints.map((point, i) => (
                  <div
                    key={i}
                    className="bg-agree/5 border border-agree/20 rounded-lg p-3 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <p className="text-xs text-white/90">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {synthesis.conflicts.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-slate-gray uppercase tracking-[2px] mb-3">
                Key Conflicts
              </h3>
              <div className="space-y-2">
                {synthesis.conflicts.map((conflict, i) => (
                  <div
                    key={i}
                    className="bg-conflict/5 border-l-[3px] border-l-conflict border border-conflict/10 rounded-lg p-3 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <p className="text-xs text-white/90 mb-2">{conflict.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {conflict.participants.map((p) => (
                        <Badge key={p} className="bg-conflict/10 text-conflict text-[9px]">
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
              <h3 className="text-[11px] font-bold text-slate-gray uppercase tracking-[2px] mb-3">
                Argument Rankings
              </h3>
              <div className="space-y-3">
                {synthesis.argumentRankings
                  .sort((a, b) => b.score - a.score)
                  .map((arg, i) => (
                    <div
                      key={i}
                      className="bg-navy-light border border-white/[0.06] rounded-lg p-3 animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">{arg.userName}</span>
                        <span className="text-[10px] text-slate-gray font-medium">#{i + 1}</span>
                      </div>
                      <p className="text-[11px] text-white/80 mb-2">{arg.argument}</p>
                      {/* Score bars */}
                      <div className="space-y-1.5 mb-2">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-slate-gray">Argument Strength</span>
                            <span className="text-[10px] font-bold text-gold">{arg.score}/10</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-700"
                              style={{ width: `${arg.score * 10}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-slate-gray">Thoughtfulness</span>
                            <span className={`text-[10px] font-bold ${(arg.thoughtfulness || 0) >= 7 ? "text-teal" : (arg.thoughtfulness || 0) >= 4 ? "text-blue-accent" : "text-conflict"}`}>
                              {arg.thoughtfulness || 0}/10
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${(arg.thoughtfulness || 0) >= 7 ? "bg-gradient-to-r from-teal/80 to-teal" : (arg.thoughtfulness || 0) >= 4 ? "bg-gradient-to-r from-blue-accent/80 to-blue-accent" : "bg-gradient-to-r from-conflict/80 to-conflict"}`}
                              style={{ width: `${(arg.thoughtfulness || 0) * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-gray">{arg.reasoning}</p>
                      {arg.thoughtfulnessReasoning && (
                        <p className="text-[10px] text-slate-gray/70 mt-1 italic">{arg.thoughtfulnessReasoning}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gradient-to-br from-teal/10 to-agree/10 border border-teal/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recommendation
              </h3>
              <Badge className="bg-teal/20 text-teal text-xs font-bold">
                {synthesis.confidence}% confidence
              </Badge>
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-3">
              {synthesis.recommendation}
            </p>
            {/* Confidence bar */}
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-agree transition-all duration-1000"
                style={{ width: `${synthesis.confidence}%` }}
              />
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
