import { NextRequest, NextResponse } from 'next/server';

const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash';

let keyIndex = 0;

function getGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];
}

function nextKey(keys: string[]): string {
  const key = keys[keyIndex % keys.length];
  keyIndex = (keyIndex + 1) % keys.length;
  return key;
}

function parseJSON(raw: string): Record<string, unknown> {
  let s = raw.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  const match = s.match(/\{[\s\S]*\}/);
  if (match) s = match[0];
  try { return JSON.parse(s); }
  catch {
    const repaired = s.replace(/("(?:[^"\\]|\\.)*")|(\n)/g, (_, str, nl) => str ?? (nl ? '\\n' : ''));
    return JSON.parse(repaired);
  }
}

async function geminiGenerate(prompt: string): Promise<string> {
  const keys = getGeminiKeys();
  if (!keys.length) throw new Error('No GEMINI_API_KEY configured');

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = nextKey(keys);
    const res = await fetch(`${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (res.status === 429 || res.status === 503) {
      if (attempt < keys.length - 1) continue;
      throw new Error('All Gemini API keys exhausted. Try again in a minute.');
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  }

  throw new Error('Gemini generation failed');
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const raw = await geminiGenerate(prompt);
    const parsed = parseJSON(raw);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
