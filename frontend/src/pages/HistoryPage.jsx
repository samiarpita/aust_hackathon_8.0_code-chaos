import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Calendar, 
  ArrowRight, 
  FileText, 
  Layers, 
  Search,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export default function HistoryPage({ onSelectAnalysis, onNewAnalysis }) {
  const { history } = useAnalysis();

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Analysis Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Past Exam Analyses
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5B82] dark:text-[#CAB7E4] mt-1">
            Review past student misconception maps, AI insights, and teaching interventions.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          + New Analysis
        </button>
      </div>

      {/* History Items List / Cards */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-[#6C5B82] dark:text-[#CAB7E4] opacity-50" />
            <h3 className="text-base font-bold text-[#231735] dark:text-[#FAF7FD]">
              No past analyses found
            </h3>
            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] max-w-sm mx-auto">
              Start your first question analysis to see class reasoning patterns recorded here.
            </p>
          </div>
        ) : (
          history.map((item) => {
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Recent';

            const dominant = item.misconceptionGroups?.[0];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 hover:border-[#7847EB]/45 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-5 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                    <span className="font-semibold text-[#7847EB] dark:text-[#B388FF]">
                      {item.course || 'Course Examination'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {item.answerCount || (item.answers?.length) || 8} submissions
                    </span>
                  </div>

                  <h3 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD] leading-snug">
                    {item.title || item.questionText}
                  </h3>

                  {dominant && (
                    <div className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                      <span className="text-[#3E2E54] dark:text-[#EDE4F8] font-medium">Dominant misconception: </span>
                      <strong className="text-[#7847EB] dark:text-[#B388FF]">
                        {dominant.label} ({dominant.percentage}%)
                      </strong>
                    </div>
                  )}
                </div>

                {/* View Results Button */}
                <div className="flex items-center md:self-center">
                  <button
                    onClick={() => onSelectAnalysis(item)}
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 hover:bg-[#7847EB]/20 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold flex items-center justify-center gap-2 transition-all group-hover:translate-x-1"
                  >
                    <span>View Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
