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

export const DEFAULT_CRITERIA = {
  speed: 0.5,
  risk: 0.5,
  cost: 0.5,
  innovation: 0.5,
};
