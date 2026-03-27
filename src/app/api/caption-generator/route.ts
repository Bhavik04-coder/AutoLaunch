import { NextRequest, NextResponse } from 'next/server';

const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash';

const OLLAMA_BASE  = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.2';

const SEO_KEYWORDS = {
  linkedin:  ['developer community', 'software development', 'tech innovation', 'digital transformation', 'product launch'],
  twitter:   ['#DevCommunity', '#TechNews', '#BuildInPublic', '#ProductLaunch', '#SaaS'],
  instagram: ['#DeveloperLife', '#TechCommunity', '#BuildInPublic', '#StartupLife', '#CodeNewbie'],
};

// ── Robust JSON parser ───────────────────────────────────────────────────────
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

// ── Gemini ───────────────────────────────────────────────────────────────────
async function geminiGenerate(prompt: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const res = await fetch(`${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  return parseJSON(raw);
}

// ── Ollama / Llama 3.2 ───────────────────────────────────────────────────────
async function ollamaGenerate(prompt: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: 'You are a social media expert. Output a single JSON object only. No markdown, no explanation.' },
        { role: 'user',   content: prompt },
      ],
      options: { temperature: 0.7, num_predict: 2048 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return parseJSON(data.message?.content ?? '{}');
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      brandName, tagline, voice, industry,
      goal = 'Awareness', featureNote = '', model = 'gemini',
    } = await req.json();

    const featurePart = featureNote ? ` New release/feature: ${featureNote}.` : '';
    const description = `${brandName} — ${tagline}. Industry: ${industry}. Brand voice: ${voice}.${featurePart}`;

    const prompts = {
      linkedin:  `Write a punchy LinkedIn post (500-800 chars) for: ${description}. Goal: ${goal}. Keywords: ${SEO_KEYWORDS.linkedin.join(', ')}. Short sentences, line breaks, 3-5 hashtags at end. JSON: {"content":"...","metadata":{"readabilityScore":7,"engagementPotential":8}}`,
      twitter:   `Write one engaging tweet (max 280 chars) for: ${description}. Goal: ${goal}. Use 2-4 hashtags from: ${SEO_KEYWORDS.twitter.join(', ')}. JSON: {"tweet":"...","metadata":{"readabilityScore":7,"engagementPotential":8}}`,
      instagram: `Write a punchy Instagram caption with emojis for: ${description}. Goal: ${goal}. Add 20-25 hashtags at bottom from: ${SEO_KEYWORDS.instagram.join(', ')}. JSON: {"caption":"...","metadata":{"readabilityScore":7,"engagementPotential":8}}`,
    };

    let linkedin, twitter, instagram;

    if (model === 'llama') {
      linkedin  = await ollamaGenerate(prompts.linkedin);
      twitter   = await ollamaGenerate(prompts.twitter);
      instagram = await ollamaGenerate(prompts.instagram);
    } else {
      [linkedin, twitter, instagram] = await Promise.all([
        geminiGenerate(prompts.linkedin),
        geminiGenerate(prompts.twitter),
        geminiGenerate(prompts.instagram),
      ]);
    }

    return NextResponse.json({
      linkedin:  { content: '', metadata: { readabilityScore: 0, engagementPotential: 0 }, ...linkedin  },
      twitter:   { tweet:   '', metadata: { readabilityScore: 0, engagementPotential: 0 }, ...twitter   },
      instagram: { caption: '', metadata: { readabilityScore: 0, engagementPotential: 0 }, ...instagram },
      model,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const hint = (msg.includes('ECONNREFUSED') || msg.includes('fetch failed'))
      ? ' — is Ollama running? Run: ollama serve'
      : '';
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}
