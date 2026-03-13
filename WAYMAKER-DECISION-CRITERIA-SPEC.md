# Waymaker — Decision Criteria UX Spec

## The Problem With Sliders

Most decision tools (including our current MVP) ask users to manually weight abstract criteria: "rate speed 1-10, rate risk 1-10." Decision science research confirms this is the hardest UX problem in the space — and nobody has solved it. Users either skip the step, set everything to 50%, or spend 20 minutes debating the weights before they've even started debating the actual decision.

## Design Principle

**The criteria should feel like a conversation, not a configuration panel.**

People don't think in weights. They think in intentions: "we need to move fast on this," "we can't afford to get this wrong," "this needs to align with what the CEO said last week." Waymaker should meet them where they are.

---

## The System: Decision Types + Smart Defaults + Pairwise Tuning

### Layer 1: Pick a Decision Type

When creating a room, the creator picks what kind of decision this is. Each type has criteria baked in.

#### Prioritization
*"What should we do first?"*
Use for: roadmap decisions, backlog grooming, resource allocation, feature prioritization

Default criteria:
- **Impact** — How much does this move the needle? (reach × strength of effect)
- **Effort** — How much does this cost in time, money, and people?
- **Urgency** — How time-sensitive is this? What happens if we wait?

This maps to RICE/ICE frameworks that product teams already know, but stated in plain language.

#### Go / No-Go
*"Should we do this at all?"*
Use for: launch decisions, new hires, partnerships, investments, vendor selection, big bets

Default criteria:
- **Upside** — What's the best-case outcome? How big is the win?
- **Downside Risk** — What's the worst case? How reversible is this?
- **Confidence** — How sure are we about our assumptions? What's the evidence quality?

#### Direction
*"Which path should we take?"*
Use for: strategy debates, architecture decisions, positioning, rebrands, market entry

Default criteria:
- **Strategic Alignment** — Does this fit where we're headed as a company?
- **Differentiation** — Does this set us apart or make us a commodity?
- **Feasibility** — Can we actually pull this off with what we have?

#### Resolution
*"How do we settle this disagreement?"*
Use for: conflicting proposals, interpersonal disagreements, competing visions, tradeoffs

Default criteria:
- **Evidence Strength** — Who has the data to back their position?
- **Fairness** — Does this path account for everyone's core concerns?
- **Reversibility** — Can we course-correct if this turns out wrong?

#### Custom
*"Something else entirely"*
For teams that want full control. Start with a blank slate, name your own criteria (up to 5). Power user escape hatch.

---

### Layer 2: Pairwise Tuning (Optional, 30 Seconds)

After picking a decision type, the creator can optionally refine the weights using **pairwise comparison** — a technique from the Analytic Hierarchy Process (AHP) that's proven to be faster and more accurate than direct rating.

Instead of sliders, show pairs:

> **"For this decision, which matters more?"**
>
> ◀ Impact ━━━━●━━━━ Effort ▶
>
> ◀ Impact ━━━━━━●━━ Urgency ▶
>
> ◀ Effort ━━━●━━━━━ Urgency ▶

Three pairs for three criteria. Takes 15 seconds. Drag the dot toward whichever matters more. Center = equal weight.

The system converts pairwise preferences into weights automatically (standard AHP math). The creator never sees a number — they just express relative preferences.

**Default behavior if skipped:** Equal weights across all criteria. The AI still produces useful output because argument quality and evidence matter independent of criteria weights.

---

### Layer 3: The AI Explains Its Reasoning in Plain Language

The output should never say "weighted by Impact 0.42, Effort 0.35, Urgency 0.23."

Instead:

> **"You told me impact and urgency matter most here.** Sarah's proposal scores highest on impact (3x TAM expansion) but Marcus's concern about effort is real — the infrastructure cost is significant. James's parallel path threads the needle: it captures the urgency (ships in 4 weeks) while limiting effort (uses existing infra team capacity). That's why it ranks highest."

The criteria become the AI's reasoning vocabulary, not a technical readout.

---

### Layer 4: Team Profiles (Learned Over Time)

