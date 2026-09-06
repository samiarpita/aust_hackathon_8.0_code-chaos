import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  BarChart3, 
  HelpCircle, 
  BrainCircuit, 
  Calendar, 
  ArrowRight, 
  FileText, 
  Layers,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Inbox,
  RefreshCw,
  User,
  AlertCircle,
  Clock,
  Send,
  Radio,
  Lock,
  Unlock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';

const DEFAULT_COURSE_QUESTIONS = [
  { id: 'Q1', questionNumber: 'Q1', title: 'Recursion Call Stack & Base Case Termination', course: 'CSE 2100', marks: '5 Marks', isApproved: false },
  { id: 'Q2', questionNumber: 'Q2', title: 'Stack vs Heap Memory Model in C', course: 'CSE 2100', marks: '5 Marks', isApproved: false },
  { id: 'Q3', questionNumber: 'Q3', title: 'Recursive Singly Linked List Reversal', course: 'CSE 2100', marks: '10 Marks', isApproved: false },
  { id: 'Q4_ALGO1', questionNumber: 'Q4', title: 'Divide & Conquer Recurrences (Master Theorem)', course: 'CSE 2201', marks: '10 Marks', isApproved: false },
  { id: 'Q5_ALGO2', questionNumber: 'Q5', title: 'Dynamic Programming & 0/1 Knapsack Formulations', course: 'CSE 2201', marks: '10 Marks', isApproved: false },
  { id: 'Q6_DBMS1', questionNumber: 'Q6', title: 'Relational Schema Normalization (3NF & BCNF)', course: 'CSE 3103', marks: '10 Marks', isApproved: false },
  { id: 'Q7_DBMS2', questionNumber: 'Q7', title: 'ACID Transactions & Strict 2-Phase Locking', course: 'CSE 3103', marks: '10 Marks', isApproved: false }
];

