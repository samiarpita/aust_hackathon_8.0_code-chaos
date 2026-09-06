import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  User, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  GraduationCap, 
  Zap, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import LearnMapLogo from './LearnMapLogo';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut, activeRole, switchRole, isFaculty, isStudent } = useAuth();
  const { isMockMode, toggleMockMode } = useAnalysis();

  return (
    <header className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav 
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-auto flex items-center justify-between gap-2 md:gap-4 
                   px-4 py-2.5 rounded-full 
                   bg-white/80 dark:bg-[#1C132C]/85 
                   backdrop-blur-xl 
                   border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 
                   shadow-lg shadow-[#7847EB]/5 dark:shadow-black/40 
                   max-w-5xl w-full"
      >
        {/* Brand Logo with exact LearnMap emblem */}
        <button 
          onClick={() => setActiveTab(isFaculty ? 'dashboard' : 'student-portal')}
          className="flex items-center gap-2 group text-left focus:outline-none rounded-full px-1"
        >
          <LearnMapLogo size="sm" showText={true} />
        </button>

        {/* Center Navigation Links based on Role */}
        <div className="flex items-center gap-1 bg-[#F8F6FD]/70 dark:bg-[#120A21]/70 p-1 rounded-full border border-[#B49BDE]/20 dark:border-[#C4ABF0]/10">
          {isFaculty ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-xs font-semibold'
                    : 'text-[#6C5B82] dark:text-[#CAB7E4] hover:text-[#231735] dark:hover:text-[#FAF7FD]'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('new-analysis')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'new-analysis'
                    ? 'bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white shadow-xs font-semibold'
                    : 'text-[#6C5B82] dark:text-[#CAB7E4] hover:text-[#231735] dark:hover:text-[#FAF7FD]'
                }`}
              >
                New Analysis
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-xs font-semibold'
                    : 'text-[#6C5B82] dark:text-[#CAB7E4] hover:text-[#231735] dark:hover:text-[#FAF7FD]'
                }`}
              >
                History
              </button>

              <button
                onClick={() => {
                  switchRole('student');
                  setActiveTab('student-portal');
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-[#EC4899] dark:text-[#F472B6] hover:bg-pink-500/10 transition-colors"
                title="Preview Student Lackings View"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('student-portal')}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#2C1F42] text-[#EC4899] dark:text-[#F472B6] shadow-xs flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>My Diagnostic Lackings</span>
              </button>

              <button
                onClick={() => {
                  switchRole('faculty');
                  setActiveTab('dashboard');
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-[#6C5B82] dark:text-[#CAB7E4] hover:text-[#231735] transition-colors"
              >
                Faculty Portal →
              </button>
            </>
          )}
        </div>

        {/* Right Tools: Mock/Real, Dark/Light, User Profile */}
        <div className="flex items-center gap-2">
          {/* Mock API toggle */}
          <button
            onClick={toggleMockMode}
            title={isMockMode ? "Using Mock Engine (Click to switch to Real API)" : "Using Real API (Click to switch to Mock Engine)"}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              isMockMode 
                ? 'bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/50'
                : 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isMockMode ? 'Mock' : 'Real'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[#6C5B82] dark:text-[#CAB7E4] hover:text-[#231735] dark:hover:text-[#FAF7FD] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#7847EB]" />
            )}
          </button>

          {/* User Auth Pill with Role Indicator */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-white/80 dark:bg-[#251A38]/80 border border-[#B49BDE]/20 dark:border-[#C4ABF0]/15 text-xs">
              <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                isFaculty ? 'bg-gradient-to-tr from-[#7847EB] to-[#9061F9]' : 'bg-gradient-to-tr from-[#DB2777] to-[#EC4899]'
              }`}>
                {isFaculty ? 'F' : 'S'}
              </div>
              <span className="hidden lg:inline text-[#231735] dark:text-[#FAF7FD] font-medium truncate max-w-[90px]">
                {user.user_metadata?.full_name?.split(' ')[0] || (isFaculty ? 'Faculty' : 'Student')}
              </span>
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-1 hover:text-red-500 rounded-full transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white hover:shadow-md transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </motion.nav>
    </header>
  );
}
