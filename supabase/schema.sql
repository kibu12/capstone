-- Supabase Schema for Career Pathfinder AI Platform

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    target_role TEXT,
    experience_level TEXT,
    career_goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    interests JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    preferred_industries JSONB DEFAULT '[]'::jsonb,
    experience_level TEXT,
    target_role TEXT,
    career_goal TEXT,
    assessment_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assessments"
    ON public.assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
    ON public.assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create career_recommendations table
CREATE TABLE IF NOT EXISTS public.career_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommended_role TEXT NOT NULL,
    career_score INTEGER NOT NULL,
    summary TEXT,
    reasoning JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    priority_skills JSONB DEFAULT '[]'::jsonb,
    salary_range TEXT,
    demand_level TEXT,
    growth_rate TEXT,
    analysis_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own career recommendations"
    ON public.career_recommendations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career recommendations"
    ON public.career_recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create skill_gaps table
CREATE TABLE IF NOT EXISTS public.skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    current_level INTEGER DEFAULT 0,
    required_level INTEGER DEFAULT 0,
    priority TEXT,
    category TEXT,
    status TEXT DEFAULT 'Not Started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skill gaps"
    ON public.skill_gaps FOR ALL
    USING (auth.uid() = user_id);

-- Create learning_roadmap table
CREATE TABLE IF NOT EXISTS public.learning_roadmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    phase INTEGER NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    resources JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Not Started',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.learning_roadmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own learning roadmap"
    ON public.learning_roadmap FOR ALL
    USING (auth.uid() = user_id);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Not Started',
    estimated_time TEXT,
    portfolio_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
    ON public.projects FOR ALL
    USING (auth.uid() = user_id);

-- Create Career Knowledge table for RAG local fallback & database store
CREATE TABLE IF NOT EXISTS public.career_knowledge (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.career_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to career knowledge"
    ON public.career_knowledge FOR SELECT
    USING (true);


-- Profiles sync trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS assessments_user_id_idx ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS recommendations_user_id_idx ON public.career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS skill_gaps_user_id_idx ON public.skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS roadmap_user_id_idx ON public.learning_roadmap(user_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);

-- LEARNING INTELLIGENCE TABLES

-- 1. courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    skill TEXT NOT NULL,
    category TEXT,
    difficulty TEXT DEFAULT 'Intermediate',
    estimated_hours INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Not Started',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own courses" ON public.courses FOR ALL USING (auth.uid() = user_id);

-- 2. learning_resources
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- documentation, video, paper, github, tutorial
    provider TEXT,
    difficulty TEXT,
    duration TEXT,
    thumbnail_url TEXT,
    relevance_score FLOAT DEFAULT 1.0,
    is_recommended BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'Not Started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own learning resources" ON public.learning_resources FOR ALL USING (auth.uid() = user_id);

-- 3. study_materials
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    overview TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    difficulty TEXT DEFAULT 'Intermediate',
    estimated_minutes INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own study materials" ON public.study_materials FOR ALL USING (auth.uid() = user_id);

-- 4. quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate',
    total_questions INTEGER DEFAULT 5,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quizzes" ON public.quizzes FOR ALL USING (auth.uid() = user_id);

-- 5. quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    concept_name TEXT NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL, -- A, B, C, D
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium'
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Users insert quiz questions" ON public.quiz_questions FOR INSERT WITH CHECK (true);

-- 6. quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- 7. concept_performance
CREATE TABLE IF NOT EXISTS public.concept_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    concept_name TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    mastery_score INTEGER DEFAULT 50, -- 0 to 100
    status TEXT DEFAULT 'Developing', -- Critical, Weak, Developing, Strong, Mastered
    attempts_count INTEGER DEFAULT 1,
    last_tested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.concept_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own concept performance" ON public.concept_performance FOR ALL USING (auth.uid() = user_id);

-- 8. interview_assessments
CREATE TABLE IF NOT EXISTS public.interview_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    overall_readiness_score INTEGER NOT NULL,
    technical_score INTEGER DEFAULT 0,
    concept_score INTEGER DEFAULT 0,
    problem_solving_score INTEGER DEFAULT 0,
    readiness_level TEXT DEFAULT 'Developing', -- Not Ready, Early Prep, Developing, Almost Ready, Interview Ready
    feedback JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.interview_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interview assessments" ON public.interview_assessments FOR ALL USING (auth.uid() = user_id);

-- 9. skill_profiles (Structured Skill Vector per User)
CREATE TABLE IF NOT EXISTS public.skill_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill TEXT NOT NULL,
    proficiency FLOAT DEFAULT 0.0, -- 0.0 to 1.0
    confidence FLOAT DEFAULT 0.3, -- 0.0 to 1.0
    evidence_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'unknown', -- strong, developing, weak, unknown
    trend TEXT DEFAULT 'unknown', -- improving, stable, declining, unknown
    last_assessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, skill)
);

ALTER TABLE public.skill_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own skill profiles" ON public.skill_profiles FOR ALL USING (auth.uid() = user_id);

-- 10. agent_logs (Observability and Telemetry)
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    input_summary TEXT,
    output_summary TEXT,
    model TEXT,
    model_parameters JSONB DEFAULT '{}'::jsonb,
    validation_result TEXT DEFAULT 'passed',
    confidence FLOAT DEFAULT 1.0,
    latency_ms INTEGER DEFAULT 0,
    token_usage JSONB,
    errors JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to agent logs" ON public.agent_logs FOR SELECT USING (true);
CREATE POLICY "Allow system insert to agent logs" ON public.agent_logs FOR INSERT WITH CHECK (true);

-- 11. recommendation_history (Prevents Feedback Loops)
CREATE TABLE IF NOT EXISTS public.recommendation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill TEXT NOT NULL,
    content_id TEXT,
    status TEXT DEFAULT 'recommended', -- recommended, learning, completed, rejected, mastered
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation history" ON public.recommendation_history FOR ALL USING (auth.uid() = user_id);

-- 12. evaluation_metrics (Golden Dataset Run Results & Quality Metrics)
CREATE TABLE IF NOT EXISTS public.evaluation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id TEXT NOT NULL,
    pass_rate FLOAT NOT NULL,
    total_tests INTEGER NOT NULL,
    passed_tests INTEGER NOT NULL,
    failed_tests INTEGER NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    suite_results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.evaluation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to evaluation metrics" ON public.evaluation_metrics FOR SELECT USING (true);
CREATE POLICY "Allow system insert to evaluation metrics" ON public.evaluation_metrics FOR INSERT WITH CHECK (true);


