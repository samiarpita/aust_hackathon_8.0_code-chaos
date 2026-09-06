import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Code2, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Layers, 
  Lightbulb, 
  ArrowRight,
  Send,
  Check,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PRESET_COURSES = [
  { code: 'CSE 2100', name: 'Data Structures and Algorithms' },
  { code: 'CSE 2201', name: 'Algorithms & Complexity' },
  { code: 'CSE 3103', name: 'Database Management Systems' }
];

const QUICK_TEMPLATES = [
  {
    type: 'code',
    label: '🌳 AVL Tree Rotations',
    courseCode: 'CSE 2100',
    title: 'Assignment 3: AVL Tree Left-Right Double Rotation',
    questionNumber: 'Q8',
    totalMarks: 15,
    dueDate: '2026-10-15',
    prompt: 'Implement a C++ function `Node* rotateLeftRight(Node* root)` that performs an LR double-rotation on an unbalanced AVL node to restore balance invariant `|balance_factor| <= 1`. Ensure all child pointer updates and height recalculations are performed accurately.',
    correctAnswer: `Node* rotateLeftRight(Node* root) {\n  if (!root || !root->left) return root;\n  // Step 1: Left rotate on left child\n  root->left = rotateLeft(root->left);\n  // Step 2: Right rotate on root\n  return rotateRight(root);\n}`,
    clos: ['CLO 2: Implement self-balancing binary search tree rotations with correct pointer redirection and height updates'],
    diagnosticMisconception: 'Incorrect Rotation Order in Double Rotation (Applying Right then Left instead of Left then Right)',
    remedialAction: 'Remember that LR imbalance requires left-rotation on child first to convert to LL imbalance, followed by right-rotation on root.'
  },
  {
    type: 'code',
    label: '🕸️ Graph Shortest Path (Dijkstra)',
    courseCode: 'CSE 2201',
    title: 'Lab Task 3: Dijkstra Priority Queue Implementation',
    questionNumber: 'Q9',
    totalMarks: 10,
    dueDate: '2026-10-20',
    prompt: 'Write a C++ implementation of Dijkstra\'s algorithm using `std::priority_queue<pair<int, int>>` to find shortest paths from source vertex `src` in a non-negative weighted graph. Explain how you avoid processing stale distance entries in the priority queue.',
    correctAnswer: `void dijkstra(int src, int V, vector<vector<pair<int,int>>>& adj, vector<int>& dist) {\n  dist.assign(V, 1e9);\n  priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;\n  dist[src] = 0;\n  pq.push({0, src});\n  while (!pq.empty()) {\n    auto [d, u] = pq.top(); pq.pop();\n    if (d > dist[u]) continue; // Guard against stale heap entries\n    for (auto& [v, w] : adj[u]) {\n      if (dist[u] + w < dist[v]) {\n        dist[v] = dist[u] + w;\n        pq.push({dist[v], v});\n      }\n    }\n  }\n}`,
    clos: ['CLO 2: Synthesize greedy shortest-path algorithms with min-heap priority queues'],
    diagnosticMisconception: 'Missing Stale Min-Heap Guard in Priority Queue Dijkstra',
    remedialAction: 'Add `if (d > dist[u]) continue;` immediately after popping to discard relaxed predecessor entries.'
  },
  {
    type: 'theory',
    label: '🔒 Concurrency & Conflict Serializability',
    courseCode: 'CSE 3103',
    title: 'Assignment 3: Conflict Serializability & Precedence Graph Proofs',
    questionNumber: 'Q10',
    totalMarks: 10,
    dueDate: '2026-10-18',
    prompt: 'Given Schedule S: `r1(X); r2(Y); w1(X); r2(X); w2(Y); c1; c2;`. Construct the Precedence (Serialization) Graph for S. Determine if S is conflict-serializable. If yes, state an equivalent serial schedule. If not, state the cycle that prevents serializability.',
    correctAnswer: `Conflicting Operations in Schedule S:\n1. r2(X) comes after w1(X) => Edge T1 -> T2 on item X.\n2. No other conflicting pairs create reverse edges.\n\nPrecedence Graph contains nodes {T1, T2} with single directed edge T1 -> T2.\nSince the Precedence Graph has NO cycles, Schedule S is Conflict-Serializable.\nEquivalent Serial Schedule: T1 -> T2 (i.e. T1 runs completely, then T2).`,
    clos: ['CLO 3: Formulate and evaluate concurrency control schedules, conflict serializability, and precedence graphs'],
    diagnosticMisconception: 'Misidentifying Read-Read Operations as Conflicting Pairs in Precedence Graph Construction',
    remedialAction: 'Conflicting operations require at least one WRITE on the same data item by two distinct transactions.'
  }
];

