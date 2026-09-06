# Developer 3 — AI Analysis Engine (Misconception Clustering)

## Ownership

You own **`backend/src/ai/**` exclusively**. This is the one piece of the system that can be built
and tested completely on its own — you don't need the Express server, the database, or the frontend
running to do your work. You need Node.js and the `AI_API_KEY` from `backend/.env`.

## What You're Building

The function that turns a question + student answers + course learning outcomes into a
misconception breakdown, an insight, and a recommended intervention. This is the intellectual core
of the project — the thing that makes it "understand what students actually misunderstood" rather
than just generating content.

### Contract (do not change the signature without telling Developer 2)

```js
// backend/src/ai/index.js
async function analyzeAnswers({ questionText, clos, answers }) {
  // questionText: string
  // clos: string[]           — course learning outcomes, for context on what mastery looks like
  // answers: string[]        — one entry per student submission for this question
  //
  // returns:
  return {
    misconceptionGroups: [
      { label: "Base case misconception", percentage: 42 },
      { label: "Stack/heap confusion", percentage: 27 },
      { label: "Syntax mistakes", percentage: 18 },
      { label: "Fully correct", percentage: 13 }
    ],
    insight: "Most students understand recursive calls but fail to identify the base case.",
    intervention: "Spend 15 minutes reviewing base-case design before the next topic."
  };
}
module.exports = { analyzeAnswers };
```

Rules for the output:
- `percentage` values across all groups should sum to ~100 (rounding is fine)
- 2–6 groups is the expected range; don't force more groups than the data supports
- Always include a "fully correct" or "no clear misconception" group when applicable, so the
  percentages account for the whole class
- `insight` is one sentence, plain language, naming the *dominant* pattern — not a list of every
  group
- `intervention` is one concrete, time-boxed teaching suggestion a faculty member could act on
  immediately (e.g. "spend 15 minutes on X"), not generic advice like "review the material more"

### Approach

1. **Design the prompt(s)** — likely a single well-structured prompt to the AI provider that gives
   it the question, CLOs, and the full batch of answers, and asks it to (a) group the wrong/partial
   answers by underlying misconception, (b) estimate the percentage per group, (c) write the insight
   sentence, (d) write the intervention. Ask for strict JSON output matching the contract above so
   `analyzeAnswers` can parse it directly.
2. **Handle scale** — if the answer batch is large, decide whether to send it in one call or batch/
   summarize first; document whichever approach you pick.
3. **Handle edge cases**:
   - Fewer than ~5 answers (not enough signal — return a single "insufficient data" group rather
     than fabricating clusters)
   - All answers fully correct
   - All answers wrong in the same way (one dominant group near 100%)
   - Malformed/empty answer strings — filter them out before analysis, don't crash

## Files/Folders You Own

```
backend/src/ai/
├── index.js           (exports analyzeAnswers — the only import Developer 2 uses)
├── prompts.js          (prompt template(s))
├── parseResponse.js    (parses/validates the AI's JSON output against the contract)
└── __fixtures__/       (2–3 sample question+answer sets for local testing, e.g. the
                          recursion base-case example from the problem statement)
```

Also provide a tiny local test script (e.g. `backend/src/ai/localTest.js`, run with
`node src/ai/localTest.js`) that calls `analyzeAnswers` on a fixture and prints the result — this
lets you iterate on prompts without starting the Express server.

## Testing

- Run your local test script against all fixtures before handing off to Developer 2
- Verify: output shape matches the contract, percentages sum to ~100, insight/intervention are
  non-empty and specific (not generic filler text)
- Test at least one edge case (very small answer batch, or all-correct batch)

## Acceptance Criteria

- [ ] `analyzeAnswers({ questionText, clos, answers })` matches the contract signature and return
      shape exactly
- [ ] Produces sensible, distinct groups on the recursion base-case example from the problem
      statement (or an equivalent CSE-course example you construct)
- [ ] Handles the edge cases above without throwing
- [ ] Handed off to Developer 2 with the local test script and fixtures included, so they can verify
      it themselves before wiring it into the API

## Do Not Modify

- `frontend/**`
- `backend/src/routes/**`, `backend/src/controllers/**`, `backend/src/middleware/**`,
  `backend/src/db/**`

## Shared Contract You Must Follow

- The `analyzeAnswers()` function signature and return shape above — this is the single integration
  point between you and Developer 2. Any change to it must be agreed with them first, since it
  changes what the API returns to the frontend too.
