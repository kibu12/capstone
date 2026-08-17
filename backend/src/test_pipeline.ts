import { runCareerAnalysis } from './lib/agents/orchestrator';

async function test() {
  console.log('🧪 Starting End-to-End Multi-Agent Pipeline Test with live Ollama model...');
  const result = await runCareerAnalysis(
    'user-123',
    { id: 'user-123', full_name: 'Test User', email: 'test@example.com', experience_level: 'Entry Level' },
    {
      user_id: 'user-123',
      target_role: 'AI Engineer',
      experience_level: 'Entry Level',
      interests: ['Python', 'PyTorch', 'RAG Architecture'],
      skills: ['Python', 'Git'],
      preferred_industries: ['Tech'],
      career_goal: 'AI Engineer',
      assessment_score: 85
    }
  );

  console.log('\n==================================================');
  console.log('✅ Pipeline Execution Completed Successfully!');
  console.log('==================================================');
  console.log('1. Target Role:           ', result.research?.role);
  console.log('2. Required Skills Found: ', result.research?.requiredSkills?.length);
  console.log('3. Skill Gaps Identified: ', result.skillGaps?.length);
  console.log('4. Roadmap Phases:        ', result.roadmap?.phases?.length);
  console.log('5. Projects Recommended:  ', result.projects?.length);
  console.log('6. Career Score:          ', result.recommendation?.career_score + '%');
  console.log('7. Advisor Summary:       ', result.recommendation?.summary);
  console.log('8. Advisor Reasoning:');
  result.recommendation?.reasoning?.forEach(r => console.log('   •', r));
  console.log('9. Pipeline Errors:       ', result.errors?.length ? result.errors : 'None (0 errors)');
  console.log('==================================================\n');
}

test().catch(err => {
  console.error('Pipeline test failed:', err);
  process.exit(1);
});
