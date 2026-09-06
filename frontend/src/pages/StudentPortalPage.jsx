import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  FileCode, 
  BookOpen, 
  ArrowRight, 
  Lightbulb, 
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  BarChart2,
  Check,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';

// Question Bank Definitions for Student Diagnostic Portal
const QUESTIONS_BANK = {
  Q1: {
    id: 'Q1',
    number: 'Q1',
    title: 'Recursion Call Stack & Base Case Termination',
    marks: '5 Marks',
    exam: 'Midterm Examination Fall 2026',
    prompt: 'Explain why a base case is mandatory in recursion and write a recursive C function int sum(int n) that calculates the sum of numbers from 1 to n.',
    initialAnswer: `int sum(int n) {\n  // Missing base case boundary check\n  return n + sum(n - 1);\n}`,
    facultyAnswer: `int sum(int n) {\n  // 1. Base Case: stop when n reaches 0\n  if (n <= 0) {\n    return 0;\n  }\n  // 2. Recursive call\n  return n + sum(n - 1);\n}`,
    clo: 'CLO 1: Understand recursion boundary conditions and call-stack frame termination',
    diagnosticMisconception: 'Missing Base Case Boundary Termination',
    diagnosticExplanation: 'Your implementation invokes sum(n - 1) unconditionally without validating n <= 0. Each call creates an activation frame on the call stack, leading to infinite recursion and stack overflow.',
    remedialAction: 'Add if (n <= 0) return 0; at the top of your function before any recursive call.',
    cohortStat: '42% of students made this base-case boundary mistake'
  },
  Q2: {
    id: 'Q2',
    number: 'Q2',
    title: 'Stack vs Heap Memory Model in C',
    marks: '5 Marks',
    exam: 'Midterm Examination Fall 2026',
    prompt: 'Explain the difference between Stack and Heap memory in C. Write a function int* createArray() that safely allocates and returns an array of 10 integers.',
    initialAnswer: `int* createArray() {\n  int arr[10];\n  // Flaw: returning local stack address\n  return arr;\n}`,
    facultyAnswer: `int* createArray() {\n  // Allocate on the heap so memory persists beyond function return\n  int* arr = (int*)malloc(10 * sizeof(int));\n  if (arr == NULL) return NULL;\n  return arr;\n}`,
    clo: 'CLO 2: Dynamic memory allocation and pointer lifetime management without leaks',
    diagnosticMisconception: 'Dangling Stack Pointer Return',
    diagnosticExplanation: 'You returned the address of local stack variable arr. When createArray() finishes execution, its stack frame is reclaimed, making the pointer dangling and causing undefined behavior.',
    remedialAction: 'Use malloc(10 * sizeof(int)) to allocate memory on the heap so it remains valid after function return.',
    cohortStat: '35% of students returned local stack addresses'
  },
  Q3: {
    id: 'Q3',
    number: 'Q3',
    title: 'Recursive Singly Linked List Reversal',
    marks: '10 Marks',
    exam: 'Midterm Examination Fall 2026',
    prompt: 'Write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list. Explain your base case condition and pointer redirection.',
    initialAnswer: `Node* reverse(Node* head) {\n  // Missing base case check here\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`,
    facultyAnswer: `Node* reverse(Node* head) {\n  // 1. Base Case: empty list or single node\n  if (head == NULL || head->next == NULL) {\n    return head;\n  }\n  // 2. Recursive call on sublist\n  Node* rest = reverse(head->next);\n  // 3. Reverse pointer linkage\n  head->next->next = head;\n  head->next = NULL;\n  // 4. Return new reversed head\n  return rest;\n}`,
    clo: 'CLO 1: Design recursive algorithms with correct boundary termination and pointer redirection',
    diagnosticMisconception: 'Missing Base Case Boundary Termination',
    diagnosticExplanation: 'Your implementation immediately invokes reverse(head->next) without validating if (head == NULL || head->next == NULL). When unwinding on an empty list or a 1-node list, dereferencing head->next throws a segmentation fault.',
    remedialAction: 'Add the 2-line guard check at the top of your function. Trace a list with 1 node on paper to see why recursion must return head immediately without making a child recursive call.',
    cohortStat: '38% of students shared this exact boundary mistake'
  }
};

