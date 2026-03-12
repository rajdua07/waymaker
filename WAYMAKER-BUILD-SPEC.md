# Waymaker — Build Specification

## What Is Waymaker?

An AI-powered decision arbitration platform. The core thesis: **AI has given people a ton of ideas, but made them worse at deciding and executing. Waymaker solves this.**

Every person on a team now generates more proposals, analyses, and counter-arguments using AI. But more ideas without a decision engine = paralysis, not progress. Waymaker is the missing decision layer — the AI that sits between everyone else's AI and finds the way forward.

---

## Phase 1 MVP Scope (Build This First)

Web application with **Decision Rooms** — the async workflow for structured decision-making.

### Core Flow

1. **Create a Decision Room** — Name the topic, invite 2–10 participants, set decision criteria (speed, risk, cost, innovation)
2. **Everyone Contributes** — Each participant submits their position (typed directly, pasted from ChatGPT/Claude, or pulled from docs)
3. **AI Arbitrates** — Waymaker ingests all inputs, maps agreements and conflicts, scores argument strength with full source attribution
4. **Iterate** — Participants respond to the synthesis. Waymaker re-arbitrates with confidence scoring. Multi-round convergence
5. **Decide & Log** — Lock in the decision. Full audit trail of who contributed, what was weighed, and why

### MVP Features

- User accounts & team management (Auth0)
- Create/join Decision Rooms
- Submit positions (text input with rich text)
- AI synthesis engine: takes N positions → maps consensus/conflict → scores arguments → produces ranked recommendation with confidence %
- Decision Arena visualization: node graph showing participant positions, agreement/conflict edges, argument scores, and convergence path (see `waymaker-arena.html` for the UI spec)
- Decision Log: searchable history of all decisions made
- Source Transparency: every recommendation traces back to who said what

### What's NOT in Phase 1

- Live Meeting Mode (Phase 2)
- Integrations with Slack/Notion/Monday/Jira (Phase 3)
- SSO/SAML, SOC 2, enterprise features (Phase 4)

---

## Technical Architecture

### Frontend
- **Next.js** (App Router)
- Real-time WebSocket connections for live collaboration within Decision Rooms
- Tailwind CSS for styling
- Color palette: navy `#0F1B2D`, teal `#0D9488`, gold `#F59E0B`, gray `#94A3B8`
- Fonts: Inter for UI, Georgia for headings

### Backend
- **Node.js** API layer
- Room management, user/team CRUD, position submission, synthesis orchestration
- WebSocket server for real-time room updates

### AI Engine
- **Claude API** (primary) for synthesis — takes all participant positions + decision criteria → produces structured output:
  - Consensus points (what everyone agrees on)
  - Key conflicts (where positions diverge)
  - Argument ranking (scored 1-10 with reasoning)
  - Recommendation with confidence percentage
  - Full source attribution for every claim
- Multi-round: after participants respond to Round 1 synthesis, re-run with updated positions

### Database
- **PostgreSQL** for structured data (users, teams, rooms, positions, decisions)
- **pgvector** extension for semantic search across decision history

### Auth
- **Auth0** for authentication
- Team-based access control (room creators invite participants)

### Infrastructure
- **Vercel** for frontend deployment
- **Railway** or **Render** for backend services
- SOC 2 compliance path (Phase 4, but design with it in mind)

---

## Data Models

### User
- id, email, name, avatar, team_ids[], created_at

### Team
- id, name, owner_id, member_ids[], created_at

### Decision Room
- id, title, description, team_id, creator_id, participant_ids[], criteria (JSON: {speed: 0-1, risk: 0-1, cost: 0-1, innovation: 0-1}), status (collecting | analyzing | converging | decided), current_round, created_at

### Position
- id, room_id, user_id, round_number, content (text), created_at

### Synthesis
- id, room_id, round_number, consensus_points[], conflicts[], argument_rankings[], recommendation (text), confidence (0-100), raw_ai_response, created_at

### Decision
- id, room_id, final_recommendation, accepted_by_ids[], decision_date, logged_at

---

## Key UI Pages

1. **Dashboard** — List of active Decision Rooms, recent decisions, team overview
2. **Create Room** — Form: title, description, invite participants, set criteria sliders
3. **Decision Room** — Three-panel layout:
   - Left: Participant position cards (who said what)
   - Center: Decision Arena visualization (node graph with edges showing agreement/conflict)
   - Right: AI analysis panel (phase tracker, consensus points, conflicts, argument rankings, recommendation)
4. **Decision Log** — Searchable table of all past decisions with filters
5. **Settings** — Team management, profile, AI criteria presets

### UI Reference Files
- `waymaker-arena.html` — Interactive prototype of the Decision Room UI (three-panel layout with SVG node graph)
- `waymaker-landing.html` — Landing page design (shows the product positioning and visual language)
- `waymaker-architecture.html` — Technical architecture diagram

---

## AI Prompt Architecture

The synthesis engine should use a structured prompt like:

```
You are Waymaker, an AI decision arbitrator. You have received {N} positions on the following topic:

**Topic:** {room.title}
**Description:** {room.description}
**Decision Criteria:** Speed: {criteria.speed}, Risk: {criteria.risk}, Cost: {criteria.cost}, Innovation: {criteria.innovation}

**Positions:**
{for each position: "[Name] ([Role]): {position.content}"}

Your task:
1. Identify CONSENSUS POINTS — things 2+ participants agree on
2. Identify KEY CONFLICTS — where positions fundamentally diverge
3. RANK each argument 1-10 based on: evidence strength, alignment with stated criteria, feasibility
4. Produce a RECOMMENDATION that synthesizes the strongest elements, with a confidence score (0-100%)
5. For every claim in your recommendation, cite which participant's input it draws from

Output as structured JSON.
```

---

## Product Roadmap (for context)

- **Phase 1 — MVP (Q2 2026):** Decision Rooms, async input, AI synthesis, decision log ← BUILD THIS
- **Phase 2 — Live Mode (Q3 2026):** Zoom/Meet integration, live transcription (Deepgram), real-time AI suggestions during calls
- **Phase 3 — Integrations (Q4 2026):** Slack, Notion, Monday.com, Jira — auto-create tasks from decisions. Weekly decision digest
- **Phase 4 — Enterprise (2027):** SSO/SAML, SOC 2, configurable AI judge, decision analytics dashboard, API access

---

## Competitive Context

No existing tool combines: async-first + multi-party input + AI arbitration + enterprise context.

- Meeting summarizers (Otter, Fireflies) — capture, don't arbitrate
- Collective intelligence (Pol.is, Loomio) — civic scale, not team-sized
- Legal AI (AAA-ICDR) — proves concept, but narrowly scoped
- Microsoft Teams Facilitator — documents, doesn't recommend

**Waymaker's position: every tool helps generate ideas. None help you pick one.**

---

## Domain

getwaymaker.com

## Contact

Raj Dua — rajdua07@gmail.com
