
# Student Misconception Radar

AI Build Hackathon — Final Round (AUST CSE Carnival <8.0/>, 6 September 2026)
Theme: **AI for Academic Life**

## Problem

After an exam, a faculty member sees per-question scores (e.g. Q1 82%, Q2 76%, Q3 31%) but not *why*
students struggled on a question. Different students can fail the same question for completely
different reasons — a wrong mental model, confusing two related concepts, or a simple syntax slip —
and manually reading through 100 answer scripts to find these patterns is slow and error-prone.

## Solution

Faculty uploads three things:

1. The question paper
2. The student answers (scanned/typed submissions)
3. The course learning outcomes (CLOs)

The AI analyzes every submission for a chosen question and clusters the wrong/partial answers into
**misconception groups**, producing:

- A **Misconception Map** — a breakdown of the class into groups (e.g. "42% base-case
  misconception", "27% stack/heap confusion", "18% syntax mistakes", "13% fully correct")
- An **AI Insight** — a plain-language summary of the dominant misunderstanding
- A **Recommended Intervention** — a short, actionable teaching suggestion (e.g. "spend 15 minutes
  reviewing base-case design before the next topic")

The system does not generate teaching content on demand — it reasons about *what students actually
got wrong* and turns that into something a faculty member can act on immediately.

## Goals

- Give faculty a fast, evidence-based view of class-wide understanding after an exam
- Reduce the manual effort of reading through every script to spot patterns
- Turn raw exam results into a concrete next teaching action, not just a percentage

## Target Users / Roles

| Role | Responsibilities |
|---|---|
| **Faculty** | Uploads question paper, student answers, and CLOs; selects a question to analyze; reviews the Misconception Map, AI Insight, and Recommended Intervention |
| **Admin** *(optional)* | Manages faculty accounts/courses if multi-course support is added |

## Core Features (MVP)

1. **Upload flow** — question paper, student answer set, and CLOs for a course/exam
2. **Question selection** — faculty picks which question to analyze (start with one at a time)
3. **AI analysis** — clusters answers into misconception groups with a percentage breakdown
4. **Misconception Map view** — visual breakdown (group → % of class → short label)
5. **AI Insight** — one clear sentence naming the dominant misunderstanding
6. **Recommended Intervention** — one concrete, time-boxed teaching suggestion

### Possible extensions (not required for MVP)

- History of past exams/questions per course, to track whether an intervention worked next time
- Exporting the Misconception Map as a PDF/slide for department review
- Per-student view (which group a specific student fell into)
- Multi-question analysis in one pass

## Tech Stack & Deployment

| Layer | Technology | Deployment |
|---|---|---|
| Frontend | React + Vite | Vercel |
| Backend | Express.js (Node.js) | Railway |
| Database / BaaS | Supabase (PostgreSQL, Auth, Storage) | Supabase |
| AI | LLM API (question/answer clustering + insight generation) | Called from backend |

## High-Level Flow

```
Faculty uploads (question paper, answers, CLOs)
        │  React (Vercel)
        ▼
POST /api/analyze  →  Express (Railway)
        │
        ├── Store raw files/metadata → Supabase Storage/DB
        ├── Send answers + question + CLOs to AI for clustering
        ▼
AI returns: misconception groups (%), insight, intervention
        │
        ▼
Backend saves result → Supabase DB
        │
        ▼
Frontend fetches result → renders Misconception Map, Insight, Intervention
```

## Database Schema (Supabase)

```
courses        (id, faculty_id, name, code, created_at)
exams          (id, course_id, title, created_at)
questions      (id, exam_id, text, created_at)
clos           (id, question_id, description)
submissions    (id, question_id, answer_text, created_at)
analyses       (id, question_id, misconception_groups jsonb, insight text,
                intervention text, created_at)
```

Row-Level Security scopes every table back to `courses.faculty_id = auth.uid()` so a faculty member
only ever sees their own data.

## Team & Task Division

Work is split three ways by ownership area rather than by rigid layers, so all three developers can
build in parallel from day one:

| File | Developer | Owns |
|---|---|---|
| `plan/Developer_1_Task.md` | Dev 1 | `frontend/**` (React + Vite, Vercel) |
| `plan/Developer_2_Task.md` | Dev 2 | `backend/**` except `backend/src/ai/**`, plus the Supabase schema |
| `plan/Developer_3_Task.md` | Dev 3 | `backend/src/ai/**` — the misconception-clustering engine |

See `plan/Dependency.md` for the API/AI-module contracts that connect the three pieces, the dependency
graph, and the recommended implementation order.

## Environment Variables

Copy `.env.example` to `.env` in each service folder and fill in real values.
**Never commit `.env` — it is already excluded in `.gitignore`.**

- Frontend needs the backend API base URL and (if used directly) the Supabase public/anon key.
- Backend needs the Supabase service role key, database connection info, and the AI provider API key.

## Project Structure (suggested)

```
.
├── frontend/          # React + Vite app (deployed to Vercel)
│   └── .env.example
├── backend/           # Express.js app (deployed to Railway)
│   └── .env.example
├── .gitignore
└── README.md
```

## Getting Started

1. Clone the repo and create your own `.env` files from the `.env.example` templates
2. Backend: `cd backend && npm install && npm run dev`
3. Frontend: `cd frontend && npm install && npm run dev`
4. Set the same Supabase project credentials in both `.env` files
5. Deploy backend to Railway and frontend to Vercel; set the frontend's API base URL to the deployed
   backend URL, and configure CORS on the backend to allow the deployed frontend origin

## Demo Checklist (for judging)

- [ ] Upload a question paper + a batch of student answers + CLOs
- [ ] Select a question and run the analysis
- [ ] Show the Misconception Map with real percentages
- [ ] Show the AI Insight sentence
- [ ] Show the Recommended Intervention
