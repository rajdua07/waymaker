import type { CriterionDef, DecisionType } from "@/types";

export interface SynthesisResult {
  consensusPoints: string[];
  conflicts: Array<{
    description: string;
    participants: string[];
  }>;
  argumentRankings: Array<{
    userId: string;
    userName: string;
    argument: string;
    score: number;
    reasoning: string;
    thoughtfulness: number;
    thoughtfulnessReasoning: string;
  }>;
  recommendation: string;
  confidence: number;
}

export type { CriterionDef, DecisionType };
