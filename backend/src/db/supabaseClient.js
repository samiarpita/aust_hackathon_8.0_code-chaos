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

// Seed default preset questions if none exist
if (memoryStore.questions.length === 0) {
  const defaultCourseId = 'course-cse2100';
  const defaultExamId = 'exam-midterm-fall2026';

  memoryStore.courses.push({
    id: defaultCourseId,
    faculty_id: 'faculty-default',
    name: 'Data Structures and Algorithms',
    code: 'CSE 2100',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  memoryStore.exams.push({
    id: defaultExamId,
    course_id: defaultCourseId,
    title: 'Midterm Examination Fall 2026',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const q1 = {
    id: 'Q1',
    exam_id: defaultExamId,
    question_number: 'Q1',
    text: 'Explain recursion and why the base case terminates the call stack.',
    correct_answer: 'A base case is a terminating condition in a recursive function that returns a value directly without making further recursive calls, preventing stack overflow.',
    max_marks: 5.0,
    created_at: new Date().toISOString()
  };
  const q2 = {
    id: 'Q2',
    exam_id: defaultExamId,
    question_number: 'Q2',
    text: 'Explain the difference between stack and heap memory allocation in C.',
    correct_answer: 'Stack memory is automatically managed for local variables and function calls, while heap memory is manually allocated via malloc() and persists until freed.',
    max_marks: 5.0,
    created_at: new Date().toISOString()
  };
  const q3 = {
    id: 'Q3',
    exam_id: defaultExamId,
    question_number: 'Q3',
    text: 'Explain how the base case works in recursion and write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list.',
    correct_answer: 'Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}',
    max_marks: 10.0,
    created_at: new Date().toISOString()
  };

  memoryStore.questions.push(q1, q2, q3);
  persistData();
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
  // SUBMISSIONS & STUDENT LACKINGS REPO
  // ==========================================
  async createStudentSubmission({ questionId, studentId = null, studentName, answerText }) {
    if (!isConfigured) {
      // If a specific logged-in student already submitted for this question, update it, else insert new
      let existing = studentId 
        ? memoryStore.submissions.find(s => s.question_id === questionId && s.student_id === studentId)
        : null;

      if (existing) {
        existing.answer_text = answerText;
        existing.updated_at = new Date().toISOString();
        persistData();
        return existing;
      }
      const submission = {
        id: randomUUID(),
        question_id: questionId,
        student_id: studentId,
        student_name: studentName || `Student ${memoryStore.submissions.length + 1}`,
        student_identifier: studentName || `Student ${memoryStore.submissions.length + 1}`,
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
          const q = memoryStore.questions.find(item => item.id === s.question_id);
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
      const submission = memoryStore.submissions.find(s => s.question_id === questionId && s.student_id === studentId);
      const question = memoryStore.questions.find(q => q.id === questionId);
      const analysis = memoryStore.analyses.find(a => a.question_id === questionId);
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
        subs = subs.filter(s => s.question_id === questionId);
      }
      return subs.map(s => {
        const q = memoryStore.questions.find(item => item.id === s.question_id);
        const exam = q ? memoryStore.exams.find(e => e.id === q.exam_id) : null;
        const course = exam ? memoryStore.courses.find(c => c.id === exam.course_id) : null;
        const studentProfile = s.student_id ? memoryStore.profiles.find(p => p.id === s.student_id) : null;
        return {
          id: s.id,
          submissionId: s.id,
          questionId: s.question_id,
          questionNumber: q?.question_number || s.question_id,
          questionTitle: q?.text || 'Exam Question',
          studentId: s.student_id,
          studentName: s.student_name || studentProfile?.name || 'Student',
          studentIdentifier: studentProfile?.student_id_number || s.student_identifier || s.student_name,
          studentEmail: studentProfile?.email || null,
          answerText: s.answer_text,
          misconceptionGroup: s.misconception_group,
          feedback: s.feedback,
          isCorrect: s.is_correct,
          score: s.score,
          submittedAt: s.created_at || s.updated_at,
          courseName: course?.name || 'Data Structures and Algorithms',
          courseCode: course?.code || 'CSE 2100',
          examTitle: exam?.title || 'Midterm Examination Fall 2026'
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
