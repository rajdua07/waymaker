// --- Decision Types & Criteria ---

export type DecisionType =
  | "prioritization"
  | "go-no-go"
  | "direction"
  | "resolution"
  | "custom";

export interface CriterionDef {
  name: string;
  weight: number; // 0-1, normalized across all criteria
  isMustHave: boolean;
}

// --- User ---

export interface UserBasic {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

// --- Attachment ---

export interface PositionAttachment {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

// --- Room ---

export interface RoomWithDetails {
  id: string;
  title: string;
  description: string | null;
  teamId: string;
  creatorId: string;
  decisionType: DecisionType;
  criteria: CriterionDef[];
  status: string;
  currentRound: number;
  createdAt: string;
  updatedAt: string;
  creator: UserBasic;
  participants: Array<{
    id: string;
    userId: string;
    user: UserBasic;
  }>;
  positions: PositionWithUser[];
  syntheses: SynthesisData[];
  decision: DecisionData | null;
  documents: RoomDocument[];
}

export interface RoomDocument {
  id: string;
  roomId: string;
  title: string;
  content: string;
  createdAt: string;
}

// --- Position ---

export interface PositionWithUser {
  id: string;
  roomId: string;
  userId: string;
  roundNumber: number;
  content: string;
  createdAt: string;
  user: UserBasic;
  attachments: PositionAttachment[];
}

// --- Synthesis ---

export interface ArgumentRanking {
  userId: string;
  userName: string;
  argument: string;
  score: number;
  reasoning: string;
  thoughtfulness: number;
  thoughtfulnessReasoning: string;
}

export interface Conflict {
  description: string;
  participants: string[];
}

export interface SynthesisData {
  id: string;
  roomId: string;
  roundNumber: number;
  consensusPoints: string[];
  conflicts: Conflict[];
  argumentRankings: ArgumentRanking[];
  recommendation: string;
  confidence: number;
  createdAt: string;
}

// --- Decision ---

export interface DecisionData {
  id: string;
  roomId: string;
  finalRecommendation: string;
  decisionDate: string;
  loggedAt: string;
  acceptances: Array<{
    userId: string;
    user: UserBasic;
    acceptedAt: string;
  }>;
}

// --- Events ---

export interface RoomEvent {
  status: string;
  currentRound: number;
  positionCount: number;
  updatedAt: string;
}

// --- Arena ---

export interface ArenaNode {
  id: string;
  name: string;
  initials: string;
  color: string;
  score: number | null;
  x: number;
  y: number;
}

export interface ArenaEdge {
  from: string;
  to: string;
  type: "agree" | "conflict" | "partial";
  label?: string;
}
