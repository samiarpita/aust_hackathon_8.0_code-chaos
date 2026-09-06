import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Calendar, FileText, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export default function HistoryDrawer({ isOpen, onClose, onSelectAnalysis }) {
  const { history, refreshHistory, isMockMode } = useAnalysis();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-md h-full glass-surface-elevated border-l border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-2xl p-6 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#B49BDE]/20 dark:border-[#C4ABF0]/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                  Analysis History
                </h3>
                <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4]">
                  Past diagnostic sessions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={refreshHistory}
                title="Refresh history"
                className="p-2 rounded-full text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode banner */}
          <div className="my-3 px-3 py-1.5 rounded-lg bg-[#7847EB]/5 dark:bg-[#B388FF]/5 border border-[#7847EB]/10 dark:border-[#B388FF]/10 text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#7847EB] dark:text-[#B388FF]" />
              Source: <strong>{isMockMode ? 'Local Engine Cache' : 'Supabase Database'}</strong>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF]">
              {history.length} records
            </span>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {history.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 text-[#6C5B82] dark:text-[#CAB7E4]">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No recorded analyses yet.</p>
                <p className="text-[11px] opacity-70 mt-0.5">Submit your first student answer batch to see it recorded here.</p>
              </div>
            ) : (
              history.map((item) => {
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Recently';

                const dominant = item.misconceptionGroups?.[0];

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl glass-surface hover:border-[#7847EB]/50 dark:hover:border-[#B388FF]/40 transition-all duration-200 group relative cursor-pointer"
                    onClick={() => {
                      onSelectAnalysis(item);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] mb-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span className="font-medium text-[#7847EB] dark:text-[#B388FF]">
                        {item.answerCount || (item.answers?.length) || 8} answers
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#231735] dark:text-[#FAF7FD] line-clamp-2 mb-2 leading-relaxed">
                      {item.questionText}
                    </h4>

                    {dominant && (
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#B49BDE]/15 dark:border-[#C4ABF0]/10">
                        <span className="text-[#6C5B82] dark:text-[#CAB7E4] truncate max-w-[200px]">
                          {dominant.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF]">
                          {dominant.percentage}%
                        </span>
                      </div>
                    )}

                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-[#7847EB] dark:text-[#B388FF]" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
