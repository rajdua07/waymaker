import type { DecisionType, CriterionDef } from "@/types";

export const ROOM_STATUSES = {
  COLLECTING: "collecting",
  ANALYZING: "analyzing",
  CONVERGING: "converging",
  DECIDED: "decided",
} as const;

export type RoomStatus = (typeof ROOM_STATUSES)[keyof typeof ROOM_STATUSES];

export const PARTICIPANT_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#22C55E",
  "#06B6D4",
  "#F97316",
  "#6366F1",
  "#14B8A6",
];

export const EDGE_COLORS = {
  agree: "#22C55E",
  conflict: "#EF4444",
  partial: "#F59E0B",
} as const;

// --- Decision Types ---

export interface DecisionTypeConfig {
  id: DecisionType;
  label: string;
  question: string;
  description: string;
  defaultCriteria: CriterionDef[];
}

function equalWeight(names: string[]): CriterionDef[] {
  const w = +(1 / names.length).toFixed(4);
  return names.map((name) => ({ name, weight: w, isMustHave: false }));
}

export const DECISION_TYPES: DecisionTypeConfig[] = [
  {
    id: "prioritization",
    label: "Prioritization",
    question: "What should we do first?",
    description:
      "Roadmap decisions, backlog grooming, resource allocation, feature prioritization",
    defaultCriteria: equalWeight(["Impact", "Effort", "Urgency"]),
  },
  {
    id: "go-no-go",
    label: "Go / No-Go",
    question: "Should we do this at all?",
    description:
      "Launch decisions, new hires, partnerships, investments, vendor selection",
    defaultCriteria: equalWeight(["Upside", "Downside Risk", "Confidence"]),
  },
  {
    id: "direction",
    label: "Direction",
    question: "Which path should we take?",
    description:
      "Strategy debates, architecture decisions, positioning, market entry",
    defaultCriteria: equalWeight([
      "Strategic Alignment",
      "Differentiation",
      "Feasibility",
    ]),
  },
  {
    id: "resolution",
    label: "Resolution",
    question: "How do we settle this?",
    description:
      "Conflicting proposals, interpersonal disagreements, competing visions",
    defaultCriteria: equalWeight([
      "Evidence Strength",
      "Fairness",
      "Reversibility",
    ]),
  },
  {
    id: "custom",
    label: "Custom",
    question: "Something else entirely",
    description: "Name your own criteria (up to 5). Full control.",
    defaultCriteria: [],
  },
];

export function getDecisionTypeConfig(
  id: DecisionType
): DecisionTypeConfig | undefined {
  return DECISION_TYPES.find((t) => t.id === id);
}
