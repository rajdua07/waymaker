import type { CriteriaWeights, SynthesisResult } from "./types";

export function buildSynthesisPrompt(params: {
  title: string;
  description: string;
  criteria: CriteriaWeights;
  positions: Array<{ userId: string; userName: string; content: string }>;
  roundNumber: number;
  previousSynthesis?: SynthesisResult;
  contextDocuments?: Array<{ title: string; content: string }>;
}): string {
  const criteriaStr = Object.entries(params.criteria)
    .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
    .join(", ");

  const positionsStr = params.positions
    .map((p) => `[${p.userName}] (id: ${p.userId}): ${p.content}`)
    .join("\n\n");

  let previousContext = "";
  if (params.previousSynthesis && params.roundNumber > 1) {
    previousContext = `

PREVIOUS ROUND SYNTHESIS:
Recommendation: ${params.previousSynthesis.recommendation}
Confidence: ${params.previousSynthesis.confidence}%
Consensus: ${params.previousSynthesis.consensusPoints.join("; ")}
Conflicts: ${params.previousSynthesis.conflicts.map((c) => c.description).join("; ")}

Participants have now responded to the above synthesis. Analyze their updated positions and produce a refined recommendation with updated confidence.
`;
  }

  let contextStr = "";
  if (params.contextDocuments && params.contextDocuments.length > 0) {
    contextStr = `

CONTEXT DOCUMENTS:
The following documents have been provided as background context for this decision. Use them to inform your analysis, evaluate the strength of arguments, and ground your recommendation in the available evidence.

${params.contextDocuments.map((d, i) => `--- Document ${i + 1}: ${d.title} ---\n${d.content}`).join("\n\n")}
--- End of Context Documents ---
`;
  }

  return `You are Waymaker, an AI decision arbitrator. You have received ${params.positions.length} positions on the following topic:

**Topic:** ${params.title}
**Description:** ${params.description || "No additional description provided."}
**Decision Criteria Weights:** ${criteriaStr}
**Round:** ${params.roundNumber}
${contextStr}${previousContext}
**Positions:**
${positionsStr}

Your task:
1. Identify CONSENSUS POINTS — things 2+ participants agree on. Return as an array of strings.
2. Identify KEY CONFLICTS — where positions fundamentally diverge. Return as an array of { "description": string, "participants": string[] } where participants are the user names involved.
3. RANK each participant's argument 1-10 based on: evidence strength, alignment with stated criteria weights, feasibility. Also score the THOUGHTFULNESS of each position 1-10 based on: depth of reasoning, consideration of tradeoffs and counterarguments, specificity vs vagueness, use of evidence or data, and intellectual rigor. A high thoughtfulness score means the person clearly thought deeply even if their conclusion is wrong; a low score means the position is shallow, vague, or unsupported. Return as an array of { "userId": string, "userName": string, "argument": string (one-line summary of their core position), "score": number (1-10), "reasoning": string, "thoughtfulness": number (1-10), "thoughtfulnessReasoning": string (brief explanation of why this score) }.
4. Produce a RECOMMENDATION that synthesizes the strongest elements, with a confidence score (0-100%). Higher confidence means stronger evidence for one clear path. Cite which participant's input each part draws from.
5. The confidence score should reflect: how much consensus exists, how strong the top arguments are, and whether the criteria clearly favor one direction.

Output ONLY valid JSON matching this exact schema (no markdown, no code fences):
{
  "consensusPoints": ["string"],
  "conflicts": [{ "description": "string", "participants": ["string"] }],
  "argumentRankings": [{ "userId": "string", "userName": "string", "argument": "string", "score": number, "reasoning": "string", "thoughtfulness": number, "thoughtfulnessReasoning": "string" }],
  "recommendation": "string",
  "confidence": number
}`;
}