export default function PostAssignmentModal({ isOpen, onClose, onAssignmentPosted, onNavigateToStudentPortal }) {
  const { user } = useAuth();
  const facultyName = user?.name || user?.user_metadata?.full_name || 'Dr. Arpita Sengupta';
  const facultyEmail = user?.email || 'arpita.cse@aust.edu';
  const facultyDept = user?.department || 'Computer Science & Engineering';
  const facultyDesignation = user?.designation || 'Faculty Member';

  const [assignmentType, setAssignmentType] = useState('code');
  const [courseMode, setCourseMode] = useState('existing'); // 'existing' | 'custom'
  
  const [selectedCourseCode, setSelectedCourseCode] = useState('CSE 2100');
  const [customCourseCode, setCustomCourseCode] = useState('');
  const [customCourseName, setCustomCourseName] = useState('');

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [questionNumber, setQuestionNumber] = useState('Q1');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [totalMarks, setTotalMarks] = useState(10);
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [benchmarkSolution, setBenchmarkSolution] = useState('');
  const [isSolutionApproved, setIsSolutionApproved] = useState(false);

  const [clos, setClos] = useState(['CLO 1: Core Problem Formulation and Algorithmic Analysis']);
  const [newCloInput, setNewCloInput] = useState('');

  const [diagnosticMisconception, setDiagnosticMisconception] = useState('');
  const [remedialAction, setRemedialAction] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl) => {
    setAssignmentType(tmpl.type);
    setSelectedCourseCode(tmpl.courseCode);
    setCourseMode('existing');
    setAssignmentTitle(tmpl.title);
    setQuestionNumber(tmpl.questionNumber);
    setDueDate(tmpl.dueDate);
    setTotalMarks(tmpl.totalMarks);
    setQuestionPrompt(tmpl.prompt);
    setBenchmarkSolution(tmpl.correctAnswer);
    setClos(tmpl.clos);
    setDiagnosticMisconception(tmpl.diagnosticMisconception);
    setRemedialAction(tmpl.remedialAction);
  };

  const handleAddClo = () => {
    if (newCloInput.trim() && !clos.includes(newCloInput.trim())) {
      setClos([...clos, newCloInput.trim()]);
      setNewCloInput('');
    }
  };

  const handleRemoveClo = (indexToRemove) => {
    setClos(clos.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!assignmentTitle.trim()) {
      setErrorMessage('Please provide an Assignment Title.');
      return;
    }
    if (!questionPrompt.trim() || questionPrompt.trim().length < 5) {
      setErrorMessage('Question prompt must be at least 5 characters long.');
      return;
    }

    const courseCode = courseMode === 'custom' ? customCourseCode.trim() : selectedCourseCode;
    const courseName = courseMode === 'custom' 
      ? (customCourseName.trim() || `${courseCode} Course`) 
      : PRESET_COURSES.find(c => c.code === selectedCourseCode)?.name || 'Course';

    if (courseMode === 'custom' && !customCourseCode.trim()) {
      setErrorMessage('Please specify the Course Code for your new course (e.g. CSE 4107).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        courseCode,
        courseName,
        assignmentTitle: assignmentTitle.trim(),
        assignmentType,
        dueDate,
        totalMarks: Number(totalMarks) || 10,
        questionNumber: questionNumber.trim() || 'Q1',
        questionText: questionPrompt.trim(),
        correctAnswer: benchmarkSolution.trim(),
        maxMarks: Number(totalMarks) || 10,
        clos: clos.length > 0 ? clos : ['CLO 1: Core Problem Formulation'],
        isSolutionApproved,
        diagnosticMisconception: diagnosticMisconception.trim(),
        remedialAction: remedialAction.trim(),
        facultyId: user?.id,
        facultyName,
        facultyEmail,
        department: facultyDept,
        designation: facultyDesignation
      };

      const result = await apiClient.postAssignment(payload);
      setSuccessResult(result);
      if (onAssignmentPosted) {
        onAssignmentPosted(result);
      }
    } catch (err) {
      console.error('Error posting assignment:', err);
      setErrorMessage(err.message || 'Failed to publish assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl my-8 rounded-3xl glass-surface-elevated p-6 sm:p-8 border border-[#B49BDE]/35 dark:border-[#C4ABF0]/25 shadow-2xl text-[#3E2E54] dark:text-[#EDE4F8] max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#B49BDE]/20 dark:border-[#C4ABF0]/15 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7847EB] to-[#9061F9] text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Post New Coursework Assignment
              </h2>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                Create and publish assignments to students with domain-aware AI evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 pr-1 space-y-6 flex-grow">
          {successResult ? (
            /* Success View */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-5"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                  Assignment Published Successfully! 🎉
                </h3>
                <p className="text-sm text-[#6C5B82] dark:text-[#CAB7E4] max-w-md mx-auto">
                  <strong>{successResult.assignment?.title || assignmentTitle}</strong> is now live in the student catalog under <strong>{successResult.course?.code || selectedCourseCode}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#1F1433]/50 border border-[#B49BDE]/20 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#6C5B82] dark:text-[#CAB7E4]">Course:</span>
                  <span className="font-semibold text-[#231735] dark:text-[#FAF7FD]">{successResult.course?.code} - {successResult.course?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C5B82] dark:text-[#CAB7E4]">Assignment Type:</span>
                  <span className="font-semibold text-[#7847EB] dark:text-[#B388FF] uppercase">{assignmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C5B82] dark:text-[#CAB7E4]">Benchmark Solution:</span>
                  <span className={`font-semibold ${isSolutionApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {isSolutionApproved ? '✓ Released to Students' : '🔒 Locked (Awaiting Approval)'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setSuccessResult(null);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Done / Return to Dashboard
                </button>
                {onNavigateToStudentPortal && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToStudentPortal();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-[#EC4899] dark:text-[#F472B6] text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Preview in Student Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            /* Main Assignment Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Faculty Identity Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {facultyName ? facultyName[0] : 'F'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>Posting as Course Faculty</span>
                    </span>
                    <p className="font-bold text-[#231735] dark:text-[#FAF7FD]">
                      {facultyName} <span className="font-normal text-[11px] text-[#6C5B82] dark:text-[#CAB7E4]">({facultyEmail})</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold hidden sm:inline-block">
                  {facultyDept}
                </span>
              </div>

              {/* Quick Preset Templates Bar */}
              <div className="p-3.5 rounded-2xl bg-[#7847EB]/5 dark:bg-[#B388FF]/10 border border-[#7847EB]/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick Template Presets (Click to autofill):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-[#251A38] hover:bg-[#7847EB]/10 dark:hover:bg-[#B388FF]/20 text-[#231735] dark:text-[#FAF7FD] border border-[#B49BDE]/20 transition-all text-left shadow-xs"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 1: Assignment Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4]">
                  1. Assignment Domain & Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignmentType('code')}
                    className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      assignmentType === 'code'
                        ? 'bg-[#7847EB]/10 dark:bg-[#7847EB]/25 border-[#7847EB] shadow-md ring-2 ring-[#7847EB]/20'
                        : 'glass-surface border-[#B49BDE]/25 hover:border-[#7847EB]/40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${assignmentType === 'code' ? 'bg-[#7847EB] text-white' : 'bg-black/5 dark:bg-white/5 text-[#6C5B82]'}`}>
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD] flex items-center gap-1.5">
                        <span>Code-Based Assignment</span>
                        {assignmentType === 'code' && <Check className="w-4 h-4 text-[#7847EB] dark:text-[#B388FF]" />}
                      </div>
                      <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] mt-0.5 leading-snug">
                        Evaluates memory, pointers, asymptotic bounds, base cases, and compiler logic.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignmentType('theory')}
                    className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      assignmentType === 'theory'
                        ? 'bg-[#EC4899]/10 dark:bg-[#EC4899]/25 border-[#EC4899] shadow-md ring-2 ring-[#EC4899]/20'
                        : 'glass-surface border-[#B49BDE]/25 hover:border-[#EC4899]/40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${assignmentType === 'theory' ? 'bg-[#EC4899] text-white' : 'bg-black/5 dark:bg-white/5 text-[#6C5B82]'}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD] flex items-center gap-1.5">
                        <span>Theory & Concept Assignment</span>
                        {assignmentType === 'theory' && <Check className="w-4 h-4 text-[#EC4899] dark:text-[#F472B6]" />}
                      </div>
                      <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] mt-0.5 leading-snug">
                        Evaluates proofs, 3NF/BCNF normalization, ACID transaction locks, and protocol invariants.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Course Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4]">
                    2. Select or Create Course
                  </label>
                  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-xl border border-[#B49BDE]/20 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCourseMode('existing')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        courseMode === 'existing'
                          ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-xs font-bold'
                          : 'text-[#6C5B82] dark:text-[#CAB7E4]'
                      }`}
                    >
                      Existing Course
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseMode('custom')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        courseMode === 'custom'
                          ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-xs font-bold'
                          : 'text-[#6C5B82] dark:text-[#CAB7E4]'
                      }`}
                    >
                      + New Custom Course
                    </button>
                  </div>
                </div>

                {courseMode === 'existing' ? (
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                  >
                    {PRESET_COURSES.map(c => (
                      <option key={c.code} value={c.code} className="bg-white dark:bg-[#1F1433] text-[#231735] dark:text-[#FAF7FD]">
                        {c.code}: {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
                        Course Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CSE 4107"
                        value={customCourseCode}
                        onChange={(e) => setCustomCourseCode(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Artificial Intelligence"
                        value={customCourseName}
                        onChange={(e) => setCustomCourseName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Assignment Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Assignment 2: Graph Shortest Paths"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
                    Question No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q1, Task 1"
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                  />
                </div>
              </div>

              {/* Step 4: Question Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4]">
                  Question Statement / Prompt *
                </label>
                <textarea
                  rows={4}
                  placeholder="State the problem prompt, requirements, constraints, and test scenarios..."
                  value={questionPrompt}
                  onChange={(e) => setQuestionPrompt(e.target.value)}
                  className="w-full p-4 rounded-2xl glass-input text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50 leading-relaxed resize-none"
                />
              </div>

              {/* Step 5: Benchmark Solution & Academic Integrity Guard */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/40 dark:bg-[#1B112B]/50 border border-[#B49BDE]/25">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#7847EB] dark:text-[#B388FF]" />
                    <span className="text-xs font-bold text-[#231735] dark:text-[#FAF7FD]">
                      Faculty Benchmark Solution / Reference Rubric
                    </span>
                  </div>

                  {/* Solution Release Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isSolutionApproved}
                      onChange={(e) => setIsSolutionApproved(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${isSolutionApproved ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isSolutionApproved ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className={`font-semibold text-[11px] ${isSolutionApproved ? 'text-emerald-500' : 'text-[#6C5B82] dark:text-[#CAB7E4]'}`}>
                      {isSolutionApproved ? 'Release to Students' : 'Keep Locked'}
                    </span>
                  </label>
                </div>

                <textarea
                  rows={4}
                  placeholder="Paste benchmark correct implementation or reference grading rubric..."
                  value={benchmarkSolution}
                  onChange={(e) => setBenchmarkSolution(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50 resize-none"
                />
              </div>

              {/* Step 6: Course Learning Outcomes (CLOs) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B82] dark:text-[#CAB7E4]">
                  Course Learning Outcomes (CLOs)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. CLO 2: Implement balance rotations in O(1) time"
                    value={newCloInput}
                    onChange={(e) => setNewCloInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddClo();
                      }
                    }}
                    className="flex-grow px-4 py-2 rounded-xl glass-input text-xs focus:outline-none focus:ring-2 focus:ring-[#7847EB]/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddClo}
                    className="px-4 py-2 rounded-xl bg-[#7847EB]/10 hover:bg-[#7847EB]/20 text-[#7847EB] dark:text-[#B388FF] text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {clos.map((clo, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] text-xs font-medium border border-[#7847EB]/20"
                    >
                      <span className="truncate max-w-xs">{clo}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClo(idx)}
                        className="hover:text-red-500 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#B49BDE]/20 dark:border-[#C4ABF0]/15">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-bold shadow-md shadow-[#7847EB]/25 hover:shadow-lg hover:shadow-[#7847EB]/40 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publishing Assignment...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Assignment to Students</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
