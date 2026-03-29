import { NextRequest, NextResponse } from 'next/server';

const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash';

const OLLAMA_BASE  = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.2';

// ── Key rotation ─────────────────────────────────────────────────────────────
// Tracks which key index to use next (round-robin across the process lifetime)
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
  const keys = getGeminiKeys();
  if (!keys.length) throw new Error('No GEMINI_API_KEY configured');

  // Try each key once — on 429/quota error move to the next
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = nextKey(keys);
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

    // On quota exhaustion, try next key
    if (res.status === 429 || res.status === 503) {
      if (attempt < keys.length - 1) continue;
      throw new Error('All Gemini API keys exhausted. Add more keys or wait a minute.');
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return parseJSON(raw);
  }

  throw new Error('Gemini generation failed');
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
      prompt, platforms: reqPlatforms,
    } = await req.json();

    // Simple rewrite mode — used by the Launches "Rewrite With AI" button
    if (prompt) {
      const platformStr = Array.isArray(reqPlatforms) && reqPlatforms.length
        ? reqPlatforms.join(', ')
        : 'social media';
      const rewritePrompt = `Rewrite this social media caption to be more engaging and compelling for ${platformStr}. Keep the core message intact. Output ONLY a JSON object with a single key "caption".\n\nOriginal: "${prompt}"`;
      const keys = getGeminiKeys();
      const result = keys.length
        ? await geminiGenerate(rewritePrompt)
        : await ollamaGenerate(rewritePrompt);
      return NextResponse.json({ caption: String(result.caption ?? prompt) });
    }

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
      // Sequential to avoid hitting per-minute rate limits
      linkedin  = await geminiGenerate(prompts.linkedin);
      twitter   = await geminiGenerate(prompts.twitter);
      instagram = await geminiGenerate(prompts.instagram);
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
