import { CareerAgentState } from '../../types/agents';

// Generic API call helper supporting user key, base URL, and chosen models
export async function queryAIModel(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const apiBase = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL_NAME || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured in environment variables');
  }

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI API request failed: ${response.statusText}. Details: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