After 5+ decisions, Waymaker builds a **team decision profile**:

> "Your team typically prioritizes Impact and Feasibility. Want to use those defaults for this room?"

This compounds over time. New rooms take 5 seconds to set up instead of 30. The criteria become invisible — Waymaker just *knows* how your team thinks.

For individual users who participate across multiple teams, Waymaker can also learn personal tendencies:

> "You tend to weigh Risk higher than your teammates. Waymaker accounts for this when scoring your arguments."

This isn't about bias — it's about transparent self-awareness for the team.

---

## How Criteria Flow Through the System

```
Room Created
    │
    ▼
Decision Type selected (e.g., "Prioritization")
    │
    ▼
Default criteria loaded (Impact, Effort, Urgency)
    │
    ▼
[Optional] Pairwise tuning by creator (15-30 sec)
    │
    ▼
Participants submit positions (no awareness of criteria needed)
    │
    ▼
AI Synthesis Engine receives:
  - All positions
  - Decision type
  - Criteria + weights
  - Team history (if available)
    │
    ▼
AI scores each argument against each criterion
    │
    ▼
Output: Recommendation with plain-language reasoning
  - "You said X matters most. Here's why option A wins on X..."
  - Source attribution for every claim
  - Confidence score
```

Key design decision: **participants don't need to know or care about the criteria.** They just submit their position. The criteria are the creator's tool for steering the AI's lens. This keeps contribution frictionless while giving the room creator meaningful control.

---

## Edge Cases

**What if the creator picks the wrong type?**
The AI should detect mismatches. If someone creates a "Prioritization" room but the positions read like a "Go/No-Go" debate, Waymaker can suggest: "This looks more like a go/no-go decision. Want me to re-evaluate with those criteria?"

**What if criteria conflict with the strongest argument?**
Show it transparently. "Based on your criteria (urgency first), Option A wins. But if you weighted risk more heavily, Option B would be the recommendation. Here's the tradeoff..." This builds trust by showing the AI isn't hiding anything.

**What about decisions with hard constraints?**
Add a "Must-Have" toggle to any criterion. "Budget must stay under $50K" isn't a weighted preference — it's a binary gate. Any option that violates a must-have gets flagged, regardless of scores on other criteria.

**What about multi-round evolution?**
Criteria stay fixed across rounds (set once by the creator). But the AI's confidence should increase as positions refine. Round 1 might be 65% confidence, Round 2 reaches 82% as arguments sharpen.

---

## Implementation Priority

**MVP (build now):**
- 4 decision types with default criteria
- Plain-language reasoning in AI output
- "Custom" option for power users

**V2 (next sprint):**
- Pairwise tuning UI
- Must-have constraint toggles
- Decision type mismatch detection

**V3 (after 100+ decisions in the system):**
- Team decision profiles
- Individual tendency tracking
- Smart defaults based on team history

---

## Prompt Engineering Notes

The AI synthesis prompt should include criteria context like this:

```
DECISION CONTEXT:
- Type: Prioritization
- Criteria: Impact (weight: 0.42), Effort (weight: 0.35), Urgency (weight: 0.23)
- Creator's intent: "Impact and urgency matter most"

INSTRUCTIONS:
1. Score each participant's core argument against each criterion (1-10)
2. Show your scoring in a transparent breakdown
3. In your recommendation, explain your reasoning using the criteria as your vocabulary
4. Never show raw weights to the user — translate into natural language
5. If the highest-scoring option on weighted criteria conflicts with the most popular position, flag the tension explicitly
6. If a must-have constraint is violated, flag it as a dealbreaker regardless of other scores
```

---

## Why This Is Better Than Sliders

| Sliders (current) | Decision Types (proposed) |
|---|---|
| Abstract, intimidating | Familiar, intuitive |
| Requires domain expertise | Works for any team |
| Easy to get wrong silently | Smart defaults catch you |
| Same UI for every decision | Contextual to decision type |
| Numbers feel arbitrary | Plain language feels human |
| No learning over time | Team profiles compound value |
