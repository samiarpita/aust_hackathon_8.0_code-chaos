import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  X, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  FileCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Code,
  BookOpen,
  ShieldCheck,
  Lock,
  Unlock,
  Layers,
  Terminal,
  FileText,
  Building2,
  Check
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { MAX_UPLOAD_SIZE_MB, MAX_UPLOAD_BYTES, apiClient } from '../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';

const PRESET_TEMPLATES = {
  code: [
    {
      id: 'Q1',
      label: 'Recursion Call Stack (C)',
      courseCode: 'CSE 2100',
      courseName: 'Data Structures and Algorithms',
      assignmentTitle: 'Assignment 1: Recursion & Boundary Conditions',
      questionNumber: 'Q1',
      prompt: "Explain why a base case is mandatory in recursion and write a recursive C function int sum(int n) that calculates the sum of numbers from 1 to n.",
      correctAnswer: `int sum(int n) {\n  // 1. Base Case: stop when n reaches 0\n  if (n <= 0) return 0;\n  // 2. Recursive call\n  return n + sum(n - 1);\n}`,
      clos: [
        "CLO 1: Understand call stack frame creation and unwinding",
        "CLO 2: Prevent stack overflow in recursive definitions"
      ],
      sampleAnswers: [
        "A base case is an if condition that stops recursion so the stack does not overflow.\n\nint sum(int n) { if(n<=0) return 0; return n+sum(n-1); }",
        "Recursion keeps calling itself until memory runs out.\n\nint sum(int n) { return n + sum(n - 1); }",
        "Base case terminates the function.\n\nint sum(int n) { if (n == 0) return 0; return n + sum(n - 1); }",
        "int sum(int n) {\n  if (n <= 0) return 0;\n  return n + sum(n - 1);\n}",
        "int sum(int n) {\n  return n + sum(n - 1); // missing termination\n}"
      ]
    },
    {
      id: 'Q3',
      label: 'Linked List Reversal (C)',
      courseCode: 'CSE 2100',
      courseName: 'Data Structures and Algorithms',
      assignmentTitle: 'Midterm Exam Assessment',
      questionNumber: 'Q3',
      prompt: "Write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list. Explain your base case condition and pointer redirection.",
      correctAnswer: `Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`,
      clos: [
        "CLO 1: Understand recursion boundary conditions",
        "CLO 2: Analyze dynamic pointer manipulation without memory leaks"
      ],
      sampleAnswers: [
        "Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
        "Node* reverse(Node* head) {\n  if (head == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
        "Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
        "Node* reverse(Node* head) {\n  while(head != NULL) {\n    Node* next = head->next;\n    head->next = prev;\n    prev = head;\n    head = next;\n  }\n  return prev;\n}"
      ]
    },
    {
      id: 'Q5_ALGO2',
      label: '0/1 Knapsack DP State (Algo)',
      courseCode: 'CSE 2201',
      courseName: 'Algorithms & Complexity',
      assignmentTitle: 'Assignment 2: Dynamic Programming',
      questionNumber: 'Q5',
      prompt: "Explain why greedy choice fails for 0/1 Knapsack. Write the dynamic programming state transition dp[i][w] to find maximum value with capacity W and items {wt[i], val[i]}.",
      correctAnswer: `Greedy choice fails because items cannot be fractionally divided.\nDP Transition:\nif wt[i-1] <= w:\n  dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w])\nelse:\n  dp[i][w] = dp[i-1][w]`,
      clos: [
        "CLO 3: Synthesize dynamic programming states and distinguish overlapping subproblems from greedy choice"
      ],
      sampleAnswers: [
        "dp[i][w] = dp[i-1][w] + val[i];\nWe pick the item with highest val/weight ratio greedily.",
        "Greedy fails because taking high ratio items can leave empty weight. DP transition takes max(include, exclude): dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]).",
        "dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w]) when weight fits.",
        "Greedy choice always works if we sort items by value per weight descending."
      ]
    }
  ],
  theory: [
    {
      id: 'Q4_ALGO1',
      label: 'Master Theorem Asymptotics (Theory)',
      courseCode: 'CSE 2201',
      courseName: 'Algorithms & Complexity',
      assignmentTitle: 'Assignment 1: Divide & Conquer Recurrences',
      questionNumber: 'Q4',
      prompt: "State the Master Theorem conditions. Solve T(n) = 2T(n/2) + O(n) and state the tight asymptotic bound with explanation.",
      correctAnswer: "Using Master Theorem: T(n) = aT(n/b) + f(n)\na = 2, b = 2 => log_b(a) = log_2(2) = 1.\nf(n) = O(n) = Theta(n^1).\nThis matches Case 2: f(n) = Theta(n^{log_b(a)}).\nTherefore, T(n) = Theta(n^{log_b(a)} * log n) = Theta(n log n).",
      clos: [
        "CLO 1: Formulate and solve recurrence relations using asymptotic analysis"
      ],
      sampleAnswers: [
        "T(n) = 2T(n/2) + O(n)\nHere a=2, b=2, f(n)=n. Since a=b, time complexity is O(n^2).",
        "Using Master Theorem Case 2: a=2, b=2, log2(2)=1, so f(n)=n matches n^1. Complexity is Theta(n log n) because work across all recursion levels is balanced.",
        "T(n) = O(n) because at each step we do linear work and divide the array into halves.",
        "By Master theorem Case 2, T(n) = Theta(n log n) because work per level is constant across tree depth."
      ]
    },
    {
      id: 'Q6_DBMS1',
      label: '3NF vs BCNF Normalization (Theory)',
      courseCode: 'CSE 3103',
      courseName: 'Database Management Systems',
      assignmentTitle: 'Assignment 1: Relational Schema Normalization',
      questionNumber: 'Q6',
      prompt: "Given relation R(A, B, C, D) with FDs: AB -> C, C -> D, D -> A. Find all candidate keys and determine whether R is in 3NF and BCNF.",
      correctAnswer: "1. Closures: (AB)+ = {A,B,C,D}, (BC)+ = {A,B,C,D}, (BD)+ = {A,B,C,D}.\nCandidate Keys: AB, BC, BD.\nPrime attributes: A, B, C, D (all attributes are prime!).\n2. 3NF check: All FDs have prime RHS => R is in 3NF.\n3. BCNF check: For C -> D, C is not a superkey => R is NOT in BCNF.",
      clos: [
        "CLO 2: Evaluate functional dependencies and perform loss-less relational decompositions"
      ],
      sampleAnswers: [
        "Candidate key is {A, B}.\nSince all attributes are in keys, R is in BCNF without any decomposition.",
        "Candidate keys are AB, BC, BD. Prime attributes are {A, B, C, D}. All FDs have prime RHS so R is in 3NF. But C is not a superkey for C->D, so R is NOT in BCNF.",
        "R is not in 3NF because there are transitive dependencies C->D and D->A.",
        "Candidate keys are AB and BC. Since prime attributes exist, R is in 3NF and BCNF."
      ]
    },
    {
      id: 'Q7_DBMS2',
      label: 'Strict 2-Phase Locking (Theory)',
      courseCode: 'CSE 3103',
      courseName: 'Database Management Systems',
      assignmentTitle: 'Assignment 2: ACID Transactions & Concurrency',
      questionNumber: 'Q7',
      prompt: "Explain the difference between Standard 2PL and Strict 2PL. How does Strict 2PL prevent cascading aborts?",
      correctAnswer: "Standard 2PL has growing phase (acquire) and shrinking phase (release anytime before commit).\nStrict 2PL requires all exclusive (X) locks to be held until the transaction explicitly COMMITS or ABORTS.\nHow it prevents cascading aborts: No other transaction can read uncommitted dirty data written by T. If T aborts, no other transaction has read its intermediate values, eliminating cascading rollbacks.",
      clos: [
        "CLO 4: Analyze ACID properties and concurrency control isolation levels in multi-user DBMS environments"
      ],
      sampleAnswers: [
        "Standard 2PL locks data items. Strict 2PL is when transactions release locks immediately after updating a row so other transactions do not wait.",
        "Standard 2PL releases locks before commit. Strict 2PL holds all write locks until transaction finishes with commit/abort, ensuring nobody reads dirty data and preventing cascading aborts.",
        "Strict 2PL locks all database tables exclusively so transactions run serially one by one.",
        "Strict 2PL prevents deadlocks by rolling back all conflicting transactions immediately."
      ]
    }
  ]
};