export default function DashboardPage({ onNewAnalysis, onSelectAnalysis, onOpenStudentPortal }) {
  const { history, demoDataset } = useAnalysis();
  const { user, isStudent } = useAuth();
  const [liveSubmissions, setLiveSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Faculty Solution Approval State
  const [questionApprovalStates, setQuestionApprovalStates] = useState({
    Q1: false,
    Q2: false,
    Q3: false,
    Q4_ALGO1: false,
    Q5_ALGO2: false,
    Q6_DBMS1: false,
    Q7_DBMS2: false
  });
  const [approvalToast, setApprovalToast] = useState(null);

  // Fetch live student submissions for faculty
  const fetchLiveSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const data = await apiClient.getFacultySubmissionsInbox();
      if (Array.isArray(data)) {
        setLiveSubmissions(data);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Could not load faculty inbox submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchLiveSubmissions();
    // Refresh feed every 15 seconds
    const timer = setInterval(fetchLiveSubmissions, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSolutionApproval = async (qId, qNum) => {
    const currentState = questionApprovalStates[qId] || false;
    const newState = !currentState;

    try {
      await apiClient.approveQuestionSolution(qId, newState);
      setQuestionApprovalStates(prev => ({
        ...prev,
        [qId]: newState
      }));

      setApprovalToast(
        newState 
          ? `✓ Reference solution for ${qNum} is now APPROVED and visible to students in their portal.`
          : `🔒 Reference solution for ${qNum} has been LOCKED and hidden from students.`
      );

      setTimeout(() => {
        setApprovalToast(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to toggle approval:', err);
      // Fallback local toggle
      setQuestionApprovalStates(prev => ({
        ...prev,
        [qId]: newState
      }));
    }
  };

  // Compute statistics
  const totalAnalyses = history.length;
  const totalQuestions = history.length;
  const totalMisconceptions = history.reduce((acc, curr) => acc + (curr.misconceptionGroups?.length || 0), 0);
  const recentItem = history[0];

  const displayName = user?.name || (isStudent ? 'Student' : 'Faculty');

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-sm"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold">
            <span>{isStudent ? 'Student Workspace' : 'Faculty Evaluation Hub'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sm text-[#6C5B82] dark:text-[#CAB7E4] max-w-lg leading-relaxed">
            {isStudent 
              ? "Access your assigned coursework, submit answers to faculty, and view instant AI diagnostic feedback."
              : "Course Faculty Hub. Monitor live student submissions, control benchmark solution release, and run AI Misconception Radar."}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isStudent ? (
            <button
              onClick={onOpenStudentPortal}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-[#DB2777] to-[#EC4899] text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Go to Student Portal →</span>
            </button>
          ) : (
            <button
              onClick={() => onNewAnalysis()}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white font-bold text-sm shadow-lg shadow-[#7847EB]/25 hover:shadow-xl hover:shadow-[#7847EB]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>+ New Analysis</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Simple Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl glass-surface border border-[#B49BDE]/25 dark:border-[#C4ABF0]/15">
          <span className="text-xs font-medium text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
            Total Analyses
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
              {totalAnalyses}
            </span>
            <span className="text-xs text-emerald-500 font-semibold">Completed</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl glass-surface border border-[#B49BDE]/25 dark:border-[#C4ABF0]/15">
          <span className="text-xs font-medium text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
            Questions Analyzed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
              {totalQuestions}
            </span>
            <span className="text-xs text-[#7847EB] dark:text-[#B388FF] font-semibold">Exam Tasks</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl glass-surface border border-[#B49BDE]/25 dark:border-[#C4ABF0]/15">
          <span className="text-xs font-medium text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
            Live Submissions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
              {liveSubmissions.length}
            </span>
            <span className="text-xs text-pink-500 font-semibold">Received</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl glass-surface border border-[#B49BDE]/25 dark:border-[#C4ABF0]/15">
          <span className="text-xs font-medium text-[#6C5B82] dark:text-[#CAB7E4] block mb-1">
            Recent Analysis
          </span>
          <p className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD] truncate">
            {recentItem?.title || recentItem?.questionText?.slice(0, 22) + '...' || 'Recursion — Base Case'}
          </p>
        </div>
      </div>

      {/* Faculty Benchmark Reference Model Release & Approval Controls */}
      {!isStudent && (
        <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Academic Integrity & Reference Model Release Controls
                </span>
              </div>
              <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Approve & Unlock Benchmark Solutions for Students
              </h2>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                Reference models remain hidden in student portal until you explicitly approve and release them here.
              </p>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {approvalToast && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{approvalToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {DEFAULT_COURSE_QUESTIONS.map((q) => {
              const isApproved = questionApprovalStates[q.id] || false;

              return (
                <div 
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isApproved
                      ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20'
                      : 'glass-surface border-[#B49BDE]/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#7847EB] dark:text-[#B388FF]">
                        {q.course} • {q.questionNumber}
                      </span>
                      {isApproved ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Released to Students
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked / Hidden
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-[#231735] dark:text-[#FAF7FD] line-clamp-2">
                      {q.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSolutionApproval(q.id, q.questionNumber)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      isApproved
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Solution</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Release Model</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Student Submissions Inbox & Response Feed */}
      <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Student Portal Submissions Feed
              </span>
            </div>
            <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD] flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#7847EB] dark:text-[#B388FF]" />
              <span>Multi-Course Response Inbox</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchLiveSubmissions}
              disabled={isLoadingSubmissions}
              className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-[#201433]/80 border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] flex items-center gap-1.5 shadow-xs hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>

            <button
              type="button"
              onClick={() => onNewAnalysis()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sync All to AI Radar</span>
            </button>
          </div>
        </div>

        {liveSubmissions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 space-y-2">
            <Inbox className="w-8 h-8 text-[#6C5B82] dark:text-[#CAB7E4] mx-auto opacity-50" />
            <p className="text-xs font-medium text-[#231735] dark:text-[#FAF7FD]">
              Waiting for live student submissions...
            </p>
            <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] max-w-md mx-auto">
              When students submit answers from the Student Portal for their coursework questions, they will appear here live with student identity and instant diagnostic tags.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {liveSubmissions.slice(0, 8).map((sub, idx) => {
              const dateStr = sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';
              const isCorrect = sub.isCorrect;

              return (
                <div 
                  key={sub.id || idx}
                  className="p-4 rounded-2xl glass-surface border border-[#B49BDE]/20 hover:border-[#7847EB]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#7847EB]/15 text-[#7847EB] dark:text-[#B388FF] font-mono">
                        {sub.courseCode || 'CSE'} • {sub.questionNumber || 'Q'}
                      </span>
                      <strong className="text-xs font-bold text-[#231735] dark:text-[#FAF7FD]">
                        {sub.studentName}
                      </strong>
                      {sub.studentIdentifier && (
                        <span className="text-[10px] font-mono text-[#6C5B82] dark:text-[#CAB7E4]">
                          ({sub.studentIdentifier})
                        </span>
                      )}
                      {sub.targetFacultyName && (
                        <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold bg-pink-500/10 px-2 py-0.5 rounded-full">
                          → {sub.targetFacultyName}
                        </span>
                      )}
                      <span className="text-[10px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-[#3E2E54] dark:text-[#EDE4F8] line-clamp-1 bg-black/5 dark:bg-black/20 p-2 rounded-xl border border-[#B49BDE]/15">
                      {sub.answerText}
                    </p>

                    {sub.misconceptionGroup && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCorrect 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {sub.misconceptionGroup}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onNewAnalysis({ selectedQ: sub.questionNumber })}
                      className="px-3 py-1.5 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] hover:bg-[#7847EB]/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Analyze {sub.questionNumber}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Analysis Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Completed AI Misconception Radar Analyses
          </h2>
          <span className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            Showing latest exam evaluations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.slice(0, 6).map((item) => {
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            }) : 'Recently';

            const dominant = item.misconceptionGroups?.[0];

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 hover:border-[#7847EB]/50 dark:hover:border-[#B388FF]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6C5B82] dark:text-[#CAB7E4] mb-2">
                    <span className="font-semibold text-[#7847EB] dark:text-[#B388FF]">
                      {item.course || 'CSE Assessment'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD] line-clamp-2 mb-2">
                    {item.title || item.questionText}
                  </h3>

                  {dominant && (
                    <div className="mb-4 p-2.5 rounded-xl bg-purple-500/5 dark:bg-purple-400/10 border border-purple-500/15 text-xs text-[#3E2E54] dark:text-[#EDE4F8]">
                      <span className="block text-[10px] uppercase font-bold text-[#7847EB] dark:text-[#B388FF] mb-0.5">
                        Dominant Misconception ({dominant.percentage}%)
                      </span>
                      <p className="truncate font-medium">
                        {dominant.label}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectAnalysis(item)}
                  className="w-full py-2 px-3 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 hover:bg-[#7847EB]/20 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group-hover:translate-x-0.5"
                >
                  <span>View Radar Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
