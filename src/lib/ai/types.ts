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

export interface CriteriaWeights {
  speed: number;
  risk: number;
  cost: number;
  innovation: number;
}
