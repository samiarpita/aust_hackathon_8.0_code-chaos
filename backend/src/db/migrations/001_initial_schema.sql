-- ==============================================================================
-- Student Misconception Radar - Database Schema (Supabase / PostgreSQL)
-- Migration 001: Initial Schema, Indexes, and Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. COURSES TABLE
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
-- 2. EXAMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. QUESTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_number VARCHAR(50),
    text TEXT NOT NULL,
    max_marks NUMERIC(5, 2) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. CLOS (Course Learning Outcomes) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    code VARCHAR(50), -- e.g. "CLO-2", "CLO-3"
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. SUBMISSIONS TABLE (Student Answers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    student_identifier VARCHAR(100), -- e.g. "Student 1", "20210104001"
    answer_text TEXT NOT NULL,
    score NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. ANALYSES TABLE (AI Misconception Clusters & Insights)
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
-- INDEXES FOR HIGH-PERFORMANCE LOOKUPS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_clos_question_id ON public.clos(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question_id ON public.submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_analyses_question_id ON public.analyses(question_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Courses RLS
CREATE POLICY "Faculty manage own courses"
ON public.courses
FOR ALL
USING (auth.uid() = faculty_id)
WITH CHECK (auth.uid() = faculty_id);

-- Exams RLS
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

-- Questions RLS
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

-- CLOs RLS
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

-- Submissions RLS
CREATE POLICY "Faculty manage own submissions"
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

-- Analyses RLS
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
