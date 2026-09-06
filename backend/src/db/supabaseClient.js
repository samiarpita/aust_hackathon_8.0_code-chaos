const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigured = 
  supabaseUrl && 
  supabaseServiceRoleKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseServiceRoleKey.includes('your-supabase');

let supabase = null;
if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------------------------
// Persistent File Storage for Local Database
// ------------------------------------------------------------------------------
const STORE_PATH = path.join(__dirname, 'data_store.json');

function loadPersistentStore() {
  const defaultStore = {
    users: [],
    profiles: [],
    courses: [],
    enrollments: [],
    exams: [],
    questions: [],
    clos: [],
    submissions: [],
    analyses: []
  };

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
        courses: Array.isArray(parsed.courses) ? parsed.courses : [],
        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : [],
        exams: Array.isArray(parsed.exams) ? parsed.exams : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        clos: Array.isArray(parsed.clos) ? parsed.clos : [],
        submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
        analyses: Array.isArray(parsed.analyses) ? parsed.analyses : []
      };
    }
  } catch (err) {
    console.warn('Could not read existing data_store.json:', err.message);
  }
  return defaultStore;
}

const memoryStore = loadPersistentStore();

function persistData() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write data_store.json:', err.message);
  }
}

// Seed default courses and multi-course assignments across faculties
const SEED_COURSES = [
  {
    id: 'course-cse2100',
    faculty_id: 'faculty-arpita',
    name: 'Data Structures and Algorithms',
    code: 'CSE 2100',
    faculty_name: 'Dr. Arpita Sengupta',
    faculty_email: 'arpita.cse@aust.edu',
    department: 'Computer Science & Engineering',
    section: 'Section A & B'
  },
  {
    id: 'course-cse2201',
    faculty_id: 'faculty-alex',
    name: 'Algorithms & Complexity',
    code: 'CSE 2201',
    faculty_name: 'Prof. Alex Chen',
    faculty_email: 'alex.chen@aust.edu',
    department: 'Computer Science & Engineering',
    section: 'Section A'
  },
  {
    id: 'course-cse3103',
    faculty_id: 'faculty-sarah',
    name: 'Database Management Systems',
    code: 'CSE 3103',
    faculty_name: 'Dr. Sarah Rahman',
    faculty_email: 'sarah.faculty@aust.edu',
    department: 'Computer Science & Engineering',
    section: 'Section B'
  }
];

const SEED_ASSIGNMENTS = [
  // CSE 2100 - Dr. Arpita Sengupta
  {
    id: 'exam-cse2100-a1',
    course_id: 'course-cse2100',
    title: 'Assignment 1: Recursion & Call Stack Boundary Conditions',
    due_date: '2026-09-15',
    total_marks: 10,
    questions: ['Q1', 'Q2']
  },
  {
    id: 'exam-midterm-fall2026',
    course_id: 'course-cse2100',
    title: 'Midterm Exam Assessment: Linked List Pointer Reversal',
    due_date: '2026-09-25',
    total_marks: 10,
    questions: ['Q3']
  },
  // CSE 2201 - Prof. Alex Chen
  {
    id: 'exam-cse2201-a1',
    course_id: 'course-cse2201',
    title: 'Assignment 1: Divide & Conquer Recurrences (Master Theorem)',
    due_date: '2026-09-18',
    total_marks: 10,
    questions: ['Q4_ALGO1']
  },
  {
    id: 'exam-cse2201-a2',
    course_id: 'course-cse2201',
    title: 'Assignment 2: Dynamic Programming & 0/1 Knapsack Formulations',
    due_date: '2026-09-28',
    total_marks: 10,
    questions: ['Q5_ALGO2']
  },
  // CSE 3103 - Dr. Sarah Rahman
  {
    id: 'exam-cse3103-a1',
    course_id: 'course-cse3103',
    title: 'Assignment 1: Relational Schema Normalization (3NF & BCNF)',
    due_date: '2026-09-16',
    total_marks: 10,
    questions: ['Q6_DBMS1']
  },
  {
    id: 'exam-cse3103-a2',
    course_id: 'course-cse3103',
    title: 'Assignment 2: ACID Transactions & Strict 2-Phase Locking',
    due_date: '2026-09-30',
    total_marks: 10,
    questions: ['Q7_DBMS2']
  }
];

