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
  LogOut
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import LearnMapLogo from './LearnMapLogo';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut, isFaculty, isStudent, isAuthenticated } = useAuth();
  const { isMockMode, toggleMockMode } = useAnalysis();

  const handleLogout = async () => {
    await signOut();
    setActiveTab('landing');
  };

  return (
    <header className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav 
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-auto flex items-center justify-between gap-2 md:gap-4 
                   px-4 py-2.5 rounded-full 
                   bg-white/85 dark:bg-[#1C132C]/90 
                   backdrop-blur-xl 
                   border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 
                   shadow-lg shadow-[#7847EB]/5 dark:shadow-black/40 
                   max-w-5xl w-full"
      >
        {/* Brand Logo */}
        <button 
          onClick={() => setActiveTab(user ? (isFaculty ? 'dashboard' : 'student-portal') : 'landing')}
          className="flex items-center gap-2 group text-left focus:outline-none rounded-full px-1"
        >
          <LearnMapLogo size="sm" showText={true} />
        </button>

        {/* Center Navigation Links based on Authenticated User Role */}
        <div className="flex items-center gap-1 bg-[#F8F6FD]/70 dark:bg-[#120A21]/70 p-1 rounded-full border border-[#B49BDE]/20 dark:border-[#C4ABF0]/10">
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

          {isFaculty && (
            <>
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
            </>
          )}

          {isStudent && (
            <button
              onClick={() => setActiveTab('student-portal')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'student-portal'
                  ? 'bg-white dark:bg-[#2C1F42] text-[#EC4899] dark:text-[#F472B6] shadow-xs'
                  : 'text-[#EC4899] dark:text-[#F472B6] hover:bg-pink-500/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>My Diagnostic Feedback</span>
            </button>
          )}
        </div>

        {/* Right Tools: Theme, User Profile / Login */}
        <div className="flex items-center gap-2">
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

          {/* User Auth Pill with Role Indicator or Login button */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-white/80 dark:bg-[#251A38]/80 border border-[#B49BDE]/20 dark:border-[#C4ABF0]/15 text-xs">
              <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                isFaculty ? 'bg-gradient-to-tr from-[#7847EB] to-[#9061F9]' : 'bg-gradient-to-tr from-[#DB2777] to-[#EC4899]'
              }`}>
                {isFaculty ? 'F' : 'S'}
              </div>
              <div className="hidden lg:flex flex-col text-left text-[11px] leading-tight">
                <span className="text-[#231735] dark:text-[#FAF7FD] font-semibold truncate max-w-[100px]">
                  {user.name?.split(' ')[0] || (isFaculty ? 'Faculty' : 'Student')}
                </span>
                {user.studentId && (
                  <span className="text-[9px] text-[#6C5B82] dark:text-[#CAB7E4] truncate">
                    {user.studentId}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out (Returns to Dashboard)"
                className="p-1 hover:text-red-500 rounded-full transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5 text-[#6C5B82] hover:text-red-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white hover:shadow-md transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </motion.nav>
    </header>
  );
}
