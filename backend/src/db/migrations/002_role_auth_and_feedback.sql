-- ==============================================================================
-- Student Misconception Radar - Database Schema (Supabase / PostgreSQL)
-- Migration 002: Role-Based Profiles, Correct Answers, Student Feedback & Enrollments
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Role-based: faculty or student)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('faculty', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. EXTEND QUESTIONS TABLE WITH CORRECT_ANSWER
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'correct_answer') THEN
        ALTER TABLE public.questions ADD COLUMN correct_answer TEXT;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. EXTEND SUBMISSIONS TABLE WITH STUDENT MAPPING & INDIVIDUAL LACKING FEEDBACK
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'student_id') THEN
        ALTER TABLE public.submissions ADD COLUMN student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'student_name') THEN
        ALTER TABLE public.submissions ADD COLUMN student_name VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'misconception_group') THEN
        ALTER TABLE public.submissions ADD COLUMN misconception_group VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'feedback') THEN
        ALTER TABLE public.submissions ADD COLUMN feedback TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'is_correct') THEN
        ALTER TABLE public.submissions ADD COLUMN is_correct BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. ENROLLMENTS TABLE (Connects students to courses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(course_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 5. INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- ------------------------------------------------------------------------------
-- 6. RLS POLICIES FOR PROFILES & STUDENT VIEWS
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users manage own profile"
ON public.profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Profiles: Faculty can view student profiles enrolled in their courses
CREATE POLICY "Faculty view student profiles"
ON public.profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        JOIN public.enrollments ON enrollments.course_id = courses.id
        WHERE courses.faculty_id = auth.uid()
        AND enrollments.student_id = profiles.id
    )
);

-- Enrollments: Students can view their enrollments
CREATE POLICY "Students view own enrollments"
ON public.enrollments
FOR SELECT
USING (auth.uid() = student_id);

-- Enrollments: Faculty can manage enrollments in their courses
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

-- Submissions: Students can view their own submissions and feedbacks
CREATE POLICY "Students view own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = student_id);

-- Submissions: Students can insert submissions for questions in enrolled courses
CREATE POLICY "Students submit answers"
ON public.submissions
FOR INSERT
WITH CHECK (
    auth.uid() = student_id
);
