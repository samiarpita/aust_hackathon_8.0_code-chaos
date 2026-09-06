import React from 'react';
import { motion } from 'framer-motion';
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
  GraduationCap
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ onNewAnalysis, onSelectAnalysis, onOpenStudentPortal }) {
  const { history, demoDataset } = useAnalysis();
  const { user, isStudent } = useAuth();

  // Compute statistics
  const totalAnalyses = history.length;
  const totalQuestions = history.length; // 1 question per analysis in MVP
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
            <span>{isStudent ? 'Student Workspace' : 'Faculty Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sm text-[#6C5B82] dark:text-[#CAB7E4] max-w-lg leading-relaxed">
            {isStudent 
              ? "Access your assigned exam questions, submit your answers, and view instant AI diagnostic feedback."
              : "Analyze your students' answers and discover where they are struggling."}
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
              onClick={onNewAnalysis}
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
            Common Misconceptions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
              {totalMisconceptions}
            </span>
            <span className="text-xs text-rose-500 font-semibold">Identified</span>
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

      {/* Recent Analysis Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Recent Analyses
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
                      {item.course || 'Course Assessment'}
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
                  <span>View Results</span>
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
