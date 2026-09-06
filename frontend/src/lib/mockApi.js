import { samplePrecomputedAnalyses } from './sampleData';

const STORAGE_KEY = 'radar_mock_analyses_v1';

// Seed storage with sample data if empty
const getStoredAnalyses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePrecomputedAnalyses));
      return [...samplePrecomputedAnalyses];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read analyses from localStorage', err);
    return [...samplePrecomputedAnalyses];
  }
};

const saveStoredAnalyses = (analyses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  } catch (err) {
    console.warn('Could not persist analyses to localStorage', err);
  }
};

/**
 * Mock API Engine matching Contract A exactly:
 * - POST /api/analyses -> { questionText, clos, answers }
 * - GET /api/analyses/:id
 * - GET /api/analyses?examId=
 */
export const mockApi = {
  // Simulated POST /api/analyses
  async createAnalysis({ questionText, clos = [], answers = [] }) {
    // Artificial latency to showcase ethereal glass loading animation
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (!questionText || questionText.trim().length === 0) {
      throw new Error("Question text is required.");
    }
    if (!Array.isArray(answers) || answers.length < 2) {
      throw new Error("At least 2 student answers are required to cluster misconceptions.");
    }

    // Heuristic categorization to make the mock output feel alive
    const combinedAnswers = answers.join(" ").toLowerCase();
    const hasRecursion = combinedAnswers.includes("reverse") || combinedAnswers.includes("head") || combinedAnswers.includes("node");
    const hasNullChecks = combinedAnswers.includes("null");

    let misconceptionGroups = [];
    let insight = "";
    let intervention = "";

    if (hasRecursion) {
      misconceptionGroups = [
        {
          label: "Missing Base Case Boundary Check",
          percentage: 38,
          description: "Answers missing the essential `if (head == NULL || head->next == NULL)` guard, resulting in immediate segmentation faults.",
          sampleStudentQuote: answers[1] || "Node* reverse(Node* head) { Node* rest = reverse(head->next); ..."
        },
        {
          label: "Cyclic Self-Referencing Pointer Leak",
          percentage: 25,
          description: "Students inverted the forward pointer via `head->next->next = head` without unlinking `head->next = NULL`.",
          sampleStudentQuote: answers[2] || "head->next = head; return rest;"
        },
        {
          label: "Correct Recursive Inversion & Backtracking",
          percentage: 37,
          description: "Fully sound implementation respecting recursion unwinding semantics and memory bounds.",
          sampleStudentQuote: answers[0] || "if (head == NULL || head->next == NULL) return head; ..."
        }
      ];
      insight = "Most students grasp the recursive invocation step (`reverse(head->next)`), but over 63% fail to secure the unwinding pointer termination or boundary condition.";
      intervention = "Conduct a 15-minute live memory-diagram trace next lecture showing the exact pointer state at recursion depth = 1 versus depth = 0.";
    } else {
      // Dynamic fallback for arbitrary user-entered questions
      misconceptionGroups = [
        {
          label: "Conceptual Misalignment with Core CLO",
          percentage: 45,
          description: `Responses reflect confusion regarding target learning criteria (${clos[0] || 'primary algorithmic intent'}).`,
          sampleStudentQuote: answers[0]?.slice(0, 100) + "..."
        },
        {
          label: "Boundary & Edge Case Omission",
          percentage: 30,
          description: "Solutions fail to validate empty, extreme, or negative input states.",
          sampleStudentQuote: answers[1]?.slice(0, 100) + "..."
        },
        {
          label: "Accurate & Coherent Demonstration",
          percentage: 25,
          description: "Demonstrates complete mastery of the required theoretical and practical concepts.",
          sampleStudentQuote: answers[answers.length - 1]?.slice(0, 100) + "..."
        }
      ];
      insight = `45% of the student cohort exhibits a shared mental model distortion relating to ${clos[0] || 'the fundamental question premise'}, while 30% neglect edge boundaries.`;
      intervention = "Assign a 10-minute diagnostic peer-review exercise where students grade edge-case inputs before the next formative assessment.";
    }

    const newRecord = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      questionText,
      clos,
      answerCount: answers.length,
      misconceptionGroups,
      insight,
      intervention,
      createdAt: new Date().toISOString()
    };

    const currentList = getStoredAnalyses();
    const updatedList = [newRecord, ...currentList];
    saveStoredAnalyses(updatedList);

    return newRecord;
  },

  // Simulated GET /api/analyses/:id
  async getAnalysisById(id) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const list = getStoredAnalyses();
    const found = list.find((item) => item.id === id);
    if (!found) {
      throw new Error(`Analysis with ID "${id}" not found.`);
    }
    return found;
  },

  // Simulated GET /api/analyses?examId=
  async getAnalyses(examId) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const list = getStoredAnalyses();
    if (examId) {
      return list.filter((item) => item.examId === examId);
    }
    return list;
  },

  // Helper to reset to default demo dataset
  resetDemoData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePrecomputedAnalyses));
    return [...samplePrecomputedAnalyses];
  }
};
