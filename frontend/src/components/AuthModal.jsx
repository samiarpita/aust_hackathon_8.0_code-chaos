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
  Building
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Clear password and errors whenever modal opens or switches mode/role
  useEffect(() => {
    if (isOpen) {
      setPassword('');
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
          email,
          studentId: selectedRole === 'student' ? studentId : undefined,
          semester: selectedRole === 'student' ? semester : undefined,
          department: selectedRole === 'faculty' ? department : undefined,
          password,
          role: selectedRole
        });
      } else {
        await signIn({
          email: email || undefined,
          studentId: selectedRole === 'student' ? (studentId || email) : undefined,
          semester: selectedRole === 'student' ? semester : undefined,
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
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form with autoComplete="off" */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
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

            {/* Student Specific Fields: Student ID Number & Semester */}
            {selectedRole === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Student ID Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 20210104001 or 2026-CSE-042"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                    />
                    <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
                  </div>
                </div>

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
              </>
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

            {/* Email Field (Required for faculty or student register) */}
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

            {/* Password with autoComplete="new-password" */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs pl-8"
                />
                <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6C5B82]" />
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
