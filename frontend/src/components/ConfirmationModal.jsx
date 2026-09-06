import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, count, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-2xl glass-surface-elevated p-6 sm:p-7 border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-xl text-[#3E2E54] dark:text-[#EDE4F8]"
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Large Batch Confirmation
              </h3>
            </div>
          </div>

          <p className="text-sm text-[#3E2E54] dark:text-[#EDE4F8] mb-6 leading-relaxed">
            You are about to analyze <strong>{count} submissions</strong>. This may take a little longer.
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              type="button"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