export default function NewAnalysisPage({ onAnalysisSuccess, initialDataset = null }) {
  const { analyze, isAnalyzing, demoDataset } = useAnalysis();

  // Assignment Type: 'code' vs 'theory'
  const [assignmentType, setAssignmentType] = useState('code');

  // Course & Assignment Meta
  const [courseCode, setCourseCode] = useState('CSE 2100');
  const [courseName, setCourseName] = useState('Data Structures and Algorithms');
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseCode, setCustomCourseCode] = useState('');
  const [customCourseName, setCustomCourseName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('Midterm Examination Fall 2026');
  const [questionNumber, setQuestionNumber] = useState('Q3');

  // Question & Benchmark Solution Text
  const [questionText, setQuestionText] = useState(
    initialDataset?.questionText || 
    "Explain how the base case works in recursion and write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list."
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    `Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`
  );

  // CLOs
  const [clos, setClos] = useState(initialDataset?.clos || [
    "CLO 1: Understand recursion boundary conditions",
    "CLO 2: Analyze dynamic pointer manipulation without memory leaks"
  ]);
  const [newCloInput, setNewCloInput] = useState('');

  // Release solution to students checkbox
  const [autoApproveSolution, setAutoApproveSolution] = useState(false);

  // Student Answers Text
  const [answersText, setAnswersText] = useState(initialDataset ? initialDataset.answers?.join('\n---\n') : demoDataset.answers.join('\n---\n'));
  const [fileError, setFileError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [syncNotice, setSyncNotice] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Live submissions count
  const [livePortalSubmissions, setLivePortalSubmissions] = useState([]);
  const [isLoadingLiveSubmissions, setIsLoadingLiveSubmissions] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch live student submissions for current question if applicable
  const fetchLiveSubmissions = React.useCallback(async (qKey) => {
    setIsLoadingLiveSubmissions(true);
    try {
      const data = await apiClient.getQuestionSubmissions(qKey);
      if (Array.isArray(data)) {
        setLivePortalSubmissions(data);
      }
    } catch (err) {
      console.warn('Could not fetch live question submissions:', err);
    } finally {
      setIsLoadingLiveSubmissions(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSubmissions(questionNumber);
  }, [questionNumber]);

  // Parse student answers
  const parsedAnswers = React.useMemo(() => {
    if (!answersText.trim()) return [];
    if (answersText.includes('---')) {
      return answersText.split('---').map((s) => s.trim()).filter(Boolean);
    }
    return answersText.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean);
  }, [answersText]);

  const isValid = questionText.trim().length > 0 && parsedAnswers.length >= 2;

  // Apply a template preset
  const handleApplyTemplate = (tmpl) => {
    setCourseCode(tmpl.courseCode);
    setCourseName(tmpl.courseName);
    setIsCustomCourse(false);
    setAssignmentTitle(tmpl.assignmentTitle);
    setQuestionNumber(tmpl.questionNumber);
    setQuestionText(tmpl.prompt);
    setCorrectAnswer(tmpl.correctAnswer);
    setClos(tmpl.clos);
    setAnswersText(tmpl.sampleAnswers.join('\n---\n'));
    fetchLiveSubmissions(tmpl.id);
  };

  const handleLoadLiveSubmissions = async () => {
    try {
      setIsLoadingLiveSubmissions(true);
      const data = await apiClient.getQuestionSubmissions(questionNumber);
      if (Array.isArray(data) && data.length > 0) {
        const liveTexts = data.map(s => s.answerText).filter(Boolean);
        if (liveTexts.length > 0) {
          setAnswersText(liveTexts.join('\n---\n'));
          setSyncNotice(`✓ Synced ${data.length} live submissions from student portal for ${questionNumber}!`);
          setTimeout(() => setSyncNotice(null), 5000);
          return;
        }
      }
      setSyncNotice(`No live submissions found for ${questionNumber} yet.`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err) {
      console.warn('Error loading live submissions:', err);
    } finally {
      setIsLoadingLiveSubmissions(false);
    }
  };

  // CLO Tag Actions
  const handleAddClo = () => {
    const trimmed = newCloInput.trim();
    if (trimmed && !clos.includes(trimmed)) {
      setClos([...clos, trimmed]);
      setNewCloInput('');
    }
  };

  const handleRemoveClo = (index) => {
    setClos(clos.filter((_, i) => i !== index));
  };

  // Handle CSV/TXT upload
  const handleCsvUpload = (file) => {
    setFileError(null);
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError(`File exceeds maximum size of ${MAX_UPLOAD_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (typeof content === 'string') {
        if (file.name.endsWith('.csv')) {
          const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          const clean = lines[0]?.toLowerCase().includes('answer') ? lines.slice(1) : lines;
          setAnswersText(clean.join('\n---\n'));
        } else {
          setAnswersText(content);
        }
      }
    };
    reader.onerror = () => {
      setFileError("Could not read uploaded file.");
    };
    reader.readAsText(file);
  };

  // Run Analysis
  const executeAnalysis = async () => {
    setFormError(null);
    try {
      const finalCourseCode = isCustomCourse ? customCourseCode.trim().toUpperCase() : courseCode;
      const finalCourseName = isCustomCourse ? customCourseName.trim() : courseName;

      const result = await analyze({
        questionText: questionText.trim(),
        clos,
        answers: parsedAnswers,
        correctAnswer: correctAnswer.trim(),
        assignmentType,
        courseCode: finalCourseCode,
        courseName: finalCourseName,
        assignmentTitle: assignmentTitle.trim(),
        questionNumber: questionNumber.trim(),
        isSolutionApproved: autoApproveSolution
      });

      onAnalysisSuccess(result);
    } catch (err) {
      setFormError(err.message || "Failed to complete misconception analysis.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    if (parsedAnswers.length > 50) {
      setShowConfirmModal(true);
    } else {
      executeAnalysis();
    }
  };

  const currentTemplates = PRESET_TEMPLATES[assignmentType] || PRESET_TEMPLATES.code;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        count={parsedAnswers.length}
        onConfirm={() => {
          setShowConfirmModal(false);
          executeAnalysis();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Create New Misconception Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5B82] dark:text-[#CAB7E4] mt-1">
            Author assignments on your own (Code or Theory), formulate rubrics, and run AI cognitive clustering.
          </p>
        </div>

        {/* Quick Demo Loader */}
        <button
          type="button"
          onClick={() => handleApplyTemplate(PRESET_TEMPLATES.code[1])}
          className="px-4 py-2 rounded-xl glass-surface-elevated hover:border-[#7847EB]/40 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Dataset</span>
        </button>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Loading State Overlay */}
      {isAnalyzing ? (
        <div className="p-12 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Analyzing {assignmentType === 'code' ? 'Code Logic & Memory Dynamics' : 'Theoretical Definitions & Proofs'}...
          </h3>
          <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] max-w-sm mx-auto">
            Evaluating {parsedAnswers.length} student submissions against your {assignmentType === 'code' ? 'reference code' : 'theoretical benchmark'} and clustering misconceptions...
          </p>
        </div>
      ) : (
        /* Step-by-Step Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1 — Assignment Mode Selection (Code vs Theory) */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 1 — Choose Assignment Type & Domain <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-[#7847EB] dark:text-[#B388FF] font-semibold">
                Specialized AI Judging
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setAssignmentType('code');
                  handleApplyTemplate(PRESET_TEMPLATES.code[0]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  assignmentType === 'code'
                    ? 'bg-gradient-to-br from-[#7847EB]/15 to-[#EC4899]/15 border-[#7847EB] dark:border-[#B388FF] shadow-md'
                    : 'glass-surface border-[#B49BDE]/20 hover:border-[#7847EB]/40'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  assignmentType === 'code' ? 'bg-[#7847EB] text-white' : 'bg-black/5 dark:bg-white/5 text-[#6C5B82] dark:text-[#CAB7E4]'
                }`}>
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD]">
                      Code-Based Assignment
                    </h3>
                    {assignmentType === 'code' && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
                    Evaluates programming syntax, boundary checks, memory leaks, pointers, recursions, and algorithm complexity.
                  </p>
                </div>
              </button>

              {/* Theory Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setAssignmentType('theory');
                  handleApplyTemplate(PRESET_TEMPLATES.theory[0]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  assignmentType === 'theory'
                    ? 'bg-gradient-to-br from-[#DB2777]/15 to-[#7847EB]/15 border-[#DB2777] shadow-md'
                    : 'glass-surface border-[#B49BDE]/20 hover:border-[#DB2777]/40'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  assignmentType === 'theory' ? 'bg-[#DB2777] text-white' : 'bg-black/5 dark:bg-white/5 text-[#6C5B82] dark:text-[#CAB7E4]'
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD]">
                      Theory & Conceptual Assignment
                    </h3>
                    {assignmentType === 'theory' && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
                    Evaluates theoretical proofs, definitions, 3NF/BCNF normalization, ACID transaction locks, and protocol invariants.
                  </p>
                </div>
              </button>
            </div>

            {/* Quick Presets for this domain */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#6C5B82] dark:text-[#CAB7E4] block mb-2">
                Quick Template Presets for {assignmentType === 'code' ? 'Code-Based' : 'Theory-Based'} Assessment:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentTemplates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-surface border border-[#B49BDE]/20 hover:border-[#7847EB]/40 text-[#231735] dark:text-[#FAF7FD] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-[#7847EB] dark:text-[#B388FF]" />
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 — Course, Assignment & Question Setup */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 2 — Course & Assignment Metadata <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                Links analysis to course catalog
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Course Selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#6C5B82] dark:text-[#CAB7E4] mb-1">
                  Course
                </label>
                <select
                  value={isCustomCourse ? 'CUSTOM' : courseCode}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomCourse(true);
                    } else {
                      setIsCustomCourse(false);
                      setCourseCode(e.target.value);
                      if (e.target.value === 'CSE 2100') setCourseName('Data Structures and Algorithms');
                      if (e.target.value === 'CSE 2201') setCourseName('Algorithms & Complexity');
                      if (e.target.value === 'CSE 3103') setCourseName('Database Management Systems');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold"
                >
                  <option value="CSE 2100">CSE 2100 — Data Structures</option>
                  <option value="CSE 2201">CSE 2201 — Algorithms & Complexity</option>
                  <option value="CSE 3103">CSE 3103 — DBMS</option>
                  <option value="CUSTOM">+ Add Custom Course...</option>
                </select>
              </div>

              {/* Assignment Title */}
              <div>
                <label className="block text-[11px] font-bold text-[#6C5B82] dark:text-[#CAB7E4] mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Assignment 1 / Midterm Exam"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Question Number / Tag */}
              <div>
                <label className="block text-[11px] font-bold text-[#6C5B82] dark:text-[#CAB7E4] mb-1">
                  Question Number / Tag
                </label>
                <input
                  type="text"
                  value={questionNumber}
                  onChange={(e) => setQuestionNumber(e.target.value)}
                  placeholder="e.g. Q1, Task 2"
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Custom Course Fields */}
            {isCustomCourse && (
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#B49BDE]/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#7847EB] dark:text-[#B388FF] mb-1">
                    Custom Course Code
                  </label>
                  <input
                    type="text"
                    value={customCourseCode}
                    onChange={(e) => setCustomCourseCode(e.target.value)}
                    placeholder="e.g. CSE 4107"
                    className="w-full p-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7847EB] dark:text-[#B388FF] mb-1">
                    Custom Course Name
                  </label>
                  <input
                    type="text"
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence & Neural Networks"
                    className="w-full p-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* Question Text */}
            <div>
              <label className="block text-[11px] font-bold text-[#6C5B82] dark:text-[#CAB7E4] mb-1">
                Question Prompt / Problem Description
              </label>
              <textarea
                rows={3}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter exam question prompt or problem statement..."
                className="w-full p-3.5 rounded-2xl glass-input text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Step 3 — Faculty Reference Model Solution & Release Guard */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-emerald-500/25 dark:border-emerald-500/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                  Step 3 — Faculty Benchmark Reference Solution / Rubric
                </label>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Ground Truth Model
              </span>
            </div>

            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              {assignmentType === 'code' 
                ? 'Provide the ideal code solution with correct boundary checks and pointer handling.'
                : 'Provide the complete theoretical proof, definition rubric, or step-by-step reasoning.'}
            </p>

            <textarea
              rows={4}
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={assignmentType === 'code' ? 'Paste ideal C/C++/Java/Python function...' : 'Write the model theoretical answer and rubric points...'}
              className="w-full p-3.5 rounded-2xl glass-input text-xs font-mono resize-y leading-relaxed"
            />

            {/* Approval & Release Toggle */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#B49BDE]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#7847EB] dark:text-[#B388FF]" />
                <div>
                  <p className="text-xs font-bold text-[#231735] dark:text-[#FAF7FD]">
                    Release Benchmark Reference Model to Students upon running analysis?
                  </p>
                  <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4]">
                    If unchecked, the solution remains locked until you approve it from the dashboard.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  checked={autoApproveSolution}
                  onChange={(e) => setAutoApproveSolution(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Step 4 — Course Learning Outcomes */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 4 — Course Learning Outcomes (CLOs)
              </label>
              <span className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                Competency criteria
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCloInput}
                onChange={(e) => setNewCloInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClo();
                  }
                }}
                placeholder="e.g. CLO 1: Formulate and solve recurrence relations"
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={handleAddClo}
                disabled={!newCloInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 hover:bg-[#7847EB]/20 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add CLO</span>
              </button>
            </div>

            {clos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {clos.map((clo, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#201433]/80 border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 text-xs text-[#3E2E54] dark:text-[#EDE4F8] shadow-xs"
                  >
                    <span>{clo}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveClo(index)}
                      className="text-[#6C5B82] dark:text-[#CAB7E4] hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step 5 — Student Answers Batch */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 5 — Student Answers Batch <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadLiveSubmissions}
                  disabled={isLoadingLiveSubmissions}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 hover:bg-[#7847EB]/20 border border-[#7847EB]/30 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveSubmissions ? 'animate-spin' : ''}`} />
                  <span>📥 Sync Live Student Portal Submissions ({livePortalSubmissions.length})</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => handleCsvUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-[#201433]/80 hover:bg-white dark:hover:bg-[#281A40] border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CSV</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              Separate individual answers with <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#7847EB] dark:text-[#B388FF] font-mono">---</code>.
            </p>

            {syncNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span>{syncNotice}</span>
              </div>
            )}

            {fileError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            <textarea
              rows={7}
              required
              value={answersText}
              onChange={(e) => setAnswersText(e.target.value)}
              placeholder="Paste student answers here separated by '---'..."
              className="w-full p-4 rounded-2xl glass-input text-xs font-mono resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className={`text-xs font-medium ${
                parsedAnswers.length >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
              }`}>
                {parsedAnswers.length} submissions detected
                {parsedAnswers.length < 2 && ' (minimum 2 required)'}
              </span>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={!isValid || isAnalyzing}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white font-semibold text-sm shadow-lg shadow-[#7847EB]/25 hover:shadow-xl hover:shadow-[#7847EB]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run {assignmentType === 'code' ? 'Code Logic' : 'Theory'} Misconception Radar →</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
