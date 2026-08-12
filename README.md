# Career PathFinder

## Overview
Career PathFinder is an AI-powered Career Intelligence Platform built with Next.js, Tailwind CSS, TypeScript, and Supabase. The platform helps individuals identify skills gaps, track progress, map learning paths, and discover portfolio opportunities.

## Tech Stack
- Next.js (App Router)
- Supabase (Database & Authentication)
- Tailwind CSS
- Lucide React (Icons)
- TypeScript

## RAG & Multi-Agent Architecture
The application runs a 4-Agent Pipeline powered by a local Retrieval-Augmented Generation (RAG) engine:
1. **Research Agent**: Queries a local vector knowledge store containing detailed data sheets for 10 core careers.
2. **Skill Gap Agent**: Evaluates user assessment parameters against RAG requirements to calculate gap sizes and prioritizations.
3. **Roadmap Agent**: Sequences phases and identifies learning resources.
4. **Advisor Agent**: Formulates readiness percentages, growth outlooks, and rationale items.

## Local Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd capstone
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and add your credentials:
   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
   ```
3. Open your Supabase project's **SQL Editor** and run the contents of [schema.sql](file:///c:/Users/dell_/OneDrive/Desktop/capstone/supabase/schema.sql).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application.
"# capstone" 
