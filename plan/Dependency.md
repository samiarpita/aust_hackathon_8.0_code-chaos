# Student Misconception Radar — Teammate Dependency & Execution Flow

> **Progress Tracking:** To update progress, edit this file and change `[ ]` to `[x]` on completed tasks, and wrap the completed line in `~~strikethrough~~` (e.g. `- [x] ~~**[D1-1.1]** ...~~`).
> **Initials & Step Prefix Key:**
> - **`[C-#]`** = **Contracts** — agreed jointly by all three developers before implementation
> - **`[D1-#.#]`** = **Developer 1** (Frontend — React + Vite · `Developer_1_Task.md`)
> - **`[D2-#.#]`** = **Developer 2** (Backend skeleton, routes, DB schema/RLS · `Developer_2_Task.md`)
> - **`[D3-#.#]`** = **Developer 3** (AI Module — misconception clustering · `Developer_3_Task.md`)

---

## 1. Agree on Contracts (Blocks Everyone — Do This First)

These three contracts are the entire coordination surface between the three of you. Once agreed,
each developer can work independently until integration.

- [ ] **[C-1]** Finalize **Contract A — API Contract** (Dev 1 ↔ Dev 2):
  `POST /api/analyses`, `GET /api/analyses/:id`, `GET /api/analyses?examId=`, Bearer-JWT auth on
  every request — *All three review, Dev 1 & Dev 2 own* `[Unblocks: D1-2.1, D2-2.2]`
- [ ] **[C-2]** Finalize **Contract B — AI Module Contract** (Dev 2 ↔ Dev 3):
  `async function analyzeAnswers({ questionText, clos, answers }) → { misconceptionGroups, insight, intervention }`
  — *All three review, Dev 2 & Dev 3 own* `[Unblocks: D2-2.4, D3-1.1]`
- [ ] **[C-3]** Finalize **Contract C — Database Schema**: `courses → exams → questions → { clos,
  submissions, analyses }` — *Dev 2 owns, Dev 1 & Dev 3 just need the shapes* `[Unblocks: D2-2.1,
  D1-2.1, D3-1.1]`

No file is owned by more than one developer. The only shared surface is these three contracts,
which live in this document and in each `Developer_N_Task.md` — not in a shared code file, so
there's nothing to merge-conflict over.

---

## 2. Day 0 — Independent Start (No Cross-Teammate Blockers)

### Developer 1 — Frontend (`frontend/**`)
- [ ] **[D1-1.1]** Scaffold the Vite + React app — *Dev 1* `[Unblocks: D1-1.2]`
- [ ] **[D1-1.2]** Build a local mock API matching Contract A — *Dev 1* `[Blocked by: C-1, D1-1.1]
  [Unblocks: D1-1.3]`
- [ ] **[D1-1.3]** Build Login screen against the mock API — *Dev 1* `[Blocked by: D1-1.2]`
- [ ] **[D1-1.4]** Build New Analysis screen (upload question paper, answers, CLOs; question
  selection) against the mock API — *Dev 1* `[Blocked by: D1-1.2]`
- [ ] **[D1-1.5]** Build Results screen (Misconception Map, AI Insight, Recommended Intervention)
  against the mock API — *Dev 1* `[Blocked by: D1-1.2]`

### Developer 2 — Backend Skeleton & DB (`backend/**` except `backend/src/ai/**`)
- [ ] **[D2-1.1]** Scaffold Express app — *Dev 2* `[Unblocks: D2-1.3]`
- [ ] **[D2-1.2]** Write Supabase migrations for the schema in Contract C — *Dev 2* `[Blocked by:
  C-3] [Unblocks: D2-1.4]`
- [ ] **[D2-1.3]** Implement Supabase JWT auth middleware — *Dev 2* `[Blocked by: D2-1.1]`
- [ ] **[D2-1.4]** Set up Row-Level Security scoping every table to `courses.faculty_id =
  auth.uid()` — *Dev 2* `[Blocked by: D2-1.2]`
