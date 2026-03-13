import type { CriterionDef, DecisionType, SynthesisResult } from "./types";
import { getDecisionTypeConfig } from "@/lib/constants";

export function buildSynthesisPrompt(params: {
  title: string;
  description: string;
  decisionType: DecisionType;
  criteria: CriterionDef[];
  positions: Array<{ userId: string; userName: string; content: string; attachmentCount?: number; attachmentNames?: string[] }>;
  roundNumber: number;
  previousSynthesis?: SynthesisResult;
  contextDocuments?: Array<{ title: string; content: string }>;
}): string {
  const typeConfig = getDecisionTypeConfig(params.decisionType);
  const typeLabel = typeConfig?.label ?? "Custom";
  const typeQuestion = typeConfig?.question ?? "";

  // Sort criteria by weight descending to produce a natural intent sentence
  const sorted = [...params.criteria].sort((a, b) => b.weight - a.weight);
  const criteriaNames = sorted.map((c) => c.name);

  // Build plain-language intent from weights
  let intentStr: string;
  if (sorted.length === 0) {
    intentStr = "No specific criteria prioritised — use your best judgement.";
  } else if (sorted.every((c) => Math.abs(c.weight - sorted[0].weight) < 0.05)) {
    intentStr = `All criteria are roughly equal: ${criteriaNames.join(", ")}.`;
  } else {
    const top = sorted.filter(
      (c) => c.weight >= sorted[0].weight * 0.7
    );
    const rest = sorted.filter(
      (c) => c.weight < sorted[0].weight * 0.7
    );
    intentStr =
      `${top.map((c) => c.name).join(" and ")} matter${top.length === 1 ? "s" : ""} most here` +
      (rest.length > 0
        ? `, with ${rest.map((c) => c.name).join(" and ")} as secondary consideration${rest.length === 1 ? "" : "s"}.`
        : ".");
  }

  // Must-have constraints
  const mustHaves = params.criteria.filter((c) => c.isMustHave);
  const mustHaveStr =
    mustHaves.length > 0
      ? `\n\nMUST-HAVE CONSTRAINTS (binary gates — any option violating these is flagged as a dealbreaker regardless of other scores):\n${mustHaves.map((c) => `- ${c.name}`).join("\n")}`
      : "";

  // Criteria detail (with weights for internal scoring, but never shown to user)
  const criteriaDetailStr = sorted
    .map(
      (c) =>
        `- ${c.name} (internal weight: ${(c.weight * 100).toFixed(0)}%)${c.isMustHave ? " [MUST-HAVE]" : ""}`
    )
    .join("\n");

  const positionsStr = params.positions
    .map((p) => {
      let entry = `[${p.userName}] (id: ${p.userId}): ${p.content}`;
      if (p.attachmentCount && p.attachmentCount > 0 && p.attachmentNames) {
        entry += `\n[This participant attached ${p.attachmentCount} file(s): ${p.attachmentNames.join(", ")}]`;
      }
      return entry;
    })
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
**Round:** ${params.roundNumber}

DECISION CONTEXT:
- Type: ${typeLabel}${typeQuestion ? ` ("${typeQuestion}")` : ""}
- Creator's intent: "${intentStr}"
- Criteria:
${criteriaDetailStr}${mustHaveStr}
${contextStr}${previousContext}
**Positions:**
${positionsStr}

YOUR TASK:
1. Identify CONSENSUS POINTS — things 2+ participants agree on. Return as an array of strings.
2. Identify KEY CONFLICTS — where positions fundamentally diverge. Return as an array of { "description": string, "participants": string[] } where participants are the user names involved.
3. RANK each participant's argument 1-10 based on: evidence strength, alignment with the criteria above, and feasibility. Also score the THOUGHTFULNESS of each position 1-10 based on: depth of reasoning, consideration of tradeoffs and counterarguments, specificity vs vagueness, use of evidence or data, and intellectual rigor. Return as an array of { "userId": string, "userName": string, "argument": string (one-line summary of their core position), "score": number (1-10), "reasoning": string, "thoughtfulness": number (1-10), "thoughtfulnessReasoning": string }.
4. Produce a RECOMMENDATION that synthesizes the strongest elements, with a confidence score (0-100%).

CRITICAL RULES FOR YOUR RECOMMENDATION:
- Use the criteria (${criteriaNames.join(", ")}) as your REASONING VOCABULARY. Explain WHY an option wins by referencing what the creator told you matters most.
- NEVER show raw weights, percentages, or numeric scores in your recommendation text. Translate into natural language. For example, instead of "weighted by Impact 0.42", say "you told me impact matters most here, and Sarah's proposal scores highest on that front because..."
- If the highest-scoring option on weighted criteria conflicts with the most popular position, flag the tension explicitly.
- If a must-have constraint is violated, flag it as a dealbreaker regardless of other scores.
- Cite which participant's input each part of your recommendation draws from.
- The confidence score should reflect: how much consensus exists, how strong the top arguments are, and whether the criteria clearly favor one direction.

Output ONLY valid JSON matching this exact schema (no markdown, no code fences):
{
  "consensusPoints": ["string"],
  "conflicts": [{ "description": "string", "participants": ["string"] }],
  "argumentRankings": [{ "userId": "string", "userName": "string", "argument": "string", "score": number, "reasoning": "string", "thoughtfulness": number, "thoughtfulnessReasoning": "string" }],
  "recommendation": "string",
  "confidence": number
}`;
}
