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
