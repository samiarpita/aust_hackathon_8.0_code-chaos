import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Briefcase, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Hash,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LearnMapLogo from './LearnMapLogo';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { signIn, signUp } = useAuth();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');
  // Selected Role: 'faculty' or 'student'
  const [selectedRole, setSelectedRole] = useState('faculty');

  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('Fall 2026');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Clear password, showPassword toggle, and errors whenever modal opens or switches mode/role
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setErrorMessage(null);
    }
  }, [isOpen, mode, selectedRole]);

  if (!isOpen) return null;

  // Password criteria check
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register' && !isPasswordValid) {
      setErrorMessage('Password must satisfy all security constraints listed below.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await signUp({
          name: fullName,
          email: email.trim(),
          studentId: selectedRole === 'student' ? studentId.trim() : undefined,
          semester: selectedRole === 'student' ? semester.trim() : undefined,
          department: selectedRole === 'faculty' ? department.trim() : undefined,
          password,
          role: selectedRole
        });
      } else {
        const inputId = (studentId || email || '').trim();
        const isEmailInput = inputId.includes('@');

        await signIn({
          email: selectedRole === 'faculty' ? email.trim() : (isEmailInput ? inputId : (email ? email.trim() : undefined)),
          studentId: selectedRole === 'student' ? (isEmailInput ? undefined : inputId) : undefined,
          semester: selectedRole === 'student' ? semester.trim() : undefined,
          password,
          role: selectedRole
        });
      }
      
      setPassword('');
      if (onAuthSuccess) {
        onAuthSuccess(selectedRole);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md rounded-3xl glass-surface-elevated p-6 sm:p-8 border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-2xl text-[#3E2E54] dark:text-[#EDE4F8] max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
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
              {mode === 'login' ? `Sign in to your ${selectedRole} portal` : `Create a new ${selectedRole} account`}
            </p>
          </div>

          {/* Role Selection Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/5 dark:bg-black/20 border border-[#B49BDE]/20 dark:border-[#C4ABF0]/15 mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('faculty');
                setPassword('');
                setErrorMessage(null);
              }}
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
              onClick={() => {
                setSelectedRole('student');
                setPassword('');
                setErrorMessage(null);
              }}
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

          {/* Error message */}
          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
            {/* Registration: Full Name */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedRole === 'faculty' ? 'Dr. Arpita Sengupta' : 'Alex Chen'}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                  />
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                </div>
              </div>
            )}

            {/* Student ID / Identification */}
            {selectedRole === 'student' && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {mode === 'login' ? 'Student ID Number or Email' : 'Student ID Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder={mode === 'login' ? 'e.g. 20210104001 or student@aust.edu' : 'e.g. 20210104001 or 2026-CSE-042'}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                  />
                  <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                </div>
              </div>
            )}

            {/* Student Semester */}
            {selectedRole === 'student' && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Semester / Session
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. Fall 2026, 4th Semester"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                </div>
              </div>
            )}

            {/* Faculty Department */}
            {selectedRole === 'faculty' && mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Department
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Department of Computer Science & Engineering"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                  />
                  <Building className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                </div>
              </div>
            )}

            {/* Email Field (Required for faculty login/register, or student register) */}
            {(selectedRole === 'faculty' || mode === 'register') && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'faculty' ? 'faculty@aust.edu' : 'student@aust.edu'}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                  />
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                </div>
              </div>
            )}

            {/* Password Field with View / Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-medium text-[#7847EB] dark:text-[#B388FF] hover:underline flex items-center gap-1 focus:outline-none"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8 pr-9"
                />
                <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#6C5B82] hover:text-[#231735] dark:hover:text-[#FAF7FD] transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Password Constraints Visual Indicator (in register mode) */}
            {mode === 'register' && (
              <div className="p-2.5 rounded-xl bg-black/5 dark:bg-black/20 border border-[#B49BDE]/20 dark:border-[#C4ABF0]/15 space-y-1 text-[10px]">
                <p className="font-semibold text-[#6C5B82] dark:text-[#CAB7E4] mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-500 font-medium' : 'text-[#6C5B82]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Min 8 characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-500 font-medium' : 'text-[#6C5B82]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-500 font-medium' : 'text-[#6C5B82]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-500 font-medium' : 'text-[#6C5B82]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1 col-span-2 ${hasSpecial ? 'text-emerald-500 font-medium' : 'text-[#6C5B82]'}`}>
                    <CheckCircle2 className="w-3 h-3" /> 1 Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 ${
                selectedRole === 'faculty'
                  ? 'bg-gradient-to-r from-[#7847EB] to-[#9061F9]'
                  : 'bg-gradient-to-r from-[#DB2777] to-[#EC4899]'
              }`}
            >
              {loading 
                ? 'Authenticating...' 
                : mode === 'login' 
                  ? `Sign In as ${selectedRole === 'faculty' ? 'Faculty' : 'Student'}` 
                  : `Register ${selectedRole === 'faculty' ? 'Faculty' : 'Student'} Account`}
            </button>
          </form>

          {/* Login / Register Toggle */}
          <div className="mt-4 text-center text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            {mode === 'login' ? "Don't have an account yet? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setPassword('');
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
