/**
 * Contract B — AI Analysis Engine
 * Signature: analyzeAnswers({ questionText, clos, answers })
 * 
 * Developer 2 Stub / Fallback implementation.
 * Developer 3 will enhance and wire real LLM prompt clustering here.
 */
async function analyzeAnswers({ questionText, clos = [], answers = [] }) {
  // Defensive validation on inputs
  if (!answers || answers.length === 0) {
    return {
      misconceptionGroups: [{ label: 'Insufficient data', percentage: 100 }],
      insight: 'Not enough submissions provided to identify class-wide misconceptions.',
      intervention: 'Collect at least 5 student submissions before running misconception analysis.'
    };
  }

  // Check if answers show recursion/base case scenario
  const sampleAnswersCombined = answers.map(a => (typeof a === 'string' ? a : a.answer_text || '')).join(' ').toLowerCase();

  if (sampleAnswersCombined.includes('reverse') || sampleAnswersCombined.includes('head') || sampleAnswersCombined.includes('recursive')) {
    return {
      misconceptionGroups: [
        { label: 'Base case omission or improper termination', percentage: 38 },
        { label: 'Pointer disconnection during unwinding phase', percentage: 25 },
        { label: 'Syntax & pointer dereferencing errors (. vs ->)', percentage: 12 },
        { label: 'Fully correct logic & boundary handling', percentage: 25 }
      ],
      insight: 'Most students grasp recursive linked list traversal but fail to safely handle single-node base case termination and pointer rewiring.',
      intervention: 'Spend 15 minutes live-tracing recursion stack unwinding with a 3-node diagram before the next lab session.'
    };
  }

  // Default realistic grouping matching Contract B rules
  return {
    misconceptionGroups: [
      { label: 'Fundamental conceptual misunderstanding', percentage: 45 },
      { label: 'Boundary condition / edge case mishandling', percentage: 30 },
      { label: 'Syntax & implementation slips', percentage: 10 },
      { label: 'Fully correct answer', percentage: 15 }
    ],
    insight: 'The majority of students understand the core principle but struggle with boundary condition validation.',
    intervention: 'Spend 15 minutes reviewing boundary condition test cases and edge cases with the class.'
  };
}

module.exports = {
  analyzeAnswers
};