const SEED_QUESTIONS_MAP = {
  Q1: {
    id: 'Q1',
    exam_id: 'exam-cse2100-a1',
    question_number: 'Q1',
    title: 'Recursion Call Stack & Base Case Termination',
    marks: '5 Marks',
    max_marks: 5.0,
    prompt: 'Explain why a base case is mandatory in recursion and write a recursive C function int sum(int n) that calculates the sum of numbers from 1 to n.',
    initialAnswer: `int sum(int n) {\n  // Missing base case boundary check\n  return n + sum(n - 1);\n}`,
    correct_answer: `int sum(int n) {\n  // 1. Base Case: stop when n reaches 0\n  if (n <= 0) return 0;\n  // 2. Recursive call\n  return n + sum(n - 1);\n}`,
    clo: 'CLO 1: Understand recursion boundary conditions and call-stack frame termination',
    diagnosticMisconception: 'Missing Base Case Boundary Termination',
    diagnosticExplanation: 'Your implementation invokes sum(n - 1) unconditionally without validating n <= 0. Each call creates an activation frame on the call stack, leading to infinite recursion and stack overflow.',
    remedialAction: 'Add if (n <= 0) return 0; at the top of your function before any recursive call.',
    cohortStat: '42% of students made this base-case boundary mistake'
  },
  Q2: {
    id: 'Q2',
    exam_id: 'exam-cse2100-a1',
    question_number: 'Q2',
    title: 'Stack vs Heap Memory Model in C',
    marks: '5 Marks',
    max_marks: 5.0,
    prompt: 'Explain the difference between Stack and Heap memory in C. Write a function int* createArray() that safely allocates and returns an array of 10 integers.',
    initialAnswer: `int* createArray() {\n  int arr[10];\n  // Flaw: returning local stack address\n  return arr;\n}`,
    correct_answer: `int* createArray() {\n  // Allocate on the heap so memory persists beyond function return\n  int* arr = (int*)malloc(10 * sizeof(int));\n  if (arr == NULL) return NULL;\n  return arr;\n}`,
    clo: 'CLO 2: Dynamic memory allocation and pointer lifetime management without leaks',
    diagnosticMisconception: 'Dangling Stack Pointer Return',
    diagnosticExplanation: 'You returned the address of local stack variable arr. When createArray() finishes execution, its stack frame is reclaimed, making the pointer dangling and causing undefined behavior.',
    remedialAction: 'Use malloc(10 * sizeof(int)) to allocate memory on the heap so it remains valid after function return.',
    cohortStat: '35% of students returned local stack addresses'
  },
  Q3: {
    id: 'Q3',
    exam_id: 'exam-midterm-fall2026',
    question_number: 'Q3',
    title: 'Recursive Singly Linked List Reversal',
    marks: '10 Marks',
    max_marks: 10.0,
    prompt: 'Write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list. Explain your base case condition and pointer redirection.',
    initialAnswer: `Node* reverse(Node* head) {\n  // Missing base case check here\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}`,
    correct_answer: `Node* reverse(Node* head) {\n  // 1. Base Case: empty list or single node\n  if (head == NULL || head->next == NULL) return head;\n  // 2. Recursive call on sublist\n  Node* rest = reverse(head->next);\n  // 3. Reverse pointer linkage\n  head->next->next = head;\n  head->next = NULL;\n  // 4. Return new reversed head\n  return rest;\n}`,
    clo: 'CLO 1: Design recursive algorithms with correct boundary termination and pointer redirection',
    diagnosticMisconception: 'Missing Base Case Boundary Termination',
    diagnosticExplanation: 'Your implementation immediately invokes reverse(head->next) without validating if (head == NULL || head->next == NULL). Dereferencing head->next on an empty list throws a segmentation fault.',
    remedialAction: 'Add the 2-line guard check at the top of your function before recursing.',
    cohortStat: '38% of students shared this exact boundary mistake'
  },
  Q4_ALGO1: {
    id: 'Q4_ALGO1',
    exam_id: 'exam-cse2201-a1',
    question_number: 'Q4',
    title: 'Master Theorem & Recurrence Formulation',
    marks: '10 Marks',
    max_marks: 10.0,
    prompt: 'State the Master Theorem conditions. Solve T(n) = 2T(n/2) + O(n) and state the tight asymptotic bound with explanation.',
    initialAnswer: `T(n) = 2T(n/2) + O(n)\nHere a=2, b=2, f(n)=n.\nSince a = b, the time complexity is O(n^2).`,
    correct_answer: `Using Master Theorem: T(n) = aT(n/b) + f(n)\na = 2, b = 2 => log_b(a) = log_2(2) = 1.\nf(n) = O(n) = Theta(n^1).\nThis matches Case 2: f(n) = Theta(n^{log_b(a)}).\nTherefore, T(n) = Theta(n^{log_b(a)} * log n) = Theta(n log n).`,
    clo: 'CLO 1: Formulate and solve recurrence relations using asymptotic analysis',
    diagnosticMisconception: 'Exponent Miscalculation in Master Theorem',
    diagnosticExplanation: 'You incorrectly concluded O(n^2) by multiplying terms instead of evaluating Case 2 where f(n) = Theta(n^{log_b a}) yields Theta(n log n).',
    remedialAction: 'Remember that when f(n) matches n^{log_b(a)}, the work is balanced across all levels of the recursion tree, adding a log(n) factor: Theta(n log n).',
    cohortStat: '29% of students incorrectly matched Case 2 of Master Theorem'
  },
  Q5_ALGO2: {
    id: 'Q5_ALGO2',
    exam_id: 'exam-cse2201-a2',
    question_number: 'Q5',
    title: '0/1 Knapsack Optimal Substructure & DP Table',
    marks: '10 Marks',
    max_marks: 10.0,
    prompt: 'Explain why greedy choice fails for 0/1 Knapsack. Write the dynamic programming state transition dp[i][w] to find maximum value with capacity W and items {wt[i], val[i]}.',
    initialAnswer: `dp[i][w] = dp[i-1][w] + val[i];\nWe just pick the item with highest val/weight ratio greedily.`,
    correct_answer: `Greedy choice fails because items cannot be fractionally divided, so taking highest ratio may leave unused capacity that could hold a more valuable combination.\nDP Transition:\nif wt[i-1] <= w:\n  dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w])\nelse:\n  dp[i][w] = dp[i-1][w]`,
    clo: 'CLO 3: Synthesize dynamic programming states and distinguish overlapping subproblems from greedy choice',
    diagnosticMisconception: 'Greedy Heuristic Confusion in 0/1 Knapsack',
    diagnosticExplanation: '0/1 Knapsack requires checking both including and excluding an item because fractional portions are disallowed. Your formulation assumed greedy ratio picking always reaches the global optimum.',
    remedialAction: 'Use the 2D decision transition max(include_item, exclude_item) to consider all capacity combinations.',
    cohortStat: '34% of students applied greedy logic to 0/1 knapsack'
  },
  Q6_DBMS1: {
    id: 'Q6_DBMS1',
    exam_id: 'exam-cse3103-a1',
    question_number: 'Q6',
    title: 'Relational Schema Normalization (3NF & BCNF)',
    marks: '10 Marks',
    max_marks: 10.0,
    prompt: 'Given relation R(A, B, C, D) with FDs: AB -> C, C -> D, D -> A. Find all candidate keys and determine whether R is in 3NF and BCNF.',
    initialAnswer: `Candidate key is {A, B}.\nSince all attributes are in keys, R is in BCNF without any decomposition.`,
    correct_answer: `1. Closures:\n(AB)+ = {A,B,C,D} => AB is a key.\n(BC)+ = {B,C,D,A} => BC is a key.\n(BD)+ = {B,D,A,C} => BD is a key.\nCandidate Keys: AB, BC, BD.\nPrime attributes: A, B, C, D (all attributes are prime!).\n2. 3NF check: For each FD X -> Y, either X is superkey or Y is prime. All FDs have prime RHS => R is in 3NF.\n3. BCNF check: For C -> D, C is not a superkey => R is NOT in BCNF.`,
    clo: 'CLO 2: Evaluate functional dependencies and perform loss-less, dependency-preserving relational decompositions',
    diagnosticMisconception: 'Conflating 3NF Prime Attribute Property with BCNF Superkey Requirement',
    diagnosticExplanation: 'You assumed that because all attributes are prime, R must be in BCNF. However, BCNF strictly requires every determinant (LHS) to be a superkey regardless of whether the RHS is prime.',
    remedialAction: 'For BCNF, verify if the LHS of each FD is a superkey. If not (like C in C -> D), decompose into R1(C, D) and R2(A, B, C).',
    cohortStat: '47% of students missed the candidate keys BC and BD'
  },
  Q7_DBMS2: {
    id: 'Q7_DBMS2',
    exam_id: 'exam-cse3103-a2',
    question_number: 'Q7',
    title: 'Strict Two-Phase Locking (2PL) & Serializability',
    marks: '10 Marks',
    max_marks: 10.0,
    prompt: 'Explain the difference between Standard 2PL and Strict 2PL. How does Strict 2PL prevent cascading aborts?',
    initialAnswer: `Standard 2PL locks data items. Strict 2PL is when transactions release locks immediately after updating a row so other transactions do not wait.`,
    correct_answer: `Standard 2PL has a growing phase (acquire locks) and shrinking phase (release locks anytime before commit).\nStrict 2PL requires all exclusive (X) locks to be held until the transaction explicitly COMMITS or ABORTS.\nHow it prevents cascading aborts: No other transaction can read uncommitted dirty data written by T. If T aborts, no other transaction has read its intermediate values, eliminating cascading rollbacks.`,
    clo: 'CLO 4: Analyze ACID properties and concurrency control isolation levels in multi-user DBMS environments',
    diagnosticMisconception: 'Premature Lock Release in Concurrency Protocols',
    diagnosticExplanation: 'Releasing exclusive locks immediately before commit causes dirty reads and cascading rollbacks. Strict 2PL mandates holding write locks until the transaction finalizes.',
    remedialAction: 'Remember the core invariant of Strict 2PL: All write locks are retained until COMMIT/ABORT to guarantee recoverable and cascade-free schedules.',
    cohortStat: '31% of students reversed the lock holding duration of Strict 2PL'
  }
};

