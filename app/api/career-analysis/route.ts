import { NextResponse } from 'next/server';
import { runCareerAnalysis } from '@/lib/agents/orchestrator';

export async function POST(request: Request) {
  try {
    const { userId, profile, assessment } = await request.json();

    if (!userId || !assessment) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const result = await runCareerAnalysis(userId, profile, assessment);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Pipeline analysis failed' }, { status: 500 });
  }
}
