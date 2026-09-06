import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import LearnMapLogo from '../components/LearnMapLogo';

export default function StudentPortalPage({ onSwitchToFaculty }) {
  const { user } = useAuth();
  const { currentAnalysis } = useAnalysis();

  // Active question from faculty
  const [selectedQuestion, setSelectedQuestion] = useState('Q3');
  
  // Student answer text
  const defaultStudentCode = `Node* reverse(Node* head) {
  // Missing base case check here
  Node* rest = reverse(head->next);
  head->next->next = head;
  head->next = NULL;
  return rest;
}`;

  const [studentAnswer, setStudentAnswer] = useState(defaultStudentCode);
  const [isSubmitted, setIsSubmitted] = useState(true); // default true for immediate demo evaluation
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Faculty reference answer for Q3
  const facultyReferenceAnswer = `Node* reverse(Node* head) {
  // 1. Base Case: empty list or single node
  if (head == NULL || head->next == NULL) {
    return head;
  }
  // 2. Recursive call on sublist
  Node* rest = reverse(head->next);
  // 3. Reverse pointer linkage
  head->next->next = head;
  head->next = NULL;
  // 4. Return new reversed head
  return rest;
}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Student Welcome & Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal — Diagnostic Evaluation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Welcome, {user?.user_metadata?.full_name || 'Alex Chen'} 👋
          </h1>
          <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            Enrolled in <strong>CSE 2100: Data Structures and Algorithms</strong> (Instructor: Dr. Arpita Sengupta)
          </p>
        </div>

        <button
          onClick={onSwitchToFaculty}
          className="px-4 py-2 rounded-xl glass-surface hover:bg-white/80 dark:hover:bg-[#2C1F42] text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] border border-[#B49BDE]/30 self-start sm:self-auto transition-all"
        >
          Switch to Faculty View →
        </button>
      </div>

      {/* Question Selector Banner */}
      <div className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
          <span className="font-semibold text-[#7847EB] dark:text-[#B388FF] uppercase tracking-wider">
            Exam Assessment Questions
          </span>
          <span className="font-medium">Midterm Examination Fall 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedQuestion('Q1')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              selectedQuestion === 'Q1'
                ? 'bg-[#7847EB]/10 border-[#7847EB] text-[#7847EB] dark:text-[#B388FF]'
                : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4]'
            }`}
          >
            <span className="text-[10px] font-bold block uppercase">Q1 • 5 Marks</span>
            <p className="text-xs font-semibold mt-0.5 truncate">Define recursion call stack.</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuestion('Q2')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              selectedQuestion === 'Q2'
                ? 'bg-[#7847EB]/10 border-[#7847EB] text-[#7847EB] dark:text-[#B388FF]'
                : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4]'
            }`}
          >
            <span className="text-[10px] font-bold block uppercase">Q2 • 5 Marks</span>
            <p className="text-xs font-semibold mt-0.5 truncate">Stack vs Heap memory model.</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuestion('Q3')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              selectedQuestion === 'Q3'
                ? 'bg-gradient-to-r from-[#7847EB]/15 to-[#EC4899]/15 border-[#EC4899] text-[#231735] dark:text-[#FAF7FD] shadow-xs'
                : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[#EC4899]">Q3 (Active) • 10 Marks</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-bold mt-0.5 truncate">Recursive Linked List Reversal</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Student Answer Submission & Diagnostic Lackings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Student Answer Submission */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#EC4899] block mb-1">
                Your Answer Submission
              </span>
              <h2 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Q3. Singly Linked List Reversal
              </h2>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] mt-1">
                Write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list. Explain your base case condition.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                rows={9}
                value={studentAnswer}
                onChange={(e) => {
                  setStudentAnswer(e.target.value);
                  setIsSubmitted(false);
                }}
                className="w-full p-3.5 rounded-2xl glass-input font-mono text-xs leading-relaxed"
                placeholder="Write or paste your code/explanation here..."
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4]">
                  {isSubmitted ? '✓ Answer evaluated' : '✏ Edits not submitted yet'}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DB2777] to-[#EC4899] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Answer'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Faculty Posted Reference Solution */}
          <div className="p-6 rounded-3xl glass-surface-elevated border border-emerald-500/25 dark:border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Faculty Correct Reference Model
              </h3>
            </div>
            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              Posted by Dr. Arpita Sengupta for Midterm Q3:
            </p>
            <pre className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 font-mono text-[11px] text-[#231735] dark:text-[#FAF7FD] overflow-x-auto leading-relaxed">
              {facultyReferenceAnswer}
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
                  Personalized Diagnostic Feedback
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Needs Revision
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD]">
                Missing Base Case Boundary Termination
              </h3>
              <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                Your implementation immediately invokes <code className="px-1 py-0.5 bg-black/5 dark:bg-white/10 rounded font-mono">reverse(head-&gt;next)</code> without validating <code className="px-1 py-0.5 bg-black/5 dark:bg-white/10 rounded font-mono">if (head == NULL || head-&gt;next == NULL)</code>. When unwinding on an empty list or a 1-node list, dereferencing <code className="font-mono">head-&gt;next</code> throws a segmentation fault.
              </p>
            </div>

            {/* Target CLO Competency */}
            <div className="p-4 rounded-2xl glass-surface border border-[#B49BDE]/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Target Course Learning Outcome (CLO-1)</span>
              </div>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                "Design recursive algorithms with correct boundary termination and state backtracking."
              </p>
            </div>

            {/* Remedial Recommendation */}
            <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-900/10 border border-purple-500/15 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Actionable Step to Fix This:</span>
              </div>
              <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                Add the 2-line guard check at the top of your function. Trace a list with 1 node on paper to see why recursion must return <code className="font-mono">head</code> immediately without making a child recursive call.
              </p>
            </div>

            {/* Cohort Insight */}
            <div className="pt-2 border-t border-[#B49BDE]/20 text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center justify-between">
              <span>Class Cohort Insight:</span>
              <strong className="text-[#7847EB] dark:text-[#B388FF]">
                38% of students shared this exact boundary mistake
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
