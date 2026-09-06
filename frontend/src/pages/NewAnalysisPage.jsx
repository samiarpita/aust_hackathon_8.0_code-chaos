import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  X, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  FileCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Code
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { MAX_UPLOAD_SIZE_MB, MAX_UPLOAD_BYTES, apiClient } from '../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';

export default function NewAnalysisPage({ onAnalysisSuccess, initialDataset = null }) {
  const { analyze, isAnalyzing, demoDataset } = useAnalysis();

  // Question selection / input
  const [selectedPresetQ, setSelectedPresetQ] = useState(initialDataset?.selectedQ || 'Q3');
  const [questionText, setQuestionText] = useState(
    initialDataset?.questionText || 
    "Explain how the base case works in recursion and write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list."
  );

  // Faculty correct answer field
  const [correctAnswer, setCorrectAnswer] = useState(
    `Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`
  );

  // CLOs state
  const [clos, setClos] = useState(initialDataset?.clos || [
    "CLO 1: Understand recursion boundary conditions",
    "CLO 2: Analyze dynamic pointer manipulation"
  ]);
  const [newCloInput, setNewCloInput] = useState('');

  // Student answers state
  const [answersText, setAnswersText] = useState(initialDataset ? initialDataset.answers?.join('\n---\n') : demoDataset.answers.join('\n---\n'));
  const [fileError, setFileError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [syncNotice, setSyncNotice] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Live portal submissions state
  const [livePortalSubmissions, setLivePortalSubmissions] = useState([]);
  const [isLoadingLiveSubmissions, setIsLoadingLiveSubmissions] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch live submissions from students for the selected question
  const fetchLiveSubmissions = React.useCallback(async (qKey) => {
    setIsLoadingLiveSubmissions(true);
    try {
      const data = await apiClient.getQuestionSubmissions(qKey);
      if (Array.isArray(data)) {
        setLivePortalSubmissions(data);
      }
    } catch (err) {
      console.warn('Could not fetch live question submissions:', err);
    } finally {
      setIsLoadingLiveSubmissions(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialDataset?.selectedQ) {
      handleSelectPreset(initialDataset.selectedQ);
    } else {
      fetchLiveSubmissions(selectedPresetQ);
    }
  }, [initialDataset]);

  // Parse student answers
  const parsedAnswers = React.useMemo(() => {
    if (!answersText.trim()) return [];
    if (answersText.includes('---')) {
      return answersText.split('---').map((s) => s.trim()).filter(Boolean);
    }
    return answersText.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean);
  }, [answersText]);

  const isValid = questionText.trim().length > 0 && parsedAnswers.length >= 2;

  // Preset question switcher
  const handleSelectPreset = (q) => {
    setSelectedPresetQ(q);
    fetchLiveSubmissions(q);
    if (q === 'Q1') {
      setQuestionText("Explain recursion and why the base case terminates the call stack.");
      setCorrectAnswer("A base case is a terminating condition in a recursive function that returns a value directly without making further recursive calls, preventing stack overflow.");
      setClos([
        "CLO 1: Understand call stack frame creation and unwinding",
        "CLO 2: Prevent stack overflow in recursive definitions"
      ]);
      setAnswersText([
        "A base case is an if condition that stops recursion so the stack does not overflow.",
        "Recursion keeps calling itself until memory runs out. The base case gives a return value.",
        "Base case terminates the function. If there is no base case, the function runs forever and causes a stack overflow error.",
        "Base case is when n==0, it returns 0. Without it, recursion continues infinitely on the call stack.",
        "It is a condition that returns a value without making a recursive call, allowing stack frames to pop.",
        "A base case is used to start the recursion from bottom to top.",
        "Recursion does not need a base case if we use a for loop inside the function.",
        "The base case returns a value directly to unwind the activation records stored on the call stack."
      ].join('\n---\n'));
    } else if (q === 'Q2') {
      setQuestionText("Explain the difference between stack and heap memory allocation in C.");
      setCorrectAnswer("Stack memory is automatically managed for local variables and function calls, while heap memory is manually allocated via malloc() and persists until freed.");
      setClos([
        "CLO 1: Understand memory allocation lifecycles",
        "CLO 2: Manage dynamic heap pointers and avoid memory leaks"
      ]);
      setAnswersText([
        "Stack is fast and automatic for local variables. Heap is used with malloc() for dynamic memory.",
        "Stack memory is for functions and local variables. Heap is for dynamic memory that stays until free() is called.",
        "Stack memory is allocated dynamically with malloc and heap is static variables.",
        "Stack has fixed size and manages function call frames. Heap is larger and we must free the memory ourselves.",
        "Heap memory is automatically deleted when function exits, but stack memory persists forever.",
        "Stack variables are destroyed when function returns, while heap memory must be freed with free().",
        "Stack memory uses pointers and heap memory does not use any pointers.",
        "Stack frames are deallocated automatically upon return, while heap memory requires explicit deallocation."
      ].join('\n---\n'));
    } else {
      setQuestionText(demoDataset.questionText);
      setCorrectAnswer(`Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`);
      setClos(demoDataset.clos);
      setAnswersText(demoDataset.answers.join('\n---\n'));
    }
  };

  const handleLoadLiveSubmissions = async () => {
    try {
      setIsLoadingLiveSubmissions(true);
      const data = await apiClient.getQuestionSubmissions(selectedPresetQ);
      if (Array.isArray(data) && data.length > 0) {
        const liveTexts = data.map(s => s.answerText).filter(Boolean);
        if (liveTexts.length > 0) {
          let finalAnswers = liveTexts;
          if (finalAnswers.length < 2) {
            const fallback = selectedPresetQ === 'Q1' 
              ? ["A base case is an if condition that stops recursion so the stack does not overflow."]
              : selectedPresetQ === 'Q2'
              ? ["Stack is fast and automatic for local variables. Heap is used with malloc() for dynamic memory."]
              : ["Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}"];
            finalAnswers = [...finalAnswers, ...fallback];
          }
          setAnswersText(finalAnswers.join('\n---\n'));
          setSyncNotice(`✓ Synced ${data.length} live submissions from student portal for ${selectedPresetQ}!`);
          setTimeout(() => setSyncNotice(null), 5000);
          return;
        }
      }
      setSyncNotice(`No live submissions found for ${selectedPresetQ} yet. Loaded default cohort dataset.`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err) {
      console.warn('Error loading live submissions:', err);
    } finally {
      setIsLoadingLiveSubmissions(false);
    }
  };

  // CLO Tag Actions
  const handleAddClo = () => {
    const trimmed = newCloInput.trim();
    if (trimmed && !clos.includes(trimmed)) {
      setClos([...clos, trimmed]);
      setNewCloInput('');
    }
  };

  const handleRemoveClo = (index) => {
    setClos(clos.filter((_, i) => i !== index));
  };

  // Pre-fill demo data
  const handleLoadSample = () => {
    handleSelectPreset('Q3');
    setFormError(null);
    setFileError(null);
  };

  // Handle CSV upload
  const handleCsvUpload = (file) => {
    setFileError(null);
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError(`File exceeds maximum size of ${MAX_UPLOAD_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (typeof content === 'string') {
        if (file.name.endsWith('.csv')) {
          const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          const clean = lines[0]?.toLowerCase().includes('answer') ? lines.slice(1) : lines;
          setAnswersText(clean.join('\n---\n'));
        } else {
          setAnswersText(content);
        }
      }
    };
    reader.onerror = () => {
      setFileError("Could not read uploaded file.");
    };
    reader.readAsText(file);
  };

  // Run Analysis
  const executeAnalysis = async () => {
    setFormError(null);
    try {
      const result = await analyze({
        questionText: questionText.trim(),
        clos,
        answers: parsedAnswers,
        correctAnswer: correctAnswer.trim(),
      });
      onAnalysisSuccess(result);
    } catch (err) {
      setFormError(err.message || "Failed to complete misconception analysis.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    if (parsedAnswers.length > 50) {
      setShowConfirmModal(true);
    } else {
      executeAnalysis();
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        count={parsedAnswers.length}
        onConfirm={() => {
          setShowConfirmModal(false);
          executeAnalysis();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            New Misconception Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5B82] dark:text-[#CAB7E4] mt-1">
            Faculty assessment flow: question setup, correct reference model, and student batch analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-xl glass-surface-elevated hover:border-[#7847EB]/40 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Demo Dataset (Q3)</span>
        </button>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Loading State Overlay */}
      {isAnalyzing ? (
        <div className="p-12 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 text-[#7847EB] dark:text-[#B388FF] flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Analyzing student responses...
          </h3>
          <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] max-w-sm mx-auto">
            Comparing {parsedAnswers.length} submissions against your reference answer and clustering underlying misconceptions...
          </p>
        </div>
      ) : (
        /* Step-by-Step Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1 — Question Selection & Prompt */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 1 — Select or Enter Exam Question <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                Choose from exam or enter custom text
              </span>
            </div>

            {/* Question Quick Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('Q1')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedPresetQ === 'Q1'
                    ? 'bg-[#7847EB]/15 border-[#7847EB] text-[#7847EB] dark:text-[#B388FF]'
                    : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4]'
                }`}
              >
                Q1 — Call Stack
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('Q2')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedPresetQ === 'Q2'
                    ? 'bg-[#7847EB]/15 border-[#7847EB] text-[#7847EB] dark:text-[#B388FF]'
                    : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4]'
                }`}
              >
                Q2 — Stack vs Heap
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('Q3')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedPresetQ === 'Q3'
                    ? 'bg-[#7847EB]/15 border-[#7847EB] text-[#7847EB] dark:text-[#B388FF]'
                    : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4]'
                }`}
              >
                Q3 — List Reversal
              </button>
            </div>

            <textarea
              rows={3}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter exam question text..."
              className="w-full p-4 rounded-2xl glass-input text-sm resize-y leading-relaxed"
            />
          </div>

          {/* Step 2 — Faculty Correct Reference Answer */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-emerald-500/25 dark:border-emerald-500/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                  Step 2 — Faculty Correct / Reference Solution
                </label>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Reference Model
              </span>
            </div>
            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              Post the ideal answer or code solution. The AI uses this ground truth to identify conceptual deviation in student answers.
            </p>
            <textarea
              rows={4}
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Paste the ideal solution or rubric criteria..."
              className="w-full p-3.5 rounded-2xl glass-input text-xs font-mono resize-y leading-relaxed"
            />
          </div>

          {/* Step 3 — Course Learning Outcomes */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 3 — Course Learning Outcomes (CLOs)
              </label>
              <span className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                Accreditation criteria
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCloInput}
                onChange={(e) => setNewCloInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClo();
                  }
                }}
                placeholder="e.g. CLO 1: Understand recursion boundary conditions"
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={handleAddClo}
                disabled={!newCloInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 hover:bg-[#7847EB]/20 text-[#7847EB] dark:text-[#B388FF] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add CLO</span>
              </button>
            </div>

            {clos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {clos.map((clo, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#201433]/80 border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 text-xs text-[#3E2E54] dark:text-[#EDE4F8] shadow-xs"
                  >
                    <span>{clo}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveClo(index)}
                      className="text-[#6C5B82] dark:text-[#CAB7E4] hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step 4 — Student Answers */}
          <div className="p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                Step 4 — Student Answers Batch <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadLiveSubmissions}
                  disabled={isLoadingLiveSubmissions}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 hover:bg-[#7847EB]/20 border border-[#7847EB]/30 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveSubmissions ? 'animate-spin' : ''}`} />
                  <span>📥 Sync Live Student Portal Submissions ({livePortalSubmissions.length})</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => handleCsvUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-[#201433]/80 hover:bg-white dark:hover:bg-[#281A40] border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 text-xs font-semibold text-[#7847EB] dark:text-[#B388FF] flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CSV</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
              Separate individual answers with <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#7847EB] dark:text-[#B388FF] font-mono">---</code>.
            </p>

            {syncNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span>{syncNotice}</span>
              </div>
            )}

            {fileError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            <textarea
              rows={7}
              required
              value={answersText}
              onChange={(e) => setAnswersText(e.target.value)}
              placeholder="Paste student answers here separated by '---'..."
              className="w-full p-4 rounded-2xl glass-input text-xs font-mono resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className={`text-xs font-medium ${
                parsedAnswers.length >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
              }`}>
                {parsedAnswers.length} submissions detected
                {parsedAnswers.length < 2 && ' (minimum 2 required)'}
              </span>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={!isValid || isAnalyzing}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white font-semibold text-sm shadow-lg shadow-[#7847EB]/25 hover:shadow-xl hover:shadow-[#7847EB]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span>Analyze Answers →</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
