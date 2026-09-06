/**
 * Prompt templates for the Student Misconception Clustering Engine.
 * Tailored for Computer Science & Academic assessment diagnostic analysis.
 */

function buildAnalysisPrompt({ questionText, clos = [], answers = [], correctAnswer = null }) {
  const formattedCLOs = Array.isArray(clos) && clos.length > 0
    ? clos.map((c, i) => typeof c === 'string' ? `- ${c}` : `- ${c.code || `CLO-${i + 1}`}: ${c.description}`).join('\n')
    : "- Demonstrate mastery of core algorithmic principles, boundary conditions, and correct syntax.";

  const formattedAnswers = answers
    .map((ans, idx) => `[Submission ${idx + 1}]:\n${(typeof ans === 'string' ? ans : ans.answer_text || '').trim()}`)
    .join('\n\n');

  const correctAnswerSection = correctAnswer && typeof correctAnswer === 'string' && correctAnswer.trim().length > 0
    ? `\n### Reference / Instructor Solution:\n${correctAnswer.trim()}\n`
    : '';

  return `You are an expert Computer Science educator, exam diagnostician, and pedagogical analyst.
Your objective is to examine student exam submissions for a specific question, diagnose WHY students failed or struggled, cluster flawed/partial mental models into distinct misconception groups, synthesize a single dominant insight, and provide an actionable, time-boxed teaching intervention.

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
   - Do NOT invent or hallucinate a misconception without direct evidence in the provided student submissions.
   - Differentiate deep conceptual misunderstandings (e.g. omitting base case, recursive stack cycle, memory allocation misuse) from syntax/implementation slips.
   - Every submission must logically belong to exactly one category.
   - Always include a "Fully correct" (or "Mastered / No clear misconception") group when student answers are accurate.
   - Produce between 2 and 5 meaningful, distinct, non-overlapping groups.
   - Assign an integer percentage (0-100) of the cohort to each group.
   - The percentages across all groups MUST sum to exactly 100.

2. **AI Insight:**
   - Write exactly ONE clear, plain-language sentence naming the dominant class-wide misconception / root misunderstanding.
   - Focus directly on what students fundamentally misunderstood.

3. **Recommended Intervention:**
   - Write exactly ONE concrete, time-boxed teaching suggestion (e.g., "Spend 15 minutes reviewing base-case design with a 3-node call-stack trace before starting trees").
   - It must be an immediate classroom action a faculty member can execute next session.

---

### Strict Output Contract (JSON Only):
Return ONLY a valid JSON object matching this schema with no surrounding markdown text or explanations:
{
  "misconceptionGroups": [
    {
      "label": "Base case misconception",
      "percentage": 42
    },
    {
      "label": "Stack/heap confusion",
      "percentage": 27
    },
    {
      "label": "Syntax mistakes",
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
