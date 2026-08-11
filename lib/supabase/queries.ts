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
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
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
}
