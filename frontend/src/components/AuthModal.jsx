import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Briefcase, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LearnMapLogo from './LearnMapLogo';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, loginAsDemoFaculty, loginAsDemoStudent } = useAuth();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');
  // Selected Role: 'faculty' or 'student'
  const [selectedRole, setSelectedRole] = useState('faculty');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await signUp(email, password, { full_name: fullName }, selectedRole);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password, selectedRole);
        if (error) throw error;
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFaculty = () => {
    loginAsDemoFaculty();
    onClose();
  };

  const handleDemoStudent = () => {
    loginAsDemoStudent();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md rounded-3xl glass-surface-elevated p-6 sm:p-8 border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-2xl text-[#3E2E54] dark:text-[#EDE4F8]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#6C5B82] dark:text-[#CAB7E4] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <LearnMapLogo size="lg" showText={true} />
            </div>
            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              {mode === 'login' ? 'Sign in to access your portal' : 'Create an account to get started'}
            </p>
          </div>

          {/* Role Selection Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/5 dark:bg-black/20 border border-[#B49BDE]/20 dark:border-[#C4ABF0]/15 mb-4">
            <button
              type="button"
              onClick={() => setSelectedRole('faculty')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'faculty'
                  ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-sm'
                  : 'text-[#6C5B82] dark:text-[#CAB7E4]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Faculty Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'student'
                  ? 'bg-white dark:bg-[#2C1F42] text-[#EC4899] dark:text-[#F472B6] shadow-sm'
                  : 'text-[#6C5B82] dark:text-[#CAB7E4]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Quick 1-Click Demo Logins */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={handleDemoFaculty}
              className="flex-1 py-2 px-2.5 rounded-xl border border-[#7847EB]/30 dark:border-[#B388FF]/30 bg-[#7847EB]/5 dark:bg-[#B388FF]/10 hover:bg-[#7847EB]/10 text-[11px] font-medium text-[#7847EB] dark:text-[#B388FF] flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo Faculty</span>
            </button>

            <button
              type="button"
              onClick={handleDemoStudent}
              className="flex-1 py-2 px-2.5 rounded-xl border border-[#EC4899]/30 dark:border-[#F472B6]/30 bg-[#EC4899]/5 dark:bg-[#F472B6]/10 hover:bg-[#EC4899]/10 text-[11px] font-medium text-[#EC4899] dark:text-[#F472B6] flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo Student</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-3">
            <div className="flex-grow border-t border-[#B49BDE]/20 dark:border-[#C4ABF0]/15" />
            <span className="flex-shrink mx-2 text-[10px] text-[#6C5B82] dark:text-[#CAB7E4] uppercase tracking-wider font-semibold">
              Or Email Login
            </span>
            <div className="flex-grow border-t border-[#B49BDE]/20 dark:border-[#C4ABF0]/15" />
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedRole === 'faculty' ? 'Dr. Arpita Sengupta' : 'Alex Chen'}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                  />
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'faculty' ? 'faculty@aust.edu' : 'student@aust.edu'}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                />
                <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                />
                <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-1 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 ${
                selectedRole === 'faculty'
                  ? 'bg-gradient-to-r from-[#7847EB] to-[#9061F9]'
                  : 'bg-gradient-to-r from-[#DB2777] to-[#EC4899]'
              }`}
            >
              {loading ? 'Processing...' : mode === 'login' ? `Sign In as ${selectedRole === 'faculty' ? 'Faculty' : 'Student'}` : `Register as ${selectedRole === 'faculty' ? 'Faculty' : 'Student'}`}
            </button>
          </form>

          {/* Login / Register Toggle */}
          <div className="mt-4 text-center text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            {mode === 'login' ? "Don't have an account yet? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
              }}
              className="text-[#7847EB] dark:text-[#B388FF] font-semibold hover:underline"
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
