const { z } = require('zod');

// Password Regex: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/;

// ------------------------------------------------------------------------------
// AUTH SCHEMAS
// ------------------------------------------------------------------------------
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full Name must be at least 2 characters long'),
  email: z.string().trim().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    ),
  role: z.enum(['faculty', 'student'], {
    errorMap: () => ({ message: "Role must be either 'faculty' or 'student'" })
  }),
  studentId: z.string().trim().optional(),
  idNumber: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  department: z.string().trim().optional()
}).refine(
  data => {
    if (data.role === 'student') {
      const sid = data.studentId || data.idNumber;
      return sid && sid.length >= 2 && data.semester && data.semester.length >= 2;
    }
    return true;
  },
  {
    message: 'Student ID Number and Semester are required for student registration'
  }
);

const loginSchema = z.object({
  email: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  idNumber: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['faculty', 'student']).optional()
}).refine(
  data => {
    return (data.email && data.email.length > 0) || (data.studentId && data.studentId.length > 0) || (data.idNumber && data.idNumber.length > 0);
  },
  {
    message: 'Email or Student ID Number is required to login'
  }
);

// ------------------------------------------------------------------------------
// COURSE & EXAM SCHEMAS
// ------------------------------------------------------------------------------
const createCourseSchema = z.object({
  name: z.string().trim().min(2, 'Course name is required'),
  code: z.string().trim().min(2, 'Course code is required (e.g. CSE 2100)')
});

const createExamSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  title: z.string().trim().min(2, 'Exam title is required')
});

const postAssignmentSchema = z.object({
  courseId: z.string().optional().nullable(),
  courseCode: z.string().trim().min(2, 'Course code is required (e.g. CSE 2100)').optional(),
  courseName: z.string().trim().min(2, 'Course name is required').optional(),
  assignmentTitle: z.string().trim().min(2, 'Assignment title is required'),
  assignmentType: z.enum(['code', 'theory']).default('code'),
  dueDate: z.string().optional().default('2026-09-30'),
  totalMarks: z.number().optional().default(10),
  questionNumber: z.string().trim().default('Q1'),
  questionText: z.string().trim().min(5, 'Question text must be at least 5 characters long'),
  correctAnswer: z.string().trim().optional().nullable().default(''),
  maxMarks: z.number().optional().default(10),
  clos: z.array(z.string().or(z.object({ code: z.string().optional(), description: z.string() }))).optional().default([]),
  isSolutionApproved: z.boolean().optional().default(false),
  diagnosticMisconception: z.string().optional().default(''),
  diagnosticExplanation: z.string().optional().default(''),
  remedialAction: z.string().optional().default(''),
  facultyId: z.string().optional().nullable(),
  facultyName: z.string().optional().nullable(),
  facultyEmail: z.string().optional().nullable()
});

// ------------------------------------------------------------------------------
// QUESTION SCHEMAS
// ------------------------------------------------------------------------------
const createQuestionSchema = z.object({
  examId: z.string().min(1, 'examId is required'),
  questionNumber: z.string().trim().default('Q1'),
  text: z.string().trim().min(5, 'Question text must be at least 5 characters long'),
  correctAnswer: z.string().trim().optional(),
  maxMarks: z.number().optional().default(10.0),
  clos: z.array(z.string().or(z.object({ code: z.string().optional(), description: z.string() }))).optional().default([])
});

// ------------------------------------------------------------------------------
// STUDENT SUBMISSION SCHEMA
// ------------------------------------------------------------------------------
const studentSubmissionSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  answerText: z.string().trim().min(2, 'Answer text must be provided'),
  facultyId: z.string().optional().nullable(),
  facultyName: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  courseCode: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
  assignmentTitle: z.string().optional().nullable()
});

// ------------------------------------------------------------------------------
// ANALYSIS SCHEMAS
// ------------------------------------------------------------------------------
const adHocAnalysisSchema = z.object({
  questionText: z
    .string({
      required_error: 'questionText is required',
      invalid_type_error: 'questionText must be a string'
    })
    .trim()
    .min(5, 'questionText must be at least 5 characters long'),
  clos: z.array(z.string().or(z.object({ code: z.string().optional(), description: z.string() }))).optional().default([]),
  answers: z
    .array(
      z.string().or(z.object({ answer_text: z.string(), student_id: z.string().optional(), student_name: z.string().optional() })),
      {
        required_error: 'answers array is required',
        invalid_type_error: 'answers must be an array of student responses'
      }
    )
    .min(2, 'At least 2 student answers are required for misconception analysis'),
  assignmentType: z.enum(['code', 'theory']).optional().default('code'),
  examId: z.string().optional(),
  courseId: z.string().optional(),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  assignmentTitle: z.string().optional(),
  questionNumber: z.string().optional(),
  correctAnswer: z.string().optional(),
  isSolutionApproved: z.boolean().optional(),
  questionId: z.string().optional()
});

const storedQuestionAnalysisSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  clos: z.array(z.string().or(z.object({ code: z.string().optional(), description: z.string() }))).optional().default([]),
  answers: z
    .array(z.string().or(z.object({ answer_text: z.string(), student_id: z.string().optional(), student_name: z.string().optional() })))
    .optional(),
  assignmentType: z.enum(['code', 'theory']).optional().default('code'),
  examId: z.string().optional(),
  courseId: z.string().optional(),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  assignmentTitle: z.string().optional(),
  questionNumber: z.string().optional(),
  correctAnswer: z.string().optional(),
  isSolutionApproved: z.boolean().optional(),
  questionText: z.string().optional()
});

/**
 * Validation Middleware Generator
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map(e => e.message).join(', ');
        return res.status(400).json({ error: `Validation error: ${errorMessages}` });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
}

/**
 * Dedicated Validator for Analysis endpoints
 */
function validateCreateAnalysis(req, res, next) {
  if (req.body && req.body.questionId) {
    try {
      const validated = storedQuestionAnalysisSchema.parse(req.body);
      req.validatedBody = validated;
      return next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map(e => e.message).join(', ');
        return res.status(400).json({ error: `Validation error: ${errorMessages}` });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  try {
    const validated = adHocAnalysisSchema.parse(req.body);
    req.validatedBody = validated;
    return next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessages = err.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${errorMessages}` });
    }
    return res.status(400).json({ error: 'Invalid request body' });
  }
}

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  createCourseSchema,
  createExamSchema,
  postAssignmentSchema,
  createQuestionSchema,
  studentSubmissionSchema,
  adHocAnalysisSchema,
  validateCreateAnalysis
};
