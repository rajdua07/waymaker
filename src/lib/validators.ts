import { z } from "zod/v4";

const criterionSchema = z.object({
  name: z.string().min(1).max(80),
  weight: z.number().min(0).max(1),
  isMustHave: z.boolean(),
});

export const createRoomSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  teamId: z.string(),
  participantUserIds: z.array(z.string()).min(1).max(10),
  decisionType: z.enum([
    "prioritization",
    "go-no-go",
    "direction",
    "resolution",
    "custom",
  ]),
  criteria: z.array(criterionSchema).min(1).max(5),
});

const attachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
});

export const submitPositionSchema = z.object({
  content: z.string().min(1).max(10000),
  onBehalfOfUserId: z.string().optional(),
  attachments: z.array(attachmentSchema).max(5).optional(),
});

export const addDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(100000),
});

export const lockDecisionSchema = z.object({
  finalRecommendation: z.string().min(1),
});

export const updateRoomSchema = z.object({
  status: z.enum(["collecting", "analyzing", "converging", "decided"]).optional(),
  currentRound: z.number().int().positive().optional(),
});

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
});

export const inviteMemberSchema = z.object({
  email: z.email(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
});
