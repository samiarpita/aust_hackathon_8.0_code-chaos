import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Play, 
  Search, 
  Target, 
  Lightbulb, 
  Sparkles,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import LearnMapLogo from '../components/LearnMapLogo';

export default function LandingPage({ onStartAnalysis, onViewDemo, onOpenStudentPortal }) {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo Badge */}
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-3xl glass-surface-elevated border border-[#B49BDE]/35 dark:border-[#C4ABF0]/25 shadow-lg">
              <LearnMapLogo size="xl" showText={true} />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl font-bold text-[#7847EB] dark:text-[#B388FF] mb-4">
            Understand not just what students got wrong — but why.
          </p>

          {/* Supporting Text */}
          <p className="text-base text-[#6C5B82] dark:text-[#CAB7E4] max-w-xl mx-auto leading-relaxed mb-8">
            Upload exam questions, course learning outcomes, and student answers. LearnMap clusters cognitive misconceptions, gives teachers actionable interventions, and helps students pinpoint their specific lackings.
          </p>

          {/* Dual Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white font-semibold text-sm shadow-md hover:shadow-xl hover:shadow-[#7847EB]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Start Analysis (Faculty)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onViewDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass-surface hover:bg-white/90 dark:hover:bg-[#251A38]/90 text-[#231735] dark:text-[#FAF7FD] font-semibold text-sm border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-[#7847EB] dark:text-[#B388FF] fill-[#7847EB]/20 dark:fill-[#B388FF]/20" />
              <span>View Demo</span>
            </button>

            <button
              onClick={onOpenStudentPortal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-surface border border-pink-400/30 text-[#DB2777] dark:text-[#F472B6] font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal Preview</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3 Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Feature 1 */}
        <div className="p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm text-center md:text-left transition-all hover:border-[#7847EB]/40">
          <div className="w-12 h-12 rounded-2xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] flex items-center justify-center mb-5 mx-auto md:mx-0">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD] mb-2">
            Misconception Detection
          </h3>
          <p className="text-sm text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
            Find common patterns in incorrect student answers without manually reading hundreds of exam scripts.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm text-center md:text-left transition-all hover:border-[#7847EB]/40">
          <div className="w-12 h-12 rounded-2xl bg-[#9061F9]/10 dark:bg-[#C084FC]/15 text-[#9061F9] dark:text-[#C084FC] flex items-center justify-center mb-5 mx-auto md:mx-0">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD] mb-2">
            CLO Alignment
          </h3>
          <p className="text-sm text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
            Connect student difficulties with course learning outcomes to know exactly which syllabus concepts need attention.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm text-center md:text-left transition-all hover:border-[#7847EB]/40">
          <div className="w-12 h-12 rounded-2xl bg-[#F472B6]/10 dark:bg-[#F472B6]/15 text-[#F472B6] flex items-center justify-center mb-5 mx-auto md:mx-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD] mb-2">
            Teaching Recommendations
          </h3>
          <p className="text-sm text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
            Get a practical, time-boxed suggestion for what to review in class before introducing the next topic.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
