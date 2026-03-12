export interface Criteria {
  speed: number;
  risk: number;
  cost: number;
  innovation: number;
}

export interface UserBasic {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface RoomWithDetails {
  id: string;
  title: string;
  description: string | null;
  teamId: string | null;
  creatorId: string;
  criteria: Criteria;
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

export interface PositionWithUser {
  id: string;
  roomId: string;
  userId: string;
  roundNumber: number;
  content: string;
  createdAt: string;
  user: UserBasic;
}

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

export interface RoomEvent {
  status: string;
  currentRound: number;
  positionCount: number;
  updatedAt: string;
}

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
