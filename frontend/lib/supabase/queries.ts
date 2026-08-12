import { supabase } from './client';
import { CareerAssessment, CareerRecommendation, SkillGap, RoadmapPhase, ProjectRecommendation, UserProfile } from '@/types/career';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates }, { onConflict: 'id' });
  } catch (e) {
    // Suppress console error overlays for non-critical profile meta updates
  }
}

export async function saveAssessment(userId: string, assessment: Omit<CareerAssessment, 'user_id'>) {
  const { error } = await supabase
    .from('assessments')
    .insert([{ ...assessment, user_id: userId }]);
  if (error) throw error;
}

export async function getAssessment(userId: string): Promise<CareerAssessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getCareerRecommendation(userId: string): Promise<CareerRecommendation | null> {
  const { data, error } = await supabase
    .from('career_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function saveCareerRecommendation(userId: string, rec: Omit<CareerRecommendation, 'user_id'>) {
  const { error } = await supabase
    .from('career_recommendations')
    .insert([{ ...rec, user_id: userId }]);
  if (error) throw error;
}

export async function getSkillGaps(userId: string): Promise<SkillGap[]> {
  const { data, error } = await supabase
    .from('skill_gaps')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function saveSkillGaps(userId: string, gaps: Omit<SkillGap, 'user_id'>[]) {
  const rows = gaps.map(g => ({ ...g, user_id: userId }));
  const { error } = await supabase
    .from('skill_gaps')
    .insert(rows);
  if (error) throw error;
}

export async function updateSkillStatus(skillId: string, status: string, currentLevel: number) {
  const { error } = await supabase
    .from('skill_gaps')
    .update({ status, current_level: currentLevel })
    .eq('id', skillId);
  if (error) throw error;
}

export async function getRoadmap(userId: string): Promise<RoadmapPhase[]> {
  const { data, error } = await supabase
    .from('learning_roadmap')
    .select('*')
    .eq('user_id', userId)
    .order('phase', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function saveRoadmapPhases(userId: string, phases: Omit<RoadmapPhase, 'user_id'>[]) {
  const rows = phases.map(p => ({ ...p, user_id: userId }));
  const { error } = await supabase
    .from('learning_roadmap')
    .insert(rows);
  if (error) throw error;
}

export async function updateRoadmapProgress(phaseId: string, progress: number, status: string) {
  const { error } = await supabase
    .from('learning_roadmap')
    .update({ progress, status })
    .eq('id', phaseId);
  if (error) throw error;
}

export async function getProjects(userId: string): Promise<ProjectRecommendation[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (error) return [];
  return data || [];
}

export async function saveProjects(userId: string, projects: Omit<ProjectRecommendation, 'user_id'>[]) {
  const rows = projects.map(p => ({ ...p, user_id: userId }));
  const { error } = await supabase
    .from('projects')
    .insert(rows);
  if (error) throw error;
}

export async function updateProjectStatus(projectId: string, status: string) {
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId);
  if (error) throw error;
}

// Clear out old results so we can re-analyze cleanly
export async function clearExistingCareerData(userId: string) {
  await supabase.from('career_recommendations').delete().eq('user_id', userId);
  await supabase.from('skill_gaps').delete().eq('user_id', userId);
  await supabase.from('learning_roadmap').delete().eq('user_id', userId);
  await supabase.from('projects').delete().eq('user_id', userId);
  await supabase.from('courses').delete().eq('user_id', userId);
}

// LEARNING INTELLIGENCE QUERIES

export async function getCourses(userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function saveCourses(userId: string, courses: any[]) {
  const rows = courses.map(c => ({ ...c, user_id: userId }));
  const { data, error } = await supabase.from('courses').insert(rows).select();
  if (error) throw error;
  return data || [];
}

export async function updateCourseProgress(courseId: string, progress: number, status: string) {
  try {
    await supabase
      .from('courses')
      .update({ progress, status })
      .eq('id', courseId);
  } catch (e) {
    // Suppress errors for local mock course items
  }
}

export async function getLearningResources(userId: string) {
  const { data, error } = await supabase
    .from('learning_resources')
    .select('*')
    .eq('user_id', userId)
    .order('relevance_score', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function saveLearningResources(userId: string, resources: any[]) {
  const rows = resources.map(r => ({ ...r, user_id: userId }));
  const { error } = await supabase.from('learning_resources').insert(rows);
  if (error) throw error;
}

export async function getStudyMaterials(userId: string) {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

export async function saveStudyMaterials(userId: string, materials: any[]) {
  const rows = materials.map(m => ({ ...m, user_id: userId }));
  const { error } = await supabase.from('study_materials').insert(rows);
  if (error) throw error;
}

export async function getQuizzes(userId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

export async function saveQuiz(userId: string, quiz: any, questions: any[]) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ ...quiz, user_id: userId }])
    .select()
    .single();

  if (error) throw error;

  if (data && questions.length > 0) {
    const qRows = questions.map(q => ({ ...q, quiz_id: data.id }));
    await supabase.from('quiz_questions').insert(qRows);
  }
  return data;
}

export async function saveQuizAttempt(userId: string, attempt: any) {
  try {
    await supabase
      .from('quiz_attempts')
      .insert([{ ...attempt, user_id: userId }]);
  } catch (e) {
    // Suppress console error overlays for non-critical quiz attempt records
  }
}

export async function getLatestQuizAttempt(userId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getConceptPerformances(userId: string) {
  const { data, error } = await supabase
    .from('concept_performance')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

export async function updateConceptPerformance(userId: string, conceptName: string, skillName: string, isCorrect: boolean) {
  try {
    const { data } = await supabase
      .from('concept_performance')
      .select('*')
      .eq('user_id', userId)
      .eq('concept_name', conceptName)
      .maybeSingle();

    if (data) {
      const newCount = (data.attempts_count || 1) + 1;
      const currentScore = data.mastery_score || 50;
      const delta = isCorrect ? 15 : -20;
      const newScore = Math.min(100, Math.max(0, currentScore + delta));

      let status = 'Developing';
      if (newScore >= 90) status = 'Mastered';
      else if (newScore >= 75) status = 'Strong';
      else if (newScore >= 60) status = 'Developing';
      else if (newScore >= 40) status = 'Weak';
      else status = 'Critical';

      await supabase
        .from('concept_performance')
        .update({ mastery_score: newScore, status, attempts_count: newCount, last_tested_at: new Date().toISOString() })
        .eq('id', data.id);
    } else {
      const initialScore = isCorrect ? 70 : 35;
      const status = isCorrect ? 'Developing' : 'Weak';
      await supabase
        .from('concept_performance')
        .insert([{
          user_id: userId,
          concept_name: conceptName,
          skill_name: skillName,
          mastery_score: initialScore,
          status,
          attempts_count: 1
        }]);
    }
  } catch (e) {
    // Suppress console error overlays for non-critical quiz attempt performance inserts
  }
}

export async function getInterviewAssessment(userId: string) {
  const { data, error } = await supabase
    .from('interview_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function saveInterviewAssessment(userId: string, assessment: any) {
  const { error } = await supabase
    .from('interview_assessments')
    .insert([{ ...assessment, user_id: userId }]);
  if (error) throw error;
}

