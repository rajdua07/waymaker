"use client";

import { useCallback, useMemo } from "react";
import type { CriterionDef } from "@/types";

interface PairwiseTunerProps {
  criteria: CriterionDef[];
  onChange: (updated: CriterionDef[]) => void;
}

interface PairPref {
  a: string;
  b: string;
  value: number; // -1 = fully A, 0 = equal, +1 = fully B
}

/**
 * Generates all unique pairs from the criteria list and lets the creator
 * drag a slider between each pair to express relative preference.
 *
 * Converts pairwise preferences into normalised weights using a simplified
 * AHP approach (geometric mean of relative scores).
 */
export function PairwiseTuner({ criteria, onChange }: PairwiseTunerProps) {
  const pairs = useMemo(() => {
    const out: PairPref[] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        out.push({ a: criteria[i].name, b: criteria[j].name, value: 0 });
      }
    }
    return out;
  }, [criteria]);

  // Keep pair state as a simple map of "a|b" -> value
  // We derive it from the criteria weights on first render, then let slider
  // changes flow back via recalculating weights.
  const pairKey = (a: string, b: string) => `${a}|${b}`;

  // Track pairwise values via local memo from criteria
  // On slider change we recalculate weights immediately
  const handleSliderChange = useCallback(
    (a: string, b: string, value: number) => {
      // Build a ratio matrix from pairwise preferences
      // value ranges from -1 (A dominates) to +1 (B dominates)
      // Map to AHP-style ratios: -1 → A:B = 5:1, 0 → 1:1, +1 → 1:5
      const names = criteria.map((c) => c.name);
      const n = names.length;

      // Create a mutable map of all pair values
      const pairMap = new Map<string, number>();
      for (const p of pairs) {
        pairMap.set(pairKey(p.a, p.b), p.value);
      }
      // Update the changed pair
      pairMap.set(pairKey(a, b), value);

      // Build ratio matrix
      const matrix: number[][] = Array.from({ length: n }, () =>
        Array(n).fill(1)
      );
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const v = pairMap.get(pairKey(names[i], names[j])) ?? 0;
          // Map [-1, +1] to ratio [5, 0.2]
          // v = -1 → ratio = 5 (A much more important)
          // v = 0  → ratio = 1 (equal)
          // v = +1 → ratio = 0.2 (B much more important)
          const ratio = Math.pow(5, -v);
          matrix[i][j] = ratio;
          matrix[j][i] = 1 / ratio;
        }
      }

      // Geometric mean method for weight calculation
      const geoMeans = matrix.map((row) => {
        const product = row.reduce((acc, val) => acc * val, 1);
        return Math.pow(product, 1 / n);
      });
      const total = geoMeans.reduce((s, v) => s + v, 0);
      const weights = geoMeans.map((g) => +(g / total).toFixed(4));

      onChange(
        criteria.map((c, i) => ({
          ...c,
          weight: weights[i],
        }))
      );
    },
    [criteria, onChange, pairs]
  );

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-white mb-2">
        For this decision, which matters more?
      </p>
      {pairs.map(({ a, b }) => {
        // Derive current value from current weights
        const wA = criteria.find((c) => c.name === a)?.weight ?? 0.5;
        const wB = criteria.find((c) => c.name === b)?.weight ?? 0.5;
        // Approximate pairwise value from weight ratio
        let currentValue = 0;
        if (wA + wB > 0) {
          // ratio = wA / wB, then map back: ratio = 5^(-v) → v = -log5(ratio)
          const ratio = wA / wB;
          currentValue = -Math.log(ratio) / Math.log(5);
          currentValue = Math.max(-1, Math.min(1, currentValue));
        }

        return (
          <div key={pairKey(a, b)} className="flex items-center gap-3">
            <span
              className={`text-xs font-medium w-28 text-right shrink-0 ${
                currentValue < -0.1 ? "text-teal" : "text-slate-gray"
              }`}
            >
              {a}
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={-100}
                max={100}
                value={Math.round(currentValue * 100)}
                onChange={(e) =>
                  handleSliderChange(a, b, parseInt(e.target.value) / 100)
                }
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:cursor-grab
                  [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(13,148,136,0.5)]"
              />
              {/* Center tick */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/20 pointer-events-none" />
            </div>
            <span
              className={`text-xs font-medium w-28 shrink-0 ${
                currentValue > 0.1 ? "text-teal" : "text-slate-gray"
              }`}
            >
              {b}
            </span>
          </div>
        );
      })}
    </div>
  );
}
