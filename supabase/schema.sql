-- ==============================================================================
-- Student Misconception Radar - Complete Database Schema (Supabase / PostgreSQL)
-- Hackathon Theme: AI for Academic Life (AUST CSE Carnival 8.0)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Role-based authentication: faculty and student)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('faculty', 'student')),
    student_id_number VARCHAR(100),
    semester VARCHAR(100),
    department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. COURSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. ENROLLMENTS TABLE (Connects students to courses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(course_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 4. EXAMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. QUESTIONS TABLE (Includes faculty correct_answer benchmark)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_number VARCHAR(50) DEFAULT 'Q1',
    text TEXT NOT NULL,
    correct_answer TEXT,
    max_marks NUMERIC(5, 2) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. CLOS (Course Learning Outcomes) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    code VARCHAR(50), -- e.g. "CLO-2", "CLO-3"
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. SUBMISSIONS TABLE (Student Answers & Diagnostic Lackings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_name VARCHAR(100),
    student_identifier VARCHAR(100), -- e.g. "Student 1", "20210104001"
    answer_text TEXT NOT NULL,
    misconception_group VARCHAR(255),
    feedback TEXT,
    is_correct BOOLEAN DEFAULT false,
    score NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. ANALYSES TABLE (AI Misconception Breakdown, Insights & Interventions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    misconception_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
    insight TEXT NOT NULL,
    intervention TEXT NOT NULL,
    model_used VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    total_submissions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR HIGH PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id_number);
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_clos_question_id ON public.clos(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question_id ON public.submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_analyses_question_id ON public.analyses(question_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users manage own profile"
ON public.profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Courses Policies (Faculty CRUD own courses)
CREATE POLICY "Faculty manage own courses"
ON public.courses
FOR ALL
USING (auth.uid() = faculty_id)
WITH CHECK (auth.uid() = faculty_id);

-- Courses Policy (Students can view enrolled courses)
CREATE POLICY "Students view enrolled courses"
ON public.courses
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.course_id = courses.id
        AND enrollments.student_id = auth.uid()
    )
);

-- Enrollments Policies
CREATE POLICY "Students view own enrollments"
ON public.enrollments
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Faculty manage course enrollments"
ON public.enrollments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = enrollments.course_id
        AND courses.faculty_id = auth.uid()
    )
);

-- Exams Policies
CREATE POLICY "Faculty manage own exams"
ON public.exams
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = exams.course_id
        AND courses.faculty_id = auth.uid()
    )
);

CREATE POLICY "Students view exams of enrolled courses"
ON public.exams
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.course_id = exams.course_id
        AND enrollments.student_id = auth.uid()
    )
);

-- Questions Policies
CREATE POLICY "Faculty manage own questions"
ON public.questions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        JOIN public.courses ON courses.id = exams.course_id
        WHERE exams.id = questions.exam_id
        AND courses.faculty_id = auth.uid()
    )
);

CREATE POLICY "Students view questions of enrolled exams"
ON public.questions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        JOIN public.enrollments ON enrollments.course_id = exams.course_id
        WHERE exams.id = questions.exam_id
        AND enrollments.student_id = auth.uid()
    )
);

-- CLOs Policies
CREATE POLICY "Faculty manage own clos"
ON public.clos
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.exams ON exams.id = questions.exam_id
        JOIN public.courses ON courses.id = exams.course_id
        WHERE questions.id = clos.question_id
        AND courses.faculty_id = auth.uid()
    )
);

-- Submissions Policies
CREATE POLICY "Faculty manage all submissions in own courses"
ON public.submissions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.exams ON exams.id = questions.exam_id
        JOIN public.courses ON courses.id = exams.course_id
        WHERE questions.id = submissions.question_id
        AND courses.faculty_id = auth.uid()
    )
);

CREATE POLICY "Students view own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students insert own submissions"
ON public.submissions
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Analyses Policies
CREATE POLICY "Faculty manage own analyses"
ON public.analyses
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.exams ON exams.id = questions.exam_id
        JOIN public.courses ON courses.id = exams.course_id
        WHERE questions.id = analyses.question_id
        AND courses.faculty_id = auth.uid()
    )
);

CREATE POLICY "Students view analyses for their questions"
ON public.analyses
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.exams ON exams.id = questions.exam_id
        JOIN public.enrollments ON enrollments.course_id = exams.course_id
        WHERE questions.id = analyses.question_id
        AND enrollments.student_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- STORAGE BUCKETS (For PDF/image uploads like question papers or answer sheets)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exam_documents', 'exam_documents', true)
ON CONFLICT (id) DO NOTHING;
