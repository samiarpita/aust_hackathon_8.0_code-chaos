import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Lightbulb, 
  BrainCircuit, 
  Copy, 
  Download, 
  ArrowLeft, 
  Check, 
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Users
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import MisconceptionChart from '../components/MisconceptionChart';

export default function ResultsPage({ onBackToDashboard, onNewAnalysis }) {
  const { currentAnalysis } = useAnalysis();
  const [copied, setCopied] = useState(false);

  if (!currentAnalysis) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-xl space-y-4">
          <h2 className="text-xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            No Analysis Loaded
          </h2>
          <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            Select an analysis from your dashboard or submit a new question batch.
          </p>
          <button
            onClick={onNewAnalysis}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-semibold shadow-md"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  const { 
    id, 
    questionText, 
    clos = [], 
    misconceptionGroups = [], 
    insight, 
    intervention, 
    createdAt,
    answerCount
  } = currentAnalysis;

  const dateFormatted = createdAt 
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent Session';

  // Calculate correct vs problem count
  const correctGroup = misconceptionGroups.find(g => 
    g.label.toLowerCase().includes('correct') || g.label.toLowerCase().includes('mastery')
  );
  const correctPercentage = correctGroup ? correctGroup.percentage : 13;
  const incorrectPercentage = 100 - correctPercentage;

  const handleCopy = () => {
    const text = `LEARNMAP — ANALYSIS RESULTS
Question: ${questionText}
Date: ${dateFormatted}
Total Submissions: ${answerCount || 36}

COHORT BREAKDOWN:
- Fully Correct: ${correctPercentage}%
- Conceptual Gaps: ${incorrectPercentage}%

AI INSIGHT:
${insight}

RECOMMENDED INTERVENTION:
${intervention}

MISCONCEPTION MAP:
${misconceptionGroups.map(g => `${g.percentage}% — ${g.label}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl glass-surface-elevated hover:bg-white/80 dark:hover:bg-[#251A38] text-xs font-semibold text-[#3E2E54] dark:text-[#EDE4F8] border border-[#B49BDE]/25 dark:border-[#C4ABF0]/15 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#7847EB] dark:text-[#B388FF]" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onNewAnalysis}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
          >
            + New Analysis
          </button>
        </div>
      </div>

      {/* Analysis Results Heading & Question Text */}
      <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
          <span className="font-semibold text-[#7847EB] dark:text-[#B388FF] uppercase tracking-wider text-[11px]">
            Analysis Results
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {dateFormatted}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
          Question being analyzed:
        </h1>
        <p className="text-sm sm:text-base text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed italic bg-black/5 dark:bg-white/5 p-3.5 rounded-2xl border border-[#B49BDE]/20 dark:border-[#C4ABF0]/10">
          "{questionText}"
        </p>

        {/* High-Level Cohort Feedback Banner: How many got it correct vs where problems are */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                Mastery Threshold
              </span>
              <strong className="text-sm text-[#231735] dark:text-[#FAF7FD]">
                {correctPercentage}% Fully Correct
              </strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">
                Struggling Cohort
              </span>
              <strong className="text-sm text-[#231735] dark:text-[#FAF7FD]">
                {incorrectPercentage}% Have Gaps Across {misconceptionGroups.length - (correctGroup ? 1 : 0)} Clusters
              </strong>
            </div>
          </div>
        </div>

        {clos.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {clos.map((c, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 rounded-lg bg-[#7847EB]/5 dark:bg-[#B388FF]/10 text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Section 1: Misconception Map Chart */}
      <div className="p-6 sm:p-8 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-4">
        <div className="border-b border-[#B49BDE]/15 dark:border-[#C4ABF0]/10 pb-3">
          <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Misconception Map
          </h2>
          <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            Visual breakdown of how students were grouped based on cognitive reasoning errors vs correct understanding.
          </p>
        </div>

        {/* Clean Chart Rendering */}
        <MisconceptionChart groups={misconceptionGroups} />
      </div>

      {/* Dual Insights Cards: AI Insight & Recommended Intervention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Section 2: AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 rounded-3xl backdrop-blur-xl border shadow-sm space-y-3
                     bg-[rgba(124,58,237,0.08)] border-[#C4B5FD] text-[#5B21B6] 
                     dark:bg-[rgba(139,92,246,0.14)] dark:border-[#8B5CF6] dark:text-[#DDD6FE]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/15 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
              AI Insight
            </h3>
          </div>

          <p className="text-sm font-medium leading-relaxed">
            {insight}
          </p>
        </motion.div>

        {/* Main Section 3: Recommended Intervention */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 sm:p-7 rounded-3xl backdrop-blur-xl border shadow-sm space-y-3
                     bg-[rgba(244,63,94,0.08)] border-[#FBCFE8] text-[#9D174D] 
                     dark:bg-[rgba(244,114,182,0.14)] dark:border-[#F472B6] dark:text-[#FBCFE8]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600/15 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
              Recommended Intervention
            </h3>
          </div>

          <p className="text-sm font-medium leading-relaxed">
            {intervention}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
