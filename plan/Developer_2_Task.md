# Developer 2 — Backend API, Database & Orchestration (Express → Railway, Supabase)

## Ownership

You own **all of `backend/`, except `backend/src/ai/**`**, which belongs to Developer 3. You also
own the Supabase schema/migrations. You call Developer 3's AI module through one function — you
never edit its internals, and they never edit your routes/controllers.

## What You're Building

The API that Developer 1's frontend talks to, and the persistence layer for courses, exams,
questions, submissions, and analysis results.

### Responsibilities

1. **Express app setup** — CORS restricted to the deployed Vercel origin (and localhost for dev),
   JSON body parsing, centralized error handler
2. **Auth middleware** — verify the Supabase JWT sent as `Authorization: Bearer <token>` on every
   protected route; attach the authenticated faculty's user id to `req.user`
3. **Routes/controllers**:
   - `POST /api/analyses` — accept `{ questionText, clos, answers }`, store the question/CLOs/
     answers, call Developer 3's `analyzeAnswers()`, persist the result, return it
   - `GET /api/analyses/:id` — return a stored analysis by id (only if it belongs to the requesting
     faculty)
   - `GET /api/analyses?examId=` — list analyses for an exam *(only needed if Developer 1 builds the
     History list — keep it simple, don't block on it)*
4. **Database schema & migrations** (Supabase/Postgres) — see schema below. Write RLS policies so a
   faculty member can only read/write their own courses/exams/questions/submissions/analyses.
5. **Input validation** — required fields, minimum 2 answers, reasonable max answer count/length
   (use `MAX_UPLOAD_SIZE_MB` from `.env` as your ceiling)
6. **Orchestration** — `POST /api/analyses` is the one place that ties everything together:
   validate → persist raw inputs → call AI module → persist + return result. Keep this in a
   dedicated service function (not directly in the controller) so it's easy to test.

### Suggested Database Schema

```
courses        (id, faculty_id, name, code, created_at)
exams          (id, course_id, title, created_at)
questions      (id, exam_id, text, created_at)
clos           (id, question_id, description)
submissions    (id, question_id, answer_text, created_at)
analyses       (id, question_id, misconception_groups jsonb, insight text,
                intervention text, created_at)
```

RLS: every table above joins back to `courses.faculty_id = auth.uid()`, directly or via the chain
`exams → courses` / `questions → exams → courses`. Only the service role (used server-side only,
never in the frontend) bypasses RLS for writes if needed — prefer scoping every query by the
authenticated user's id.

## Files/Folders You Own

```
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/auth.js
│   ├── services/analysisService.js   (calls ai/index.js — the one integration point)
│   ├── db/
│   │   ├── supabaseClient.js
│   │   └── migrations/
│   └── index.js
└── .env.example          (already created — keep in sync if you add new vars)
```

**You do not touch `backend/src/ai/**`** — you only `import` and call the function it exports.

## API Contract You Implement (Developer 1 depends on this exactly)

```
POST /api/analyses
  headers: Authorization: Bearer <supabase_jwt>
  body:    { questionText: string, clos: string[], answers: string[] }
  200:     { id, misconceptionGroups: [{ label: string, percentage: number }],
             insight: string, intervention: string, createdAt: string }
  400:     { error: string }   // validation failure
  401:     { error: string }   // missing/invalid token

GET /api/analyses/:id
  200: same shape as above
  404: { error: string }

GET /api/analyses?examId=<id>
  200: [ ...same shape as above ]
```

Do not change field names or response shape without updating Developer 1 and `Dependency.md` at the
same time — this contract is what lets both of you work in parallel.

## Contract You Depend On (owned/implemented by Developer 3)

```js
// backend/src/ai/index.js
async function analyzeAnswers({ questionText, clos, answers }) {
  // returns:
  return {
    misconceptionGroups: [{ label: "Base case misconception", percentage: 42 }, /* ... */],
    insight: "Most students understand recursive calls but fail to identify the base case.",
    intervention: "Spend 15 minutes reviewing base-case design before the next topic."
  };
}
module.exports = { analyzeAnswers };
```

**Until Developer 3's module is ready**, write a stub with this exact signature that returns fixed
mock data, so your routes and Developer 1's frontend can both be tested end-to-end immediately.
Swap the stub for the real import once Developer 3 delivers it — this should be a one-line change.

## Testing

- Unit tests for `analysisService` using the stub/mock AI function
- A quick integration test hitting a locally running server (Supabase local or a test project) to
  confirm the full `POST /api/analyses` → DB → response round-trip
- Verify RLS by confirming a second faculty account cannot read the first one's data

## Acceptance Criteria

- [ ] All three routes match the contract exactly (field names, status codes)
- [ ] Auth middleware rejects requests without a valid Supabase token
- [ ] Schema + RLS policies applied via migrations that Developer 1/3 can run locally
- [ ] Deployed on Railway, CORS allows the deployed Vercel origin
- [ ] Real `analyzeAnswers` from Developer 3 is wired in before the demo (stub removed)

## Do Not Modify

- `frontend/**`
- `backend/src/ai/**` internals (call it, don't edit its logic or prompts)

## Shared Contracts You Must Follow

- API contract above (Developer 1's dependency)
- `analyzeAnswers()` function signature above (Developer 3's contract)
- Never expose the Supabase **service role** key to the frontend — it lives only in
  `backend/.env`