// Seed default preset courses, exams, questions into memoryStore if missing
SEED_COURSES.forEach(course => {
  if (!memoryStore.courses.some(c => c.id === course.id || c.code === course.code)) {
    memoryStore.courses.push({
      id: course.id,
      faculty_id: course.faculty_id,
      name: course.name,
      code: course.code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
});

SEED_ASSIGNMENTS.forEach(exam => {
  if (!memoryStore.exams.some(e => e.id === exam.id)) {
    memoryStore.exams.push({
      id: exam.id,
      course_id: exam.course_id,
      title: exam.title,
      due_date: exam.due_date,
      total_marks: exam.total_marks,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
});

Object.keys(SEED_QUESTIONS_MAP).forEach(qKey => {
  const qDef = SEED_QUESTIONS_MAP[qKey];
  if (!memoryStore.questions.some(q => q.id === qDef.id || q.question_number === qDef.id)) {
    memoryStore.questions.push({
      id: qDef.id,
      exam_id: qDef.exam_id,
      question_number: qDef.question_number,
      text: qDef.prompt,
      correct_answer: qDef.correct_answer,
      max_marks: qDef.max_marks,
      is_solution_approved: false,
      created_at: new Date().toISOString()
    });
  }
});
persistData();

// Seed default demo faculty & student accounts in profiles if none exist
try {
  const bcrypt = require('bcryptjs');
  const demoHash = bcrypt.hashSync('password123', 10);

  const DEMO_FACULTIES = [
    {
      id: 'faculty-arpita',
      email: 'arpita.cse@aust.edu',
      name: 'Dr. Arpita Sengupta',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      courseName: 'Data Structures and Algorithms',
      courseCode: 'CSE 2100'
    },
    {
      id: 'faculty-alex',
      email: 'alex.chen@aust.edu',
      name: 'Prof. Alex Chen',
      department: 'Computer Science & Engineering',
      designation: 'Professor & Head of Dept.',
      courseName: 'Algorithms & Complexity',
      courseCode: 'CSE 2201'
    },
    {
      id: 'faculty-sarah',
      email: 'sarah.faculty@aust.edu',
      name: 'Dr. Sarah Rahman',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      courseName: 'Database Management Systems',
      courseCode: 'CSE 3103'
    },
    {
      id: 'user-faculty-demo',
      email: 'faculty.demo@aust.edu',
      name: 'Dr. Arpita Sengupta',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      courseName: 'Data Structures and Algorithms',
      courseCode: 'CSE 2100'
    }
  ];

  DEMO_FACULTIES.forEach(df => {
    if (!memoryStore.profiles.some(p => p.email.toLowerCase() === df.email.toLowerCase() || p.id === df.id)) {
      memoryStore.profiles.push({
        id: df.id,
        email: df.email.toLowerCase(),
        name: df.name,
        role: 'faculty',
        student_id_number: null,
        semester: null,
        department: df.department,
        designation: df.designation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    if (!memoryStore.users.some(u => u.email.toLowerCase() === df.email.toLowerCase())) {
      memoryStore.users.push({
        id: df.id,
        email: df.email.toLowerCase(),
        passwordHash: demoHash
      });
    }
  });

  if (!memoryStore.profiles.find(p => p.email === 'student.demo@aust.edu')) {
    memoryStore.profiles.push({
      id: 'user-student-demo',
      email: 'student.demo@aust.edu',
      name: 'Samia Arpita',
      role: 'student',
      student_id_number: '20220104001',
      semester: '4.1',
      department: 'Computer Science & Engineering',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    memoryStore.users.push({
      id: 'user-student-demo',
      email: 'student.demo@aust.edu',
      passwordHash: demoHash
    });
  }
  persistData();
} catch (e) {
  console.warn('Could not seed demo users:', e.message);
}

/**
 * DB Repository Layer
 */
const db = {
  isUsingMemoryStore: !isConfigured,

  // ==========================================
  // PROFILES & AUTH REPO
  // ==========================================
  async createProfile({ id = randomUUID(), email, name, role = 'faculty', studentId = null, semester = null, department = null }) {
    if (!isConfigured) {
      const existing = memoryStore.profiles.find(
        p => p.email.toLowerCase() === email.toLowerCase() || (studentId && p.student_id_number === studentId)
      );
      if (existing) throw new Error('User with this email or Student ID already exists');

      const profile = {
        id,
        email: email.toLowerCase(),
        name,
        role,
        student_id_number: studentId,
        semester,
        department,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryStore.profiles.push(profile);
      persistData();
      return profile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id,
        email: email.toLowerCase(),
        name,
        role,
        student_id_number: studentId,
        semester,
        department
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getProfileByEmail(email) {
    if (!email) return null;
    if (!isConfigured) {
      return memoryStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getProfileByStudentId(studentId) {
    if (!studentId) return null;
    if (!isConfigured) {
      return memoryStore.profiles.find(p => p.student_id_number === studentId || p.email.toLowerCase() === studentId.toLowerCase()) || null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`student_id_number.eq.${studentId},email.eq.${studentId.toLowerCase()}`)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getProfileById(id) {
    if (!isConfigured) {
      return memoryStore.profiles.find(p => p.id === id) || null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // Store password hashes in dev memory store if running without live Supabase
  async saveUserPassword({ id, email, passwordHash }) {
    const existing = memoryStore.users.find(u => u.id === id || u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.passwordHash = passwordHash;
    } else {
      memoryStore.users.push({ id, email: email.toLowerCase(), passwordHash });
    }
    persistData();
  },

  async getUserAuthByEmail(email) {
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // ==========================================
  // COURSES & EXAMS REPO
  // ==========================================
  async createCourse({ facultyId, name, code }) {
    if (!isConfigured) {
      const course = {
        id: randomUUID(),
        faculty_id: facultyId,
        name,
        code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryStore.courses.push(course);
      persistData();
      return course;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({ faculty_id: facultyId, name, code })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listCoursesForFaculty(facultyId) {
    if (!isConfigured) {
      return memoryStore.courses.filter(c => !facultyId || c.faculty_id === facultyId || c.faculty_id === 'faculty-default');
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*, exams(*)')
      .or(`faculty_id.eq.${facultyId},faculty_id.eq.faculty-default`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listCoursesForStudent(studentId) {
    if (!isConfigured) {
      // In memory: return courses the student is enrolled in or all courses for open demo
      const enrolledCourseIds = memoryStore.enrollments
        .filter(e => e.student_id === studentId)
        .map(e => e.course_id);
      return memoryStore.courses.filter(c => enrolledCourseIds.length === 0 || enrolledCourseIds.includes(c.id));
    }
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id, courses(*, exams(*, questions(*)))')
      .eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map(d => d.courses);
  },

  async createExam({ courseId, title }) {
    if (!isConfigured) {
      const exam = {
        id: randomUUID(),
        course_id: courseId,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryStore.exams.push(exam);
      persistData();
      return exam;
    }

    const { data, error } = await supabase
      .from('exams')
      .insert({ course_id: courseId, title })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listExamsForCourse(courseId) {
    if (!isConfigured) {
      return memoryStore.exams.filter(e => e.course_id === courseId);
    }
    const { data, error } = await supabase
      .from('exams')
      .select('*, questions(*)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getOrCreateDefaultCourseAndExam(facultyId) {
    if (!isConfigured) {
      let course = memoryStore.courses.find(c => c.faculty_id === facultyId);
      if (!course) {
        course = {
          id: randomUUID(),
          faculty_id: facultyId,
          name: 'Data Structures and Algorithms',
          code: 'CSE 2100',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        memoryStore.courses.push(course);
      }

      let exam = memoryStore.exams.find(e => e.course_id === course.id);
      if (!exam) {
        exam = {
          id: randomUUID(),
          course_id: course.id,
          title: 'Midterm Examination Fall 2026',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        memoryStore.exams.push(exam);
      }

      persistData();
      return { courseId: course.id, examId: exam.id };
    }

    const { data: existingCourses, error: courseErr } = await supabase
      .from('courses')
      .select('id')
      .eq('faculty_id', facultyId)
      .limit(1);

    if (courseErr) throw courseErr;

    let courseId = existingCourses?.[0]?.id;
    if (!courseId) {
      const { data: newCourse, error: insertCourseErr } = await supabase
        .from('courses')
        .insert({
          faculty_id: facultyId,
          name: 'Data Structures and Algorithms',
          code: 'CSE 2100'
        })
        .select('id')
        .single();
      if (insertCourseErr) throw insertCourseErr;
      courseId = newCourse.id;
    }

    const { data: existingExams, error: examErr } = await supabase
      .from('exams')
      .select('id')
      .eq('course_id', courseId)
      .limit(1);

    if (examErr) throw examErr;

    let examId = existingExams?.[0]?.id;
    if (!examId) {
      const { data: newExam, error: insertExamErr } = await supabase
        .from('exams')
        .insert({
          course_id: courseId,
          title: 'Midterm Examination Fall 2026'
        })
        .select('id')
        .single();
      if (insertExamErr) throw insertExamErr;
      examId = newExam.id;
    }

    return { courseId, examId };
  },

  // ==========================================
  // QUESTIONS & CLOS REPO
  // ==========================================
  async createQuestionWithDetails({ examId, text, questionNumber = 'Q1', correctAnswer = null, clos = [], submissions = [] }) {
    if (!isConfigured) {
      const question = {
        id: randomUUID(),
        exam_id: examId,
        question_number: questionNumber,
        text,
        correct_answer: correctAnswer,
        max_marks: 10.0,
        created_at: new Date().toISOString()
      };
      memoryStore.questions.push(question);

      const cloRecords = clos.map((cloText, idx) => ({
        id: randomUUID(),
        question_id: question.id,
        code: typeof cloText === 'object' && cloText.code ? cloText.code : `CLO-${idx + 1}`,
        description: typeof cloText === 'string' ? cloText : (cloText.description || ''),
        created_at: new Date().toISOString()
      }));
      memoryStore.clos.push(...cloRecords);

      const submissionRecords = submissions.map((sub, idx) => {
        const isString = typeof sub === 'string';
        return {
          id: randomUUID(),
          question_id: question.id,
          student_id: (!isString && sub.student_id) ? sub.student_id : null,
          student_name: (!isString && sub.student_name) ? sub.student_name : `Student ${idx + 1}`,
          student_identifier: (!isString && sub.student_identifier) ? sub.student_identifier : `Student ${idx + 1}`,
          answer_text: isString ? sub : (sub.answer_text || ''),
          misconception_group: (!isString && sub.misconception_group) ? sub.misconception_group : null,
          feedback: (!isString && sub.feedback) ? sub.feedback : null,
          is_correct: (!isString && typeof sub.is_correct === 'boolean') ? sub.is_correct : false,
          score: null,
          created_at: new Date().toISOString()
        };
      });
      memoryStore.submissions.push(...submissionRecords);
      persistData();

      return { question, clos: cloRecords, submissions: submissionRecords };
    }

    const { data: question, error: qErr } = await supabase
      .from('questions')
      .insert({
        exam_id: examId,
        question_number: questionNumber,
        text,
        correct_answer: correctAnswer
      })
      .select()
      .single();

    if (qErr) throw qErr;

    if (clos.length > 0) {
      const cloInserts = clos.map((cloText, idx) => ({
        question_id: question.id,
        code: typeof cloText === 'object' && cloText.code ? cloText.code : `CLO-${idx + 1}`,
        description: typeof cloText === 'string' ? cloText : (cloText.description || '')
      }));
      const { error: cloErr } = await supabase.from('clos').insert(cloInserts);
      if (cloErr) throw cloErr;
    }

    if (submissions.length > 0) {
      const subInserts = submissions.map((sub, idx) => ({
        question_id: question.id,
        student_id: (typeof sub === 'object' && sub.student_id) ? sub.student_id : null,
        student_name: (typeof sub === 'object' && sub.student_name) ? sub.student_name : `Student ${idx + 1}`,
        student_identifier: (typeof sub === 'object' && sub.student_identifier) ? sub.student_identifier : `Student ${idx + 1}`,
        answer_text: typeof sub === 'string' ? sub : (sub.answer_text || '')
      }));
      const { error: subErr } = await supabase.from('submissions').insert(subInserts);
      if (subErr) throw subErr;
    }

    return { question };
  },

  async getQuestionById(questionId) {
    if (!isConfigured) {
      let q = memoryStore.questions.find(item => item.id === questionId || item.question_number === questionId);
      if (!q) {
        if (questionId === 'Q1' || questionId === 'Q2' || questionId === 'Q3') {
          const presets = {
            Q1: {
              text: "Explain recursion and why the base case terminates the call stack.",
              correctAnswer: "A base case is a terminating condition in a recursive function that returns a value directly without making further recursive calls, preventing stack overflow.",
              clos: ["CLO 1: Understand call stack frame creation and unwinding"]
            },
            Q2: {
              text: "Explain the difference between stack and heap memory allocation in C.",
              correctAnswer: "Stack memory is automatically managed for local variables and function calls, while heap memory is manually allocated via malloc() and persists until freed.",
              clos: ["CLO 2: Manage dynamic heap pointers and avoid leaks"]
            },
            Q3: {
              text: "Explain how the base case works in recursion and write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list.",
              correctAnswer: "Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
              clos: ["CLO 1: Understand recursion boundary conditions", "CLO 2: Analyze dynamic pointer manipulation without memory leaks"]
            }
          };
          const p = presets[questionId];
          const created = await db.createQuestionWithDetails({
            examId: 'default-midterm-exam',
            questionNumber: questionId,
            text: p.text,
            correctAnswer: p.correctAnswer,
            clos: p.clos
          });
          q = created.question;
        }
      }
      if (!q) return null;
      const clos = memoryStore.clos.filter(c => c.question_id === q.id);
      const subs = memoryStore.submissions.filter(s => s.question_id === q.id);
      const analysis = memoryStore.analyses.find(a => a.question_id === q.id);
      return { ...q, clos, submissions: subs, analysis };
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*, clos(*), submissions(*), analyses(*)')
      .or(`id.eq.${questionId},question_number.eq.${questionId}`)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listQuestionsForExam(examId) {
    if (!isConfigured) {
      return memoryStore.questions
        .filter(q => q.exam_id === examId)
        .map(q => ({
          ...q,
          clos: memoryStore.clos.filter(c => c.question_id === q.id),
          submissionsCount: memoryStore.submissions.filter(s => s.question_id === q.id).length,
          hasAnalysis: memoryStore.analyses.some(a => a.question_id === q.id)
        }));
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*, clos(*), submissions(id), analyses(id)')
      .eq('exam_id', examId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(q => ({
      ...q,
      submissionsCount: q.submissions?.length || 0,
      hasAnalysis: (q.analyses?.length || 0) > 0
    }));
  },

  // ==========================================
  // FACULTIES & MULTI-COURSE ASSIGNMENTS REPO
  // ==========================================
  async listAllFaculties() {
    if (!isConfigured) {
      const faculties = memoryStore.profiles.filter(p => p.role === 'faculty');
      return faculties.map(f => {
        const courses = memoryStore.courses.filter(
          c => c.faculty_id === f.id || (c.faculty_email && c.faculty_email.toLowerCase() === f.email.toLowerCase())
        );
        return {
          id: f.id,
          name: f.name,
          email: f.email,
          department: f.department || 'Computer Science & Engineering',
          designation: f.designation || 'Faculty Member',
          courses: courses.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            section: c.section || 'Section A'
          }))
        };
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, department, designation')
      .eq('role', 'faculty')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async listStudentAssignments(studentId) {
    if (!isConfigured) {
      return memoryStore.courses.map(c => {
        const faculty = memoryStore.profiles.find(
          p => p.id === c.faculty_id || (c.faculty_email && p.email.toLowerCase() === c.faculty_email.toLowerCase())
        ) || {
          id: c.faculty_id || 'faculty-arpita',
          name: c.faculty_name || 'Dr. Arpita Sengupta',
          email: c.faculty_email || 'arpita.cse@aust.edu',
          department: c.department || 'Computer Science & Engineering',
          designation: 'Faculty Instructor'
        };

        const exams = memoryStore.exams.filter(e => e.course_id === c.id).map(e => {
          const questions = memoryStore.questions.filter(q => q.exam_id === e.id).map(q => {
            const clos = memoryStore.clos.filter(clo => clo.question_id === q.id);
            const studentSub = studentId 
              ? memoryStore.submissions.find(s => (s.question_id === q.id || s.question_id === q.question_number) && s.student_id === studentId)
              : null;
            
            const seedMeta = SEED_QUESTIONS_MAP[q.id] || SEED_QUESTIONS_MAP[q.question_number] || {};

            return {
              id: q.id,
              questionNumber: q.question_number,
              title: seedMeta.title || q.text?.slice(0, 45) || 'Exam Question',
              prompt: q.text || seedMeta.prompt,
              marks: `${q.max_marks || 10} Marks`,
              maxMarks: q.max_marks || 10.0,
              initialAnswer: seedMeta.initialAnswer || '',
              correctAnswer: q.correct_answer || seedMeta.correct_answer,
              isSolutionApproved: Boolean(q.is_solution_approved),
              clo: clos.length > 0 ? clos[0].description : (seedMeta.clo || 'CLO 1: Core Competency Analysis'),
              diagnosticMisconception: seedMeta.diagnosticMisconception || 'Misconception Analysis',
              diagnosticExplanation: seedMeta.diagnosticExplanation || 'Detailed diagnostic explanation.',
              remedialAction: seedMeta.remedialAction || 'Review core problem patterns.',
              cohortStat: seedMeta.cohortStat || '35% of students made this mistake',
              submission: studentSub ? {
                id: studentSub.id,
                answerText: studentSub.answer_text,
                misconceptionGroup: studentSub.misconception_group,
                feedback: studentSub.feedback,
                isCorrect: studentSub.is_correct,
                submittedAt: studentSub.created_at || studentSub.updated_at,
                targetFacultyId: studentSub.faculty_id || faculty.id,
                targetFacultyName: studentSub.faculty_name || faculty.name
              } : null
            };
          });

          return {
            id: e.id,
            title: e.title,
            dueDate: e.due_date || '2026-09-30',
            totalMarks: e.total_marks || 10,
            questions
          };
        });

        return {
          id: c.id,
          name: c.name,
          code: c.code,
          department: c.department || 'Computer Science & Engineering',
          section: c.section || 'Section A',
          faculty: {
            id: faculty.id,
            name: faculty.name,
            email: faculty.email,
            department: faculty.department || 'Computer Science & Engineering',
            designation: faculty.designation || 'Course Instructor'
          },
          assignments: exams
        };
      });
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id, name, code, faculty_id,
        profiles (id, name, email, department, designation),
        exams (
          id, title, due_date, total_marks,
          questions (
            id, question_number, text, correct_answer, max_marks, is_solution_approved,
            clos (code, description),
            submissions (id, student_id, answer_text, misconception_group, feedback, is_correct, created_at, faculty_id, faculty_name)
          )
        )
      `);
    if (error) throw error;
    return courses || [];
  },

  async setQuestionSolutionApproval({ questionId, isApproved }) {
    if (!isConfigured) {
      let q = memoryStore.questions.find(item => item.id === questionId || item.question_number === questionId);
      if (!q) {
        if (SEED_QUESTIONS_MAP[questionId]) {
          const seed = SEED_QUESTIONS_MAP[questionId];
          q = {
            id: seed.id,
            exam_id: seed.exam_id,
            question_number: seed.question_number,
            text: seed.prompt,
            correct_answer: seed.correct_answer,
            max_marks: seed.max_marks,
            is_solution_approved: Boolean(isApproved),
            created_at: new Date().toISOString()
          };
          memoryStore.questions.push(q);
        } else {
          throw new Error(`Question ${questionId} not found`);
        }
      }
      q.is_solution_approved = Boolean(isApproved);
      q.updated_at = new Date().toISOString();
      persistData();
      return q;
    }

    const { data, error } = await supabase
      .from('questions')
      .update({ is_solution_approved: Boolean(isApproved) })
      .or(`id.eq.${questionId},question_number.eq.${questionId}`)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // SUBMISSIONS & STUDENT LACKINGS REPO
  // ==========================================
  async createStudentSubmission({ questionId, studentId = null, studentName, answerText, facultyId = null, facultyName = null, courseCode = null, assignmentTitle = null }) {
    if (!isConfigured) {
      let existing = studentId 
        ? memoryStore.submissions.find(s => (s.question_id === questionId || s.question_id === (SEED_QUESTIONS_MAP[questionId]?.id)) && s.student_id === studentId)
        : null;

      if (existing) {
        existing.answer_text = answerText;
        if (facultyId) existing.faculty_id = facultyId;
        if (facultyName) existing.faculty_name = facultyName;
        if (courseCode) existing.course_code = courseCode;
        if (assignmentTitle) existing.assignment_title = assignmentTitle;
        existing.updated_at = new Date().toISOString();
        persistData();
        return existing;
      }

      const resolvedQ = memoryStore.questions.find(q => q.id === questionId || q.question_number === questionId);
      const qId = resolvedQ ? resolvedQ.id : questionId;

      const submission = {
        id: randomUUID(),
        question_id: qId,
        student_id: studentId,
        student_name: studentName || `Student ${memoryStore.submissions.length + 1}`,
        student_identifier: studentName || `Student ${memoryStore.submissions.length + 1}`,
        faculty_id: facultyId,
        faculty_name: facultyName,
        course_code: courseCode,
        assignment_title: assignmentTitle,
        answer_text: answerText,
        misconception_group: null,
        feedback: null,
        is_correct: false,
        created_at: new Date().toISOString()
      };
      memoryStore.submissions.push(submission);
      persistData();
      return submission;
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        question_id: questionId,
        student_id: studentId,
        student_name: studentName || 'Student',
        student_identifier: studentName || 'Student',
        faculty_id: facultyId,
        faculty_name: facultyName,
        answer_text: answerText
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSubmissionLacking({ submissionId, misconceptionGroup, feedback, isCorrect }) {
    if (!isConfigured) {
      const sub = memoryStore.submissions.find(s => s.id === submissionId);
      if (sub) {
        sub.misconception_group = misconceptionGroup;
        sub.feedback = feedback;
        sub.is_correct = isCorrect;
      }
      persistData();
      return sub;
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({
        misconception_group: misconceptionGroup,
        feedback,
        is_correct: isCorrect
      })
      .eq('id', submissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listSubmissionsForStudent(studentId) {
    if (!isConfigured) {
      return memoryStore.submissions
        .filter(s => s.student_id === studentId)
        .map(s => {
          const q = memoryStore.questions.find(item => item.id === s.question_id || item.question_number === s.question_id);
          const exam = q ? memoryStore.exams.find(e => e.id === q.exam_id) : null;
          const course = exam ? memoryStore.courses.find(c => c.id === exam.course_id) : null;
          const analysis = memoryStore.analyses.find(a => a.question_id === s.question_id);
          return {
            submission: s,
            question: q,
            exam,
            course,
            analysis
          };
        });
    }

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        questions (
          id,
          text,
          question_number,
          correct_answer,
          is_solution_approved,
          exams (
            id,
            title,
            courses (
              id,
              name,
              code
            )
          ),
          analyses (
            id,
            insight,
            intervention,
            misconception_groups
          )
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getStudentFeedbackForQuestion(studentId, questionId) {
    if (!isConfigured) {
      const submission = memoryStore.submissions.find(s => (s.question_id === questionId || s.question_id === (SEED_QUESTIONS_MAP[questionId]?.id)) && s.student_id === studentId);
      const question = memoryStore.questions.find(q => q.id === questionId || q.question_number === questionId);
      const analysis = memoryStore.analyses.find(a => a.question_id === questionId || a.question_id === question?.id);
      return {
        submission: submission || null,
        question: question || null,
        analysis: analysis || null
      };
    }

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        questions (
          id,
          text,
          question_number,
          correct_answer,
          is_solution_approved,
          analyses (*)
        )
      `)
      .eq('student_id', studentId)
      .eq('question_id', questionId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listSubmissionsForFaculty({ facultyId = null, examId = null, questionId = null } = {}) {
    if (!isConfigured) {
      let subs = [...memoryStore.submissions];
      if (questionId) {
        subs = subs.filter(s => s.question_id === questionId || s.question_id === (SEED_QUESTIONS_MAP[questionId]?.id));
      }
      if (facultyId) {
        const facultyCourseIds = memoryStore.courses
          .filter(c => c.faculty_id === facultyId || (c.faculty_email && c.faculty_email.toLowerCase() === facultyId.toLowerCase()))
          .map(c => c.id);
        const facultyExamIds = memoryStore.exams.filter(e => facultyCourseIds.includes(e.course_id)).map(e => e.id);
        const facultyQIds = memoryStore.questions.filter(q => facultyExamIds.includes(q.exam_id)).map(q => q.id);

        subs = subs.filter(s => s.faculty_id === facultyId || facultyQIds.includes(s.question_id) || facultyCourseIds.length === 0);
      }
      return subs.map(s => {
        const q = memoryStore.questions.find(item => item.id === s.question_id || item.question_number === s.question_id);
        const exam = q ? memoryStore.exams.find(e => e.id === q.exam_id) : null;
        const course = exam ? memoryStore.courses.find(c => c.id === exam.course_id) : null;
        const studentProfile = s.student_id ? memoryStore.profiles.find(p => p.id === s.student_id) : null;
        return {
          id: s.id,
          submissionId: s.id,
          questionId: s.question_id,
          questionNumber: q?.question_number || s.question_id,
          questionTitle: q?.text || s.assignment_title || 'Exam Question',
          studentId: s.student_id,
          studentName: s.student_name || studentProfile?.name || 'Student',
          studentIdentifier: studentProfile?.student_id_number || s.student_identifier || s.student_name,
          studentEmail: studentProfile?.email || null,
          targetFacultyId: s.faculty_id || course?.faculty_id || null,
          targetFacultyName: s.faculty_name || course?.faculty_name || 'Course Faculty',
          answerText: s.answer_text,
          misconceptionGroup: s.misconception_group,
          feedback: s.feedback,
          isCorrect: s.is_correct,
          score: s.score,
          submittedAt: s.created_at || s.updated_at,
          courseName: course?.name || 'Data Structures and Algorithms',
          courseCode: s.course_code || course?.code || 'CSE 2100',
          examTitle: s.assignment_title || exam?.title || 'Midterm Examination Fall 2026'
        };
      }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    let query = supabase
      .from('submissions')
      .select(`
        *,
        questions (
          id,
          text,
          question_number,
          is_solution_approved,
          exams (
            id,
            title,
            courses (
              id,
              name,
              code,
              faculty_id
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (questionId) {
      query = query.eq('question_id', questionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id,
      submissionId: s.id,
      questionId: s.question_id,
      questionNumber: s.questions?.question_number || 'Q',
      questionTitle: s.questions?.text || '',
      studentId: s.student_id,
      studentName: s.student_name || s.student_identifier || 'Student',
      studentIdentifier: s.student_identifier,
      targetFacultyId: s.faculty_id,
      targetFacultyName: s.faculty_name,
      answerText: s.answer_text,
      misconceptionGroup: s.misconception_group,
      feedback: s.feedback,
      isCorrect: s.is_correct,
      submittedAt: s.created_at,
      courseName: s.questions?.exams?.courses?.name,
      courseCode: s.questions?.exams?.courses?.code,
      examTitle: s.questions?.exams?.title
    }));
  },

  // ==========================================
  // ANALYSES REPO
  // ==========================================
  async saveAnalysisResult({ questionId, misconceptionGroups, insight, intervention, modelUsed = 'gemini-1.5-pro', totalSubmissions = 0 }) {
    if (!isConfigured) {
      // Remove old analysis if re-running
      memoryStore.analyses = memoryStore.analyses.filter(a => a.question_id !== questionId);

      const analysis = {
        id: randomUUID(),
        question_id: questionId,
        misconception_groups: misconceptionGroups,
        insight,
        intervention,
        model_used: modelUsed,
        total_submissions: totalSubmissions,
        created_at: new Date().toISOString()
      };
      memoryStore.analyses.push(analysis);
      persistData();
      return analysis;
    }

    // Delete existing analysis for this question if any (upsert behavior)
    await supabase.from('analyses').delete().eq('question_id', questionId);

    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        question_id: questionId,
        misconception_groups: misconceptionGroups,
        insight,
        intervention,
        model_used: modelUsed,
        total_submissions: totalSubmissions
      })
      .select()
      .single();

    if (error) throw error;
    return analysis;
  },

  async getAnalysisById({ id, facultyId }) {
    if (!isConfigured) {
      const analysis = memoryStore.analyses.find(a => a.id === id);
      if (!analysis) return null;

      const question = memoryStore.questions.find(q => q.id === analysis.question_id);
      if (!question) return null;

      const exam = memoryStore.exams.find(e => e.id === question.exam_id);
      if (!exam) return null;

      const course = memoryStore.courses.find(c => c.id === exam.course_id);
      if (!course || (facultyId && course.faculty_id !== facultyId)) return null;

      return {
        ...analysis,
        question,
        exam,
        course
      };
    }

    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        question_id,
        misconception_groups,
        insight,
        intervention,
        model_used,
        total_submissions,
        created_at,
        questions!inner (
          id,
          text,
          question_number,
          correct_answer,
          exams!inner (
            id,
            title,
            courses!inner (
              id,
              name,
              code,
              faculty_id
            )
          )
        )
      `)
      .eq('id', id)
      .eq('questions.exams.courses.faculty_id', facultyId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async listAnalysesForFaculty({ facultyId, examId = null }) {
    if (!isConfigured) {
      const facultyCourseIds = memoryStore.courses
        .filter(c => !facultyId || c.faculty_id === facultyId)
        .map(c => c.id);

      const facultyExamIds = memoryStore.exams
        .filter(e => facultyCourseIds.includes(e.course_id) && (!examId || e.id === examId))
        .map(e => e.id);

      const facultyQuestionIds = memoryStore.questions
        .filter(q => facultyExamIds.includes(q.exam_id))
        .map(q => q.id);

      return memoryStore.analyses
        .filter(a => facultyQuestionIds.includes(a.question_id))
        .map(a => {
          const q = memoryStore.questions.find(item => item.id === a.question_id);
          return { ...a, question: q };
        });
    }

    let query = supabase
      .from('analyses')
      .select(`
        id,
        question_id,
        misconception_groups,
        insight,
        intervention,
        model_used,
        total_submissions,
        created_at,
        questions!inner (
          id,
          text,
          question_number,
          correct_answer,
          exam_id,
          exams!inner (
            id,
            title,
            courses!inner (
              id,
              name,
              code,
              faculty_id
            )
          )
        )
      `)
      .eq('questions.exams.courses.faculty_id', facultyId);

    if (examId) {
      query = query.eq('questions.exam_id', examId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  _memoryStore: memoryStore
};

module.exports = {
  supabase,
  db
};