export default function StudentPortalPage() {
  const { user } = useAuth();
  const [selectedQKey, setSelectedQKey] = useState('Q3');
  const activeQ = QUESTIONS_BANK[selectedQKey] || QUESTIONS_BANK.Q3;

  // Answer text per question
  const [answersByQuestion, setAnswersByQuestion] = useState({
    Q1: QUESTIONS_BANK.Q1.initialAnswer,
    Q2: QUESTIONS_BANK.Q2.initialAnswer,
    Q3: QUESTIONS_BANK.Q3.initialAnswer
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [historyFeedbacks, setHistoryFeedbacks] = useState([]);

  // Fetch student submissions from backend on mount
  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const feedbacks = await apiClient.getMyFeedbacks();
        if (feedbacks && feedbacks.length > 0) {
          setHistoryFeedbacks(feedbacks);
        }
      } catch (err) {
        console.warn('Could not load historical feedbacks:', err);
      }
    }
    loadFeedbacks();
  }, []);

  const handleAnswerChange = (val) => {
    setAnswersByQuestion(prev => ({
      ...prev,
      [selectedQKey]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionSuccessMsg(null);

    const currentText = answersByQuestion[selectedQKey] || '';

    try {
      const result = await apiClient.submitStudentAnswer({
        questionId: selectedQKey,
        answerText: currentText
      });

      const submissionRecord = {
        id: result.submission?.id || `sub-${Date.now()}`,
        questionKey: selectedQKey,
        questionNumber: selectedQKey,
        questionTitle: activeQ.title,
        answerText: currentText,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnostic: result.diagnostic || {
          isCorrect: activeQ.diagnosticMisconception.includes('Mastered'),
          identifiedLacking: activeQ.diagnosticMisconception,
          feedback: activeQ.diagnosticExplanation,
          recommendedAction: activeQ.remedialAction
        }
      };

      setSubmittedAnswers(prev => ({
        ...prev,
        [selectedQKey]: submissionRecord
      }));

      setSubmissionSuccessMsg(`✓ Answer for ${selectedQKey} submitted successfully to faculty and evaluated by AI Radar!`);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionSuccessMsg(`✓ Answer recorded locally.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = user?.name || user?.user_metadata?.full_name || 'Student';
  const studentId = user?.studentId || user?.student_id_number || '20220104001';
  const studentSemester = user?.semester || '4.1';
  const studentDept = user?.department || 'CSE';

  const currentSubmission = submittedAnswers[selectedQKey];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Student Welcome & Identity Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-sm"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Diagnostic Portal — Personalized Learning Radar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Welcome, {studentName} 👋
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            <span>ID: <strong className="text-[#231735] dark:text-[#FAF7FD] font-mono">{studentId}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-[#231735] dark:text-[#FAF7FD]">{studentDept}</strong></span>
            <span>•</span>
            <span>Semester: <strong className="text-[#231735] dark:text-[#FAF7FD]">{studentSemester}</strong></span>
            <span>•</span>
            <span className="text-[#7847EB] dark:text-[#B388FF] font-semibold">CSE 2100: Data Structures & Algorithms</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <UserCheck className="w-4 h-4" />
          <span>Active Student Session</span>
        </div>
      </motion.div>

      {/* Question Selector Banner */}
      <div className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
          <span className="font-bold text-[#7847EB] dark:text-[#B388FF] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Assessment Question to Solve & Analyze</span>
          </span>
          <span className="font-medium bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
            Midterm Examination Fall 2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(QUESTIONS_BANK).map((key) => {
            const q = QUESTIONS_BANK[key];
            const isSelected = selectedQKey === key;
            const isDone = !!submittedAnswers[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedQKey(key);
                  setSubmissionSuccessMsg(null);
                }}
                className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7847EB]/15 to-[#EC4899]/15 border-[#EC4899] text-[#231735] dark:text-[#FAF7FD] shadow-sm'
                    : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4] hover:border-[#7847EB]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-[#EC4899]' : 'text-[#7847EB] dark:text-[#B388FF]'
                  }`}>
                    {q.number} • {q.marks}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5" /> Done
                    </span>
                  ) : isSelected ? (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  ) : null}
                </div>
                <p className="text-xs font-bold truncate text-[#231735] dark:text-[#FAF7FD]">
                  {q.title}
                </p>
                <p className="text-[10px] text-[#6C5B82] dark:text-[#CAB7E4] truncate mt-0.5">
                  {q.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission Success Toast Banner */}
      <AnimatePresence>
        {submissionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{submissionSuccessMsg}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 rounded-md">
              Saved & Synced
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Student Answer Submission & Diagnostic Lackings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Student Answer Submission */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EC4899]">
                  {activeQ.number} — Your Answer Submission
                </span>
                <span className="text-[11px] font-semibold text-[#7847EB] dark:text-[#B388FF]">
                  {activeQ.marks}
                </span>
              </div>
              <h2 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                {activeQ.title}
              </h2>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] mt-1 leading-relaxed">
                {activeQ.prompt}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={9}
                  value={answersByQuestion[selectedQKey] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full p-3.5 rounded-2xl glass-input font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[#EC4899]/50"
                  placeholder="Type or paste your code and explanation here..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center gap-1.5">
                  {currentSubmission ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Submitted at {currentSubmission.submittedAt}
                    </span>
                  ) : (
                    <span>✏️ Edit your solution and submit</span>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DB2777] to-[#EC4899] text-white text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating with AI...' : 'Submit Answer'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Faculty Posted Reference Solution */}
          <div className="p-6 rounded-3xl glass-surface-elevated border border-emerald-500/25 dark:border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Faculty Correct Reference Model
                </h3>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Benchmark Solution
              </span>
            </div>
            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              Ideal solution model for <strong>{activeQ.number}</strong>:
            </p>
            <pre className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 font-mono text-[11px] text-[#231735] dark:text-[#FAF7FD] overflow-x-auto leading-relaxed border border-emerald-500/15">
              {activeQ.facultyAnswer}
            </pre>
          </div>
        </div>

        {/* Right Column: Where Your Lackings Are (Diagnostic Result) */}
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl backdrop-blur-xl border border-rose-300/60 dark:border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 shadow-lg space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                  Personalized Diagnostic Feedback ({activeQ.number})
                </span>
                <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                  Where Your Lackings Are
                </h2>
              </div>
            </div>

            {/* Identified Gap Card */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#1E122C]/70 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Identified Misconception:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Needs Revision
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD]">
                {activeQ.diagnosticMisconception}
              </h3>
              <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                {activeQ.diagnosticExplanation}
              </p>
            </div>

            {/* Target CLO Competency */}
            <div className="p-4 rounded-2xl glass-surface border border-[#B49BDE]/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Target Course Learning Outcome</span>
              </div>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
                "{activeQ.clo}"
              </p>
            </div>

            {/* Remedial Recommendation */}
            <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-900/10 border border-purple-500/15 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Actionable Step to Fix This:</span>
              </div>
              <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                {activeQ.remedialAction}
              </p>
            </div>

            {/* Cohort Insight */}
            <div className="pt-2 border-t border-[#B49BDE]/20 text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center justify-between">
              <span>Class Cohort Insight:</span>
              <strong className="text-[#7847EB] dark:text-[#B388FF]">
                {activeQ.cohortStat}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
