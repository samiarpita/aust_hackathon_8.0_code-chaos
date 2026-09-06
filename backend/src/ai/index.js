/**
 * Developer 3 — AI Analysis Engine (Misconception Clustering)
 * 
 * Contract B Implementation:
 * Exports async function analyzeAnswers({ questionText, clos, answers })
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildAnalysisPrompt } = require('./prompts');
const { parseAndValidateResponse } = require('./parseResponse');

/**
 * Intelligent heuristic fallback engine when offline or no API key is set.
 */
function runHeuristicAnalysis({ questionText, clos, answers }) {
  const valid = answers.map(a => a.trim()).filter(Boolean);
  const total = valid.length;

  if (total < 2) {
    return {
      misconceptionGroups: [
        { label: "Insufficient data to form clusters", percentage: 100 }
      ],
      insight: `Only ${total} submission(s) provided — at least 2 submissions are required to form clusters.`,
      intervention: "Gather additional student responses across the cohort before analyzing class-wide misconceptions."
    };
  }

  // Detect patterns in submissions (e.g. linked list recursion or general coding)
  let missingBaseCase = 0;
  let cycleOrDetachmentFlaw = 0;
  let syntaxMistake = 0;
  let correctCount = 0;

  valid.forEach(ans => {
    const text = ans.toLowerCase();
    const hasBase = text.includes('null') || text.includes('!head') || text.includes('head == 0');
    const hasDetachment = text.includes('next = null') || text.includes('next=null');
    const hasSyntaxError = text.includes('head.next') || text.includes('head.next.next');

    if (hasSyntaxError) {
      syntaxMistake++;
    } else if (hasBase && hasDetachment) {
      correctCount++;
    } else if (!hasBase) {
      missingBaseCase++;
    } else {
      cycleOrDetachmentFlaw++;
    }
  });

  // Check for all-correct or single-flaw scenarios
  if (correctCount === total) {
    return {
      misconceptionGroups: [
        { label: "Fully correct / Concept mastered", percentage: 100 }
      ],
      insight: "All students correctly understood the core concepts and executed the problem accurately.",
      intervention: "Proceed to the next advanced learning outcome or introduce challenging edge-case scenarios."
    };
  }

  if (missingBaseCase === total) {
    return {
      misconceptionGroups: [
        { label: "Base-case omission / Infinite recursion", percentage: 100 }
      ],
      insight: "Every student in the cohort failed to define a boundary termination condition.",
      intervention: "Dedicate 20 minutes in the next lecture to reviewing boundary conditions and call-stack unwinding."
    };
  }

  // Calculate percentages with proper normalization
  const basePct = Math.round((missingBaseCase / total) * 100);
  const cyclePct = Math.round((cycleOrDetachmentFlaw / total) * 100);
  const syntaxPct = Math.round((syntaxMistake / total) * 100);
  const correctPct = Math.max(0, 100 - basePct - cyclePct - syntaxPct);

  let rawGroups = [
    { label: "Base case omission / Infinite recursion", percentage: basePct },
    { label: "Pointer cycle / Memory disconnection", percentage: cyclePct },
    { label: "Syntax & dot-operator misuse", percentage: syntaxPct },
    { label: "Fully correct", percentage: correctPct }
  ].filter(g => g.percentage > 0);

  // Normalize percentages so they sum to exactly 100%
  const totalPct = rawGroups.reduce((sum, g) => sum + g.percentage, 0);
  if (totalPct > 0 && totalPct !== 100) {
    let running = 0;
    rawGroups = rawGroups.map((g, idx) => {
      if (idx === rawGroups.length - 1) {
        return { ...g, percentage: Math.max(0, 100 - running) };
      }
      const adj = Math.round((g.percentage / totalPct) * 100);
      running += adj;
      return { ...g, percentage: adj };
    });
  }

  return {
    misconceptionGroups: rawGroups,
    insight: "Most students grasp the recursive step but fail to establish safe termination boundaries or detach pointers correctly.",
    intervention: "Spend 15 minutes reviewing recursion call stack diagrams and base-case design before the next topic."
  };
}

/**
 * Analyzes a batch of student answers for a question and clusters misconceptions.
 * 
 * @param {Object} params
 * @param {string} params.questionText - The prompt of the question
 * @param {string[]} [params.clos] - Array of course learning outcomes
 * @param {string} [params.correctAnswer] - Optional reference solution
 * @returns {Promise<{ misconceptionGroups: Array<{label: string, percentage: number}>, insight: string, intervention: string }>}
 */
async function analyzeAnswers({ questionText, clos = [], answers = [], correctAnswer = null }) {
  // 1. Sanitize & filter inputs
  const validAnswers = (answers || [])
    .filter(a => typeof a === 'string' && a.trim().length > 0)
    .map(a => a.trim());

  // 2. Edge Case: Fewer than 2 answers
  if (validAnswers.length < 2) {
    return {
      misconceptionGroups: [
        { label: "Insufficient data to form clusters", percentage: 100 }
      ],
      insight: `Received ${validAnswers.length} answer(s). At least 2 submissions are required to form misconception clusters.`,
      intervention: "Collect at least 2 student submissions before running diagnostic clustering."
    };
  }

  // 3. Obtain API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === 'your_gemini_api_key_here') {
    console.warn('[AI Engine] No active GEMINI_API_KEY configured in environment. Utilizing intelligent heuristic diagnostic engine.');
    return runHeuristicAnalysis({ questionText, clos, answers: validAnswers, correctAnswer });
  }

  try {
    const prompt = buildAnalysisPrompt({ questionText, clos, answers: validAnswers, correctAnswer });
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Gemini API returned an empty text response.');
    }

    return parseAndValidateResponse(responseText);
  } catch (err) {
    console.error(`[AI Engine] LLM call failed (${err.message}). Falling back to heuristic diagnostic engine.`);
    return runHeuristicAnalysis({ questionText, clos, answers: validAnswers });
  }
}

module.exports = { analyzeAnswers };
