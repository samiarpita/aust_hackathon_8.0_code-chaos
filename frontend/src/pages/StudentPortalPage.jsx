import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  FileCode, 
  BookOpen, 
  ArrowRight, 
  Lightbulb, 
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  BarChart2,
  Check,
  UserCheck,
  Lock,
  Unlock,
  ChevronDown,
  Building2,
  Mail,
  User,
  ShieldCheck,
  FileCheck2,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';

// Comprehensive Fallback Multi-Course Catalog with Faculty Mappings
const INITIAL_COURSES = [
  {
    id: 'course-cse2100',
    code: 'CSE 2100',
    name: 'Data Structures and Algorithms',
    department: 'Computer Science & Engineering',
    section: 'Section A & B',
    faculty: {
      id: 'faculty-arpita',
      name: 'Dr. Arpita Sengupta',
      email: 'arpita.cse@aust.edu',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering'
    },
    assignments: [
      {
        id: 'exam-cse2100-a1',
        title: 'Assignment 1: Recursion & Call Stack Boundary Conditions',
        dueDate: '2026-09-15',
        totalMarks: 10,
        questions: [
          {
            id: 'Q1',
            questionNumber: 'Q1',
            title: 'Recursion Call Stack & Base Case Termination',
            prompt: 'Explain why a base case is mandatory in recursion and write a recursive C function int sum(int n) that calculates the sum of numbers from 1 to n.',
            marks: '5 Marks',
            maxMarks: 5.0,
            initialAnswer: `int sum(int n) {\n  // Missing base case boundary check\n  return n + sum(n - 1);\n}`,
            correctAnswer: `int sum(int n) {\n  // 1. Base Case: stop when n reaches 0\n  if (n <= 0) return 0;\n  // 2. Recursive call\n  return n + sum(n - 1);\n}`,
            isSolutionApproved: false,
            clo: 'CLO 1: Understand recursion boundary conditions and call-stack frame termination',
            diagnosticMisconception: 'Missing Base Case Boundary Termination',
            diagnosticExplanation: 'Your implementation invokes sum(n - 1) unconditionally without validating n <= 0. Each call creates an activation frame on the call stack, leading to infinite recursion and stack overflow.',
            remedialAction: 'Add if (n <= 0) return 0; at the top of your function before any recursive call.',
            cohortStat: '42% of students made this base-case boundary mistake'
          },
          {
            id: 'Q2',
            questionNumber: 'Q2',
            title: 'Stack vs Heap Memory Model in C',
            prompt: 'Explain the difference between Stack and Heap memory in C. Write a function int* createArray() that safely allocates and returns an array of 10 integers.',
            marks: '5 Marks',
            maxMarks: 5.0,
            initialAnswer: `int* createArray() {\n  int arr[10];\n  // Flaw: returning local stack address\n  return arr;\n}`,
            correctAnswer: `int* createArray() {\n  // Allocate on the heap so memory persists beyond function return\n  int* arr = (int*)malloc(10 * sizeof(int));\n  if (arr == NULL) return NULL;\n  return arr;\n}`,
            isSolutionApproved: false,
            clo: 'CLO 2: Dynamic memory allocation and pointer lifetime management without leaks',
            diagnosticMisconception: 'Dangling Stack Pointer Return',
            diagnosticExplanation: 'You returned the address of local stack variable arr. When createArray() finishes execution, its stack frame is reclaimed, making the pointer dangling and causing undefined behavior.',
            remedialAction: 'Use malloc(10 * sizeof(int)) to allocate memory on the heap so it remains valid after function return.',
            cohortStat: '35% of students returned local stack addresses'
          }
        ]
      },
      {
        id: 'exam-midterm-fall2026',
        title: 'Midterm Exam Assessment: Linked List Pointer Reversal',
        dueDate: '2026-09-25',
        totalMarks: 10,
        questions: [
          {
            id: 'Q3',
            questionNumber: 'Q3',
            title: 'Recursive Singly Linked List Reversal',
            prompt: 'Write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list. Explain your base case condition and pointer redirection.',
            marks: '10 Marks',
            maxMarks: 10.0,
            initialAnswer: `Node* reverse(Node* head) {\n  // Missing base case check here\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`,
            correctAnswer: `Node* reverse(Node* head) {\n  // 1. Base Case: empty list or single node\n  if (head == NULL || head->next == NULL) return head;\n  // 2. Recursive call on sublist\n  Node* rest = reverse(head->next);\n  // 3. Reverse pointer linkage\n  head->next->next = head;\n  head->next = NULL;\n  // 4. Return new reversed head\n  return rest;\n}`,
            isSolutionApproved: false,
            clo: 'CLO 1: Design recursive algorithms with correct boundary termination and pointer redirection',
            diagnosticMisconception: 'Missing Base Case Boundary Termination',
            diagnosticExplanation: 'Your implementation immediately invokes reverse(head->next) without validating if (head == NULL || head->next == NULL). Dereferencing head->next on an empty list throws a segmentation fault.',
            remedialAction: 'Add the 2-line guard check at the top of your function before recursing.',
            cohortStat: '38% of students shared this exact boundary mistake'
          }
        ]
      }
    ]
  },
  {
    id: 'course-cse2201',
    code: 'CSE 2201',
    name: 'Algorithms & Complexity',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    faculty: {
      id: 'faculty-alex',
      name: 'Prof. Alex Chen',
      email: 'alex.chen@aust.edu',
      designation: 'Professor & Head of Dept.',
      department: 'Computer Science & Engineering'
    },
    assignments: [
      {
        id: 'exam-cse2201-a1',
        title: 'Assignment 1: Divide & Conquer Recurrences (Master Theorem)',
        dueDate: '2026-09-18',
        totalMarks: 10,
        questions: [
          {
            id: 'Q4_ALGO1',
            questionNumber: 'Q4',
            title: 'Master Theorem & Recurrence Formulation',
            prompt: 'State the Master Theorem conditions. Solve T(n) = 2T(n/2) + O(n) and state the tight asymptotic bound with explanation.',
            marks: '10 Marks',
            maxMarks: 10.0,
            initialAnswer: `T(n) = 2T(n/2) + O(n)\nHere a=2, b=2, f(n)=n.\nSince a = b, the time complexity is O(n^2).`,
            correctAnswer: `Using Master Theorem: T(n) = aT(n/b) + f(n)\na = 2, b = 2 => log_b(a) = log_2(2) = 1.\nf(n) = O(n) = Theta(n^1).\nThis matches Case 2: f(n) = Theta(n^{log_b(a)}).\nTherefore, T(n) = Theta(n^{log_b(a)} * log n) = Theta(n log n).`,
            isSolutionApproved: false,
            clo: 'CLO 1: Formulate and solve recurrence relations using asymptotic analysis',
            diagnosticMisconception: 'Exponent Miscalculation in Master Theorem',
            diagnosticExplanation: 'You incorrectly concluded O(n^2) by multiplying terms instead of evaluating Case 2 where f(n) = Theta(n^{log_b a}) yields Theta(n log n).',
            remedialAction: 'Remember that when f(n) matches n^{log_b(a)}, the work is balanced across all levels of the recursion tree, adding a log(n) factor: Theta(n log n).',
            cohortStat: '29% of students incorrectly matched Case 2 of Master Theorem'
          }
        ]
      },
      {
        id: 'exam-cse2201-a2',
        title: 'Assignment 2: Dynamic Programming & 0/1 Knapsack Formulations',
        dueDate: '2026-09-28',
        totalMarks: 10,
        questions: [
          {
            id: 'Q5_ALGO2',
            questionNumber: 'Q5',
            title: '0/1 Knapsack Optimal Substructure & DP Table',
            prompt: 'Explain why greedy choice fails for 0/1 Knapsack. Write the dynamic programming state transition dp[i][w] to find maximum value with capacity W and items {wt[i], val[i]}.',
            marks: '10 Marks',
            maxMarks: 10.0,
            initialAnswer: `dp[i][w] = dp[i-1][w] + val[i];\nWe just pick the item with highest val/weight ratio greedily.`,
            correctAnswer: `Greedy choice fails because items cannot be fractionally divided, so taking highest ratio may leave unused capacity that could hold a more valuable combination.\nDP Transition:\nif wt[i-1] <= w:\n  dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w])\nelse:\n  dp[i][w] = dp[i-1][w]`,
            isSolutionApproved: false,
            clo: 'CLO 3: Synthesize dynamic programming states and distinguish overlapping subproblems from greedy choice',
            diagnosticMisconception: 'Greedy Heuristic Confusion in 0/1 Knapsack',
            diagnosticExplanation: '0/1 Knapsack requires checking both including and excluding an item because fractional portions are disallowed. Your formulation assumed greedy ratio picking always reaches the global optimum.',
            remedialAction: 'Use the 2D decision transition max(include_item, exclude_item) to consider all capacity combinations.',
            cohortStat: '34% of students applied greedy logic to 0/1 knapsack'
          }
        ]
      }
    ]
  },
  {
    id: 'course-cse3103',
    code: 'CSE 3103',
    name: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    section: 'Section B',
    faculty: {
      id: 'faculty-sarah',
      name: 'Dr. Sarah Rahman',
      email: 'sarah.faculty@aust.edu',
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering'
    },
    assignments: [
      {
        id: 'exam-cse3103-a1',
        title: 'Assignment 1: Relational Schema Normalization (3NF & BCNF)',
        dueDate: '2026-09-16',
        totalMarks: 10,
        questions: [
          {
            id: 'Q6_DBMS1',
            questionNumber: 'Q6',
            title: 'Relational Schema Normalization (3NF & BCNF)',
            prompt: 'Given relation R(A, B, C, D) with FDs: AB -> C, C -> D, D -> A. Find all candidate keys and determine whether R is in 3NF and BCNF.',
            marks: '10 Marks',
            maxMarks: 10.0,
            initialAnswer: `Candidate key is {A, B}.\nSince all attributes are in keys, R is in BCNF without any decomposition.`,
            correctAnswer: `1. Closures:\n(AB)+ = {A,B,C,D} => AB is a key.\n(BC)+ = {B,C,D,A} => BC is a key.\n(BD)+ = {B,D,A,C} => BD is a key.\nCandidate Keys: AB, BC, BD.\nPrime attributes: A, B, C, D (all attributes are prime!).\n2. 3NF check: For each FD X -> Y, either X is superkey or Y is prime. All FDs have prime RHS => R is in 3NF.\n3. BCNF check: For C -> D, C is not a superkey => R is NOT in BCNF.`,
            isSolutionApproved: false,
            clo: 'CLO 2: Evaluate functional dependencies and perform loss-less, dependency-preserving relational decompositions',
            diagnosticMisconception: 'Conflating 3NF Prime Attribute Property with BCNF Superkey Requirement',
            diagnosticExplanation: 'You assumed that because all attributes are prime, R must be in BCNF. However, BCNF strictly requires every determinant (LHS) to be a superkey regardless of whether the RHS is prime.',
            remedialAction: 'For BCNF, verify if the LHS of each FD is a superkey. If not (like C in C -> D), decompose into R1(C, D) and R2(A, B, C).',
            cohortStat: '47% of students missed the candidate keys BC and BD'
          }
        ]
      },
      {
        id: 'exam-cse3103-a2',
        title: 'Assignment 2: ACID Transactions & Strict 2-Phase Locking',
        dueDate: '2026-09-30',
        totalMarks: 10,
        questions: [
          {
            id: 'Q7_DBMS2',
            questionNumber: 'Q7',
            title: 'Strict Two-Phase Locking (2PL) & Serializability',
            prompt: 'Explain the difference between Standard 2PL and Strict 2PL. How does Strict 2PL prevent cascading aborts?',
            marks: '10 Marks',
            maxMarks: 10.0,
            initialAnswer: `Standard 2PL locks data items. Strict 2PL is when transactions release locks immediately after updating a row so other transactions do not wait.`,
            correctAnswer: `Standard 2PL has a growing phase (acquire locks) and shrinking phase (release locks anytime before commit).\nStrict 2PL requires all exclusive (X) locks to be held until the transaction explicitly COMMITS or ABORTS.\nHow it prevents cascading aborts: No other transaction can read uncommitted dirty data written by T. If T aborts, no other transaction has read its intermediate values, eliminating cascading rollbacks.`,
            isSolutionApproved: false,
            clo: 'CLO 4: Analyze ACID properties and concurrency control isolation levels in multi-user DBMS environments',
            diagnosticMisconception: 'Premature Lock Release in Concurrency Protocols',
            diagnosticExplanation: 'Releasing exclusive locks immediately before commit causes dirty reads and cascading rollbacks. Strict 2PL mandates holding write locks until the transaction finalizes.',
            remedialAction: 'Remember the core invariant of Strict 2PL: All write locks are retained until COMMIT/ABORT to guarantee recoverable and cascade-free schedules.',
            cohortStat: '31% of students reversed the lock holding duration of Strict 2PL'
          }
        ]
      }
    ]
  }
];

