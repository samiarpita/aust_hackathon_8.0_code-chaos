/**
 * Prompt templates for the Student Misconception Clustering Engine.
 * Tailored for both Code-Based and Theory-Based Academic Computer Science Assessments.
 */

function buildAnalysisPrompt({ questionText, clos = [], answers = [], correctAnswer = null, assignmentType = 'code' }) {
  const isCode = assignmentType === 'code';

  const formattedCLOs = Array.isArray(clos) && clos.length > 0
    ? clos.map((c, i) => typeof c === 'string' ? `- ${c}` : `- ${c.code || `CLO-${i + 1}`}: ${c.description}`).join('\n')
    : isCode
      ? "- Understand algorithmic principles, edge cases, pointer safety, and correct syntax."
      : "- Master theoretical definitions, proofs, protocol invariants, and conceptual frameworks.";

  const formattedAnswers = answers
    .map((ans, idx) => `[Submission ${idx + 1}]:\n${(typeof ans === 'string' ? ans : ans.answer_text || '').trim()}`)
    .join('\n\n');

  const correctAnswerSection = correctAnswer && typeof correctAnswer === 'string' && correctAnswer.trim().length > 0
    ? `\n### Reference / Instructor Benchmark Solution:\n${correctAnswer.trim()}\n`
    : '';

  const domainInstructions = isCode
    ? `### ASSESSMENT TYPE: CODE-BASED PROGRAMMING ASSIGNMENT
You are an expert Computer Science Professor, Static Analysis & Compiler Diagnostician, and Pedagogical Code Reviewer.
Evaluate programming logic, memory dynamics, pointers, edge-cases, algorithmic complexity, syntax, loop invariants, and boundary conditions.

CODE-SPECIFIC MISCONCEPTION PATTERNS TO IDENTIFY:
- Boundary & Base Case Omission (e.g. Missing terminating guard, infinite recursion stack overflow)
- Memory Safety & Lifetime Flaws (e.g. Dangling stack pointer return, unfreed malloc memory leak, wild pointer dereference)
- Pointer & Linkage Corruption (e.g. Cycle creation, lost next reference before reassignment, Arrow -> vs Dot . operator syntax)
- Algorithmic Complexity / Inefficiency (e.g. O(N^2) nested loop when O(N) or O(N log N) is expected, suboptimal greedy choice instead of DP)
- Off-by-one errors and array bounds violations
- Full Concept Mastery (clean, safe, correct implementation)`
    : `### ASSESSMENT TYPE: THEORY & CONCEPTUAL ASSIGNMENT
You are an expert Computer Science Academic Examiner and Conceptual Diagnostician.
Evaluate theoretical definitions, mathematical theorems, relational models, protocol invariants, and descriptive reasoning.

THEORY-SPECIFIC MISCONCEPTION PATTERNS TO IDENTIFY:
- Conflating Related Theorems or Concepts (e.g. Confusing 3NF prime attribute allowance with BCNF strict superkey requirement)
- Incomplete Proofs / Missing Crucial Step (e.g. Missing induction base step, failing to check determinant closures)
- Misunderstanding Protocol Invariants (e.g. Premature lock release in 2PL leading to dirty reads/cascading aborts)
- Superficial / Hand-Waving Reasoning without Core Mechanism (e.g. Stating a conclusion without establishing the formal invariant)
- Reversed Cause-and-Effect or Inverted Asymptotic Bounds
- Full Theoretical Mastery (rigorous, accurate, complete reasoning)`;

  return `You are an expert Computer Science educator, exam diagnostician, and pedagogical analyst.
Your objective is to examine student exam submissions for a specific question, diagnose WHY students failed or struggled, cluster flawed/partial mental models into distinct misconception groups, synthesize a single dominant insight, and provide an actionable, time-boxed teaching intervention.

${domainInstructions}

### Question Prompt:
${questionText}
${correctAnswerSection}
### Intended Course Learning Outcomes (CLOs / Mastery Criteria):
${formattedCLOs}

### Student Submissions (${answers.length} submissions):
${formattedAnswers}

---

### Core Diagnostic Rules & Constraints:
1. **Misconception Clustering (Evidence-Based):**
   - Group submissions based strictly on the UNDERLYING MISCONCEPTION or flawed mental model, not merely superficial similar wording or token matches.
   - Differentiate deep conceptual/algorithmic misunderstandings from superficial syntax/formatting slips.
   - Every submission must logically belong to exactly one category.
   - Always include a "Fully correct" (or "Mastered / No clear misconception") group when student answers are accurate.
   - Produce between 2 and 5 meaningful, distinct, non-overlapping groups.
   - Assign an integer percentage (0-100) of the cohort to each group.
   - The percentages across all groups MUST sum to exactly 100.

2. **AI Insight:**
   - Write exactly ONE clear, plain-language sentence naming the dominant class-wide misconception / root misunderstanding.
   - Focus directly on what students fundamentally misunderstood in this ${isCode ? 'coding' : 'theoretical'} context.

3. **Recommended Intervention:**
   - Write exactly ONE concrete, time-boxed teaching suggestion (e.g., "Spend 15 minutes reviewing ${isCode ? 'base-case design with call-stack traces' : 'BCNF superkey decomposition step-by-step'} in the next session").
   - It must be an immediate classroom action a faculty member can execute next lecture.

---

### Strict Output Contract (JSON Only):
Return ONLY a valid JSON object matching this schema with no surrounding markdown text or explanations:
{
  "misconceptionGroups": [
    {
      "label": "Base case boundary omission",
      "percentage": 42
    },
    {
      "label": "Dangling stack pointer return",
      "percentage": 27
    },
    {
      "label": "Syntax and pointer operator misuse",
      "percentage": 18
    },
    {
      "label": "Fully correct",
      "percentage": 13
    }
  ],
  "insight": "Most students understand recursive calls but fail to identify the base case.",
  "intervention": "Spend 15 minutes reviewing base-case design before the next topic."
}`;
}

module.exports = { buildAnalysisPrompt };
