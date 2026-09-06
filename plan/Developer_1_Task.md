# Developer 1 — Frontend (React + Vite → Vercel)

## Ownership

You own the **entire `frontend/` folder**. No other developer edits files inside it, and you don't
edit anything outside it (see "Do Not Modify" below). Your only dependency on the other two
developers is the **API contract** in `Dependency.md` — you can build your entire app against a
mocked version of it before the backend exists.

## What You're Building

The faculty-facing web app for Student Misconception Radar: log in, upload exam data, trigger an
analysis, and view the results.

### Screens / Features (MVP)

1. **Login** — Supabase Auth (email/password) using `supabase-js` directly from the frontend with
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. On success, keep the Supabase session and attach
   the access token to every backend request as `Authorization: Bearer <token>`.
2. **New Analysis form** — faculty enters/uploads:
   - Question text (textarea, or plain-text file upload)
   - Course learning outcomes (repeatable text inputs or newline-separated textarea)
   - Student answers — for the hackathon MVP, accept a newline- or CSV-separated batch of answer
     texts (one per student). Keep the input format simple; don't build an OCR/scanning pipeline.
3. **Analyze action** — submits the form to `POST /api/analyses` (see contract) and shows a loading
   state while waiting.
4. **Results view**:
   - **Misconception Map** — one bar/donut per group showing `label` and `percentage` (use
     `recharts` or similar; a simple horizontal bar list is fine if time is short)
   - **AI Insight** — the one-sentence summary, shown as a highlighted callout
   - **Recommended Intervention** — the suggested action, shown as a distinct callout (visually
     different from the Insight so faculty can tell "what's wrong" from "what to do about it" at a
     glance)
5. **History list** *(optional/extension — label it clearly as optional in the UI, don't block MVP
   on it)* — past analyses for a course, fetched from `GET /api/analyses?examId=`.

### UI/UX Requirements

This must not look like a generic CRUD template. Specifically:

- Consistent typography and color system — pick one accent color for "insight" and a different one
  for "intervention" and reuse them everywhere those concepts appear
- Real **empty**, **loading**, **error**, and **success** states for the upload form and results
  view — no blank screens or raw error text
- Confirmation before submitting a large answer batch (e.g. "Analyzing 100 answers — this may take
  a moment")
- Responsive layout (works on a laptop demo screen and on a phone)
- Accessible forms — labeled inputs, visible focus states, sufficient color contrast
- The Misconception Map should read clearly to someone seeing it for the first time during judging —
  label percentages directly on the chart, don't rely only on a legend

## Files/Folders You Own

```
frontend/
├── src/
│   ├── pages/            (Login, NewAnalysis, Results, History)
│   ├── components/
│   ├── lib/supabaseClient.js
│   ├── lib/api.js        (fetch wrapper for backend calls)
│   └── ...
├── .env.example          (already created — adjust if you add new VITE_ vars, keep it in sync)
└── vite.config.js
```

## API Contract You Depend On (owned/implemented by Developer 2)

See `Dependency.md` for the full contract. Summary of what you call:

- `POST /api/analyses` — body `{ questionText, clos: string[], answers: string[] }` → returns
  `{ id, misconceptionGroups: [{ label, percentage }], insight, intervention, createdAt }`
- `GET /api/analyses/:id` — same shape as above
- `GET /api/analyses?examId=` — array of the above *(only needed if you build the History list)*

**Until Developer 2's endpoints are live**, build against a local mock (a small `mockApi.js` you own
and delete once the real backend is ready). Do not wait on the backend to start building.

## Validation Rules (client-side)

- Question text and at least 2 student answers are required before "Analyze" is enabled
- Reject file uploads over the size communicated by `MAX_UPLOAD_SIZE_MB` (see backend `.env.example`
  — hardcode the same default, 20MB, unless Developer 2 tells you it changed)
- Never send the Supabase **service role** key from the frontend — only the anon key belongs here

## Testing

- Manual pass through the full flow (login → upload → analyze → results) against the mock API, then
  again against the real deployed backend before the demo
- If time allows, component tests for the form's validation logic and the results view's rendering
  given a fixed sample response

## Acceptance Criteria

- [ ] Faculty can log in with Supabase Auth
- [ ] Faculty can submit a question, CLOs, and a batch of answers
- [ ] Results view correctly renders any valid API response shape, including edge cases (e.g. only
      2 groups, or a 100%-correct result)
- [ ] All four UI states (loading/empty/error/success) are implemented, not just the happy path
- [ ] Deployed and working on Vercel, pointed at the Railway backend URL

## Do Not Modify

- `backend/**` (any of it, including `backend/src/ai/**`)
- Supabase schema/migrations
- `Dependency.md` contract sections without flagging the change to both other developers first

## Shared Contracts You Must Follow

- API request/response shapes in `Dependency.md`
- Auth: send the Supabase access token as a Bearer token on every backend call
- Naming: use the exact field names from the contract (`misconceptionGroups`, `label`,
  `percentage`, `insight`, `intervention`) — do not rename them locally