export default function StudentPortalPage() {
  const { user } = useAuth();

  // Multi-Course State
  const [coursesData, setCoursesData] = useState(INITIAL_COURSES);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL'); // 'ALL' or course code e.g. 'CSE 2100'
  const [selectedQuestionId, setSelectedQuestionId] = useState('Q3');

  // Faculties List for Recipient Routing
  const [facultiesList, setFacultiesList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);

  // Student Answers & Submissions State
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState(null);

  // Flattened Questions List across all courses
  const allQuestions = React.useMemo(() => {
    const list = [];
    coursesData.forEach(c => {
      (c.assignments || []).forEach(a => {
        (a.questions || []).forEach(q => {
          list.push({
            ...q,
            courseId: c.id,
            courseCode: c.code,
            courseName: c.name,
            courseSection: c.section,
            faculty: c.faculty,
            assignmentId: a.id,
            assignmentTitle: a.title,
            dueDate: a.dueDate,
            totalMarks: a.totalMarks
          });
        });
      });
    });
    return list;
  }, [coursesData]);

  // Currently Active Question
  const activeQuestion = allQuestions.find(q => q.id === selectedQuestionId || q.questionNumber === selectedQuestionId) || allQuestions[0] || INITIAL_COURSES[0].assignments[0].questions[0];

  // Active Assigned Faculty (Default is the course instructor, but can be switched by student)
  const defaultFaculty = activeQuestion?.faculty || {
    id: 'faculty-arpita',
    name: 'Dr. Arpita Sengupta',
    email: 'arpita.cse@aust.edu',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering'
  };

  const activeRecipientFaculty = facultiesList.find(f => f.id === selectedFacultyId) || defaultFaculty;

  // Initialize and fetch real database coursework and faculty list
  useEffect(() => {
    async function initPortalData() {
      try {
        const [assignmentsResp, facultiesResp, feedbacksResp] = await Promise.allSettled([
          apiClient.getStudentAssignments(),
          apiClient.getFaculties(),
          apiClient.getMyFeedbacks()
        ]);

        if (facultiesResp.status === 'fulfilled' && Array.isArray(facultiesResp.value) && facultiesResp.value.length > 0) {
          setFacultiesList(facultiesResp.value);
        }

        if (assignmentsResp.status === 'fulfilled' && Array.isArray(assignmentsResp.value) && assignmentsResp.value.length > 0) {
          setCoursesData(assignmentsResp.value);
        }

        if (feedbacksResp.status === 'fulfilled' && Array.isArray(feedbacksResp.value)) {
          const subMap = {};
          feedbacksResp.value.forEach(fb => {
            const qKey = fb.questionNumber || fb.questionId;
            subMap[qKey] = {
              id: fb.submissionId,
              questionId: fb.questionId,
              questionNumber: qKey,
              answerText: fb.myAnswer,
              isCorrect: fb.evaluation?.isCorrect,
              isSolutionApproved: fb.isSolutionApproved,
              submittedAt: fb.submittedAt ? new Date(fb.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              targetFacultyName: fb.targetFacultyName || 'Course Faculty',
              diagnostic: {
                isCorrect: fb.evaluation?.isCorrect,
                identifiedLacking: fb.evaluation?.identifiedLacking,
                feedback: fb.evaluation?.feedback,
                recommendedAction: fb.evaluation?.recommendedAction
              }
            };
          });
          setSubmittedAnswers(subMap);
        }
      } catch (err) {
        console.warn('Error loading student portal data:', err);
      }
    }

    initPortalData();
  }, []);

  // Sync initial answer text for active question
  useEffect(() => {
    if (activeQuestion && !answersByQuestion[activeQuestion.id]) {
      setAnswersByQuestion(prev => ({
        ...prev,
        [activeQuestion.id]: activeQuestion.initialAnswer || ''
      }));
    }
    // Set default target faculty for this question
    if (activeQuestion?.faculty?.id && !selectedFacultyId) {
      setSelectedFacultyId(activeQuestion.faculty.id);
    }
  }, [activeQuestion]);

  const handleAnswerChange = (val) => {
    if (!activeQuestion) return;
    setAnswersByQuestion(prev => ({
      ...prev,
      [activeQuestion.id]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuestion) return;

    setIsSubmitting(true);
    setSubmissionSuccessMsg(null);

    const currentText = answersByQuestion[activeQuestion.id] || '';

    try {
      const result = await apiClient.submitStudentAnswer({
        questionId: activeQuestion.id,
        answerText: currentText,
        facultyId: activeRecipientFaculty.id,
        facultyName: activeRecipientFaculty.name,
        courseCode: activeQuestion.courseCode,
        assignmentTitle: activeQuestion.assignmentTitle
      });

      const submissionRecord = {
        id: result.submission?.id || `sub-${Date.now()}`,
        questionKey: activeQuestion.id,
        questionNumber: activeQuestion.questionNumber,
        questionTitle: activeQuestion.title,
        answerText: currentText,
        targetFacultyId: activeRecipientFaculty.id,
        targetFacultyName: activeRecipientFaculty.name,
        isSolutionApproved: result.question?.isSolutionApproved ?? activeQuestion.isSolutionApproved,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnostic: result.diagnostic || {
          isCorrect: activeQuestion.diagnosticMisconception?.includes('Mastered'),
          identifiedLacking: activeQuestion.diagnosticMisconception || 'Concept Under AI Review',
          feedback: activeQuestion.diagnosticExplanation || 'Submitted for faculty evaluation.',
          recommendedAction: activeQuestion.remedialAction || 'Review core problem patterns.'
        }
      };

      setSubmittedAnswers(prev => ({
        ...prev,
        [activeQuestion.id]: submissionRecord,
        [activeQuestion.questionNumber]: submissionRecord
      }));

      setSubmissionSuccessMsg(`✓ Answer for ${activeQuestion.questionNumber} successfully delivered to ${activeRecipientFaculty.name}'s Inbox! Instant AI Diagnostic generated.`);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionSuccessMsg(`✓ Answer recorded.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = user?.name || user?.user_metadata?.full_name || 'Samia Arpita';
  const studentId = user?.studentId || user?.student_id_number || '20220104001';
  const studentSemester = user?.semester || '4.1';
  const studentDept = user?.department || 'CSE';

  const currentSubmission = submittedAnswers[activeQuestion?.id] || submittedAnswers[activeQuestion?.questionNumber];

  // Filtered Questions by Course Tab
  const filteredQuestions = selectedCourseFilter === 'ALL'
    ? allQuestions
    : allQuestions.filter(q => q.courseCode === selectedCourseFilter);

  // Determine solution approval state
  const isSolutionApproved = activeQuestion?.isSolutionApproved || currentSubmission?.isSolutionApproved;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Student Identity & Multi-Faculty Overview Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 sm:p-7 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-sm"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Assessment Portal — Multi-Course & Multi-Faculty Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
            Welcome, {studentName} 👋
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
            <span>ID: <strong className="text-[#231735] dark:text-[#FAF7FD] font-mono">{studentId}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-[#231735] dark:text-[#FAF7FD]">{studentDept}</strong></span>
            <span>•</span>
            <span>Semester: <strong className="text-[#231735] dark:text-[#FAF7FD]">{studentSemester}</strong></span>
            <span>•</span>
            <span className="text-[#7847EB] dark:text-[#B388FF] font-semibold">Enrolled in 3 Active Departmental Courses</span>
          </div>
        </div>

        {/* Selected Faculty Recipient Card */}
        <div className="p-4 rounded-2xl bg-[#7847EB]/10 dark:bg-[#B388FF]/15 border border-[#7847EB]/25 text-xs space-y-2 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7847EB] dark:text-[#B388FF]">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Submission Recipient</span>
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
              Connected
            </span>
          </div>
          <div>
            <p className="font-bold text-[#231735] dark:text-[#FAF7FD] text-sm">
              {activeRecipientFaculty.name}
            </p>
            <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4]">
              {activeRecipientFaculty.designation || 'Faculty Member'} • {activeRecipientFaculty.department}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Multi-Course Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#B49BDE]/20">
        <button
          type="button"
          onClick={() => setSelectedCourseFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            selectedCourseFilter === 'ALL'
              ? 'bg-gradient-to-r from-[#7847EB] to-[#9061F9] text-white shadow-md'
              : 'glass-surface border border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4] hover:border-[#7847EB]/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Courses ({allQuestions.length})</span>
        </button>

        {coursesData.map(course => {
          const isSelected = selectedCourseFilter === course.code;
          const qCount = (course.assignments || []).reduce((acc, a) => acc + (a.questions || []).length, 0);

          return (
            <button
              key={course.id || course.code}
              type="button"
              onClick={() => setSelectedCourseFilter(course.code)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-[#DB2777] to-[#EC4899] text-white shadow-md'
                  : 'glass-surface border border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4] hover:border-[#EC4899]/40'
              }`}
            >
              <span>{course.code}: {course.name.split(' ')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
              }`}>
                {qCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Coursework & Question Selector Grid */}
      <div className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
          <span className="font-bold text-[#7847EB] dark:text-[#B388FF] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Coursework Assignment Question</span>
          </span>
          <span className="font-medium bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Showing {filteredQuestions.length} Questions across Multi-Faculty Instructors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredQuestions.map((q) => {
            const isSelected = activeQuestion?.id === q.id;
            const isDone = !!submittedAnswers[q.id] || !!submittedAnswers[q.questionNumber];
            const qApproved = q.isSolutionApproved || submittedAnswers[q.id]?.isSolutionApproved;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setSelectedQuestionId(q.id);
                  setSubmissionSuccessMsg(null);
                  if (q.faculty?.id) {
                    setSelectedFacultyId(q.faculty.id);
                  }
                }}
                className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7847EB]/15 to-[#EC4899]/15 border-[#EC4899] text-[#231735] dark:text-[#FAF7FD] shadow-sm'
                    : 'glass-surface border-[#B49BDE]/20 text-[#6C5B82] dark:text-[#CAB7E4] hover:border-[#7847EB]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-[#EC4899]' : 'text-[#7847EB] dark:text-[#B388FF]'
                  }`}>
                    {q.courseCode} • {q.questionNumber} ({q.marks})
                  </span>
                  <div className="flex items-center gap-1.5">
                    {qApproved ? (
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Unlock className="w-2.5 h-2.5" /> Model Open
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}

                    {isDone && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-bold truncate text-[#231735] dark:text-[#FAF7FD]">
                  {q.title}
                </p>
                <p className="text-[10px] text-[#6C5B82] dark:text-[#CAB7E4] truncate mt-0.5">
                  Instructor: {q.faculty?.name || 'Faculty Member'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission Success Toast Banner */}
      <AnimatePresence>
        {submissionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{submissionSuccessMsg}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 rounded-md">
              Delivered
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Student Answer Submission & Diagnostic Lackings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Student Answer Submission & Reference Model */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-surface-elevated border border-[#B49BDE]/30 dark:border-[#C4ABF0]/15 space-y-4">
            {/* Header & Course Badge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EC4899]">
                  {activeQuestion?.courseCode}: {activeQuestion?.questionNumber} — Student Solution
                </span>
                <span className="text-[11px] font-semibold text-[#7847EB] dark:text-[#B388FF]">
                  {activeQuestion?.marks} • Due: {activeQuestion?.dueDate || '2026-09-30'}
                </span>
              </div>
              <h2 className="text-base font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                {activeQuestion?.title}
              </h2>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] mt-1 leading-relaxed">
                {activeQuestion?.prompt}
              </p>
            </div>

            {/* Target Faculty Instructor Selector */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#B49BDE]/20 space-y-2">
              <label className="text-[11px] font-bold text-[#231735] dark:text-[#FAF7FD] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#7847EB] dark:text-[#B388FF]" />
                  <span>Choose Faculty Instructor to Submit To:</span>
                </span>
                <span className="text-[10px] font-normal text-[#6C5B82] dark:text-[#CAB7E4]">
                  {activeRecipientFaculty.email}
                </span>
              </label>

              <select
                value={selectedFacultyId || activeRecipientFaculty.id}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold focus:ring-2 focus:ring-[#7847EB]/50"
              >
                {/* Default Course Faculty */}
                {facultiesList.length > 0 ? (
                  facultiesList.map((fac) => (
                    <option key={fac.id} value={fac.id} className="bg-white dark:bg-[#1E122C] text-[#231735] dark:text-[#FAF7FD]">
                      {fac.name} — {fac.designation || 'Faculty'} ({fac.department || 'CSE'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="faculty-arpita" className="bg-white dark:bg-[#1E122C] text-[#231735] dark:text-[#FAF7FD]">
                      Dr. Arpita Sengupta — Associate Professor (CSE 2100)
                    </option>
                    <option value="faculty-alex" className="bg-white dark:bg-[#1E122C] text-[#231735] dark:text-[#FAF7FD]">
                      Prof. Alex Chen — Professor & Head of Dept. (CSE 2201)
                    </option>
                    <option value="faculty-sarah" className="bg-white dark:bg-[#1E122C] text-[#231735] dark:text-[#FAF7FD]">
                      Dr. Sarah Rahman — Assistant Professor (CSE 3103)
                    </option>
                  </>
                )}
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={9}
                  value={answersByQuestion[activeQuestion?.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full p-3.5 rounded-2xl glass-input font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[#EC4899]/50"
                  placeholder="Type or paste your code and explanation here..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center gap-1.5">
                  {currentSubmission ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Submitted to {currentSubmission.targetFacultyName || activeRecipientFaculty.name} at {currentSubmission.submittedAt}
                    </span>
                  ) : (
                    <span>✏️ Edit your solution and submit</span>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DB2777] to-[#EC4899] text-white text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating with AI...' : `Submit to ${activeRecipientFaculty.name.split(' ')[0]}`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Faculty Correct Reference Model (Guarded until Faculty Approves) */}
          <div className={`p-6 rounded-3xl glass-surface-elevated border transition-all ${
            isSolutionApproved
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-amber-500/30 dark:border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isSolutionApproved ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Faculty Correct Reference Model
                    </h3>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Faculty Benchmark Solution Guard
                    </h3>
                  </>
                )}
              </div>

              {isSolutionApproved ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Approved & Released by Faculty
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked — Awaiting Faculty Approval
                </span>
              )}
            </div>

            {isSolutionApproved ? (
              <div className="space-y-2">
                <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
                  Official verified reference model for <strong>{activeQuestion?.questionNumber}</strong> ({activeQuestion?.courseCode}):
                </p>
                <pre className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 font-mono text-[11px] text-[#231735] dark:text-[#FAF7FD] overflow-x-auto leading-relaxed border border-emerald-500/20">
                  {activeQuestion?.correctAnswer}
                </pre>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#1E122C]/60 border border-amber-300/40 dark:border-amber-900/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Solution Hidden for Academic Integrity</span>
                </div>
                <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                  Your course faculty (<strong>{activeRecipientFaculty.name}</strong>) will unlock the official benchmark solution model after all student submissions have been collected and analyzed.
                </p>
                <div className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center gap-1.5 pt-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Release scheduled following assignment due date.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Where Your Lackings Are (Diagnostic Result) */}
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl backdrop-blur-xl border border-rose-300/60 dark:border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 shadow-lg space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                  Personalized Diagnostic Feedback ({activeQuestion?.courseCode} — {activeQuestion?.questionNumber})
                </span>
                <h2 className="text-lg font-display font-bold text-[#231735] dark:text-[#FAF7FD]">
                  Where Your Lackings Are
                </h2>
              </div>
            </div>

            {/* Identified Gap Card */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#1E122C]/70 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Identified Misconception:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  currentSubmission?.diagnostic?.isCorrect || activeQuestion?.diagnosticMisconception?.includes('Mastered')
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                  {currentSubmission?.diagnostic?.isCorrect ? 'Mastered' : 'Needs Revision'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#231735] dark:text-[#FAF7FD]">
                {currentSubmission?.diagnostic?.identifiedLacking || activeQuestion?.diagnosticMisconception}
              </h3>
              <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                {currentSubmission?.diagnostic?.feedback || activeQuestion?.diagnosticExplanation}
              </p>
            </div>

            {/* Target CLO Competency */}
            <div className="p-4 rounded-2xl glass-surface border border-[#B49BDE]/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Target Course Learning Outcome</span>
              </div>
              <p className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed">
                "{activeQuestion?.clo}"
              </p>
            </div>

            {/* Remedial Recommendation */}
            <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-900/10 border border-purple-500/15 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7847EB] dark:text-[#B388FF]">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Actionable Step to Fix This:</span>
              </div>
              <p className="text-xs text-[#3E2E54] dark:text-[#EDE4F8] leading-relaxed">
                {currentSubmission?.diagnostic?.recommendedAction || activeQuestion?.remedialAction}
              </p>
            </div>

            {/* Cohort Insight */}
            <div className="pt-2 border-t border-[#B49BDE]/20 text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] flex items-center justify-between">
              <span>Class Cohort Benchmark:</span>
              <strong className="text-[#7847EB] dark:text-[#B388FF]">
                {activeQuestion?.cohortStat}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