- [ ] **[D2-1.5]** Implement the three routes (`POST /api/analyses`, `GET /api/analyses/:id`, `GET
  /api/analyses?examId=`) with a **stubbed** `analyzeAnswers()` returning fixed mock data matching
  Contract B — *Dev 2* `[Blocked by: C-1, C-2, D2-1.1, D2-1.3]`

### Developer 3 — AI Module (`backend/src/ai/**`)
- [ ] **[D3-1.1]** Build `analyzeAnswers({ questionText, clos, answers })` matching Contract B —
  *Dev 3* `[Blocked by: C-2] [Unblocks: D3-1.2]`
- [ ] **[D3-1.2]** Build a set of fixture answer sets (e.g. the recursion base-case scenario) and a
  local test script — *Dev 3* `[Blocked by: D3-1.1] [Unblocks: D3-1.3]`
- [ ] **[D3-1.3]** Iterate on prompts against fixtures until misconception grouping, insight, and
  intervention output are reliable — *Dev 3* `[Blocked by: D3-1.2]`

Dev 1's UI work and Dev 3's AI/prompt work have **zero dependency on each other** and can proceed
the entire time without coordination. Dev 2's route/controller and schema/migration work can start
immediately once Contracts A and C are agreed, without waiting on Dev 1 or Dev 3.

---

## 3. AI Module Swap-In

- [ ] **[D2-2.1]** Replace the stub in the three routes with the real import from
  `backend/src/ai/index.js` — *Dev 2* `[Blocked by: D3-1.3, D2-1.5]` — should be a one-line change
  if Contract B was followed
- [ ] **[D2-2.2]** Deploy backend to Railway with real endpoints live — *Dev 2* `[Blocked by:
  D2-2.1, D2-1.4]`

---

## 4. Frontend / Backend Integration

- [ ] **[D1-2.1]** Swap the mock API for real calls to the Railway URL (or `localhost` for local
  testing) — *Dev 1* `[Blocked by: D2-2.2, D1-1.3, D1-1.4, D1-1.5]`

---

## 5. Final Pass, All Three Together

- [ ] **[D1-3.1]** Run the full flow end to end — login, upload, analyze, view results — using the
  recursion base-case scenario as the demo dataset — *All three* `[Blocked by: D1-2.1]`
- [ ] **[D1-3.2]** Rehearse the demo against the checklist in `README.md` — *All three* `[Blocked
  by: D1-3.1]`

---

## ⚡ Direct Handoff Summary Table

| Handoff # | Blocked Task | Assigned | Blocked By / Waiting On | Delivered By |
|---|---|---|---|---|
| **H-1** | Mock API `[D1-1.2]` | **Dev 1** | Contract A agreed `[C-1]` | **All three** |
| **H-2** | Stubbed routes `[D2-1.5]` | **Dev 2** | Contracts A & B agreed `[C-1, C-2]` | **All three** |
| **H-3** | Migrations `[D2-1.2]` | **Dev 2** | Contract C agreed `[C-3]` | **All three** |
| **H-4** | `analyzeAnswers()` `[D3-1.1]` | **Dev 3** | Contract B agreed `[C-2]` | **All three** |
| **H-5** | Real AI import `[D2-2.1]` | **Dev 2** | Working `analyzeAnswers()` passing fixtures `[D3-1.3]` | **Dev 3** |
| **H-6** | Real backend calls `[D1-2.1]` | **Dev 1** | Backend deployed/runnable `[D2-2.2]` | **Dev 2** |
| **H-7** | Full end-to-end demo `[D1-3.1]` | **All three** | Frontend pointed at real backend `[D1-2.1]` | **Dev 1** |

---

## 6. Merge Conflict Avoidance

- Three separate top-level areas (`frontend/`, `backend/` minus `backend/src/ai/`, and
  `backend/src/ai/`) mean no two developers should ever touch the same file.
- If a schema change is needed after Dev 1 or Dev 3 have started, Dev 2 announces it and updates
  Contract C (`C-3`) in this file before changing the migration.
- Any change to Contract A (`C-1`) or Contract B (`C-2`) must be a message to both other
  developers plus an update to this file and the relevant `Developer_N_Task.md`, before the change
  is implemented.
