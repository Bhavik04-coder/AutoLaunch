import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

const BUSINESS_CONTEXT =
  'TARGET BRAND: Commudle\n' +
  'COMMUNITY: Global developer community platform for techies and businesses.\n' +
  'BRAND VALUES: Collaboration, Knowledge sharing, Inclusivity, Community-led growth.\n' +
  'VISUAL AESTHETICS: Modern, clean, tech-centric, inclusive, vibrant.\n' +
  'TONE OF VOICE: Professional, Inspiring, Community-centric, Technical.';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  let s = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const match = s.match(/\{[\s\S]*\}/);
  if (match) s = match[0];

  try {
    return JSON.parse(s);
  } catch {
    const repaired = s.replace(
      /("(?:[^"\\]|\\.)*")|(\n)/g,
      (_, str, nl) => str ?? (nl ? '\\n' : '')
    );
    return JSON.parse(repaired);
  }
}

async function ollamaGenerate(
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: `System: ${systemPrompt}\n\n${userPrompt}`,
      stream: false,
      format: 'json',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const responseText = (data.response ?? '{}').trim();
  return parseJSON(responseText);
}

// ── Analyze: generate clarifying questions ───────────────────────────────────

async function analyzePrompt(initialPrompt: string): Promise<string[]> {
  const systemPrompt =
    `BUSINESS CONTEXT:\n${BUSINESS_CONTEXT}\n\n` +
    'You are an expert Event Coordinator, Social Media Planner, and Visual Prompt Engineer. ' +
    'A user is giving you a brief idea of what they want to create a post about. ' +
    'Identify strictly necessary questions that you need to ask the user to gather ' +
    'missing information. ' +
    'CRITICAL RULES:\n' +
    '- If the idea relates to an event, workshop, webinar, or launch, YOU MUST STRICTLY ask for the exact Date and Timing of the event.\n' +
    '- YOU MUST ask on which website or platform the event/image is going to be hosted or promoted.\n' +
    '- YOU MUST ask what visual style they prefer for the image (e.g., photorealistic, 3D illustration, text-based, cartoon) if they haven\'t specified it.\n' +
    '- Do not ask for details the user has already explicitly provided.\n' +
    '- Do not ask for a Color Palette if they have already provided one.\n' +
    'Output ONLY a valid JSON object with a single key \'questions\' containing a list of strings. ' +
    'Example: {"questions": ["On which website will this be hosted?", "What is the exact date and timing for the event?", "What visual style do you want for the image?"]}';

  try {
    const data = await ollamaGenerate(
      systemPrompt,
      `User Idea: ${initialPrompt}\n\nJSON Output:`
    );

    const questions = data.questions;
    if (Array.isArray(questions) && questions.length > 0) {
      return (questions as string[]).map(String).slice(0, 4);
    }

    throw new Error('No questions found in JSON.');
  } catch (e) {
    console.error('Ollama Error in analyzePrompt:', e);
    return [
      'What is the core message or benefit you want to highlight?',
      'Who is the specific target audience for this post?',
      'What visual style or vibe do you want for the accompanying image?',
    ];
  }
}

// ── Generate: produce final ComfyUI prompts ──────────────────────────────────

async function generateFinalOutput(
  initialPrompt: string,
  qaPairs: Record<string, string>
): Promise<{ positive_prompt: string; negative_prompt: string }> {
  const qaText = Object.entries(qaPairs)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n');

  const systemPrompt =
    `BUSINESS CONTEXT:\n${BUSINESS_CONTEXT}\n\n` +
    'You are an expert Social Media Manager and AI Graphic Designer. ' +
    'Based on the user\'s initial idea and their answers to your clarifying questions, ' +
    'generate two items: \n' +
    "1. 'positive_prompt': An incredibly detailed, professional, and comma-separated ComfyUI positive prompt. " +
    'CRITICAL: If the user is asking for a workshop, event, or announcement, the image MUST be a professional GRAPHIC DESIGN POSTER or FLYER layout. ' +
    "Use layout keywords like: 'social media poster layout, graphic design, modern typography, clean vector elements, event flyer, text space, professional business aesthetic, 2D'. " +
    "Tailor the overall theme to their chosen style, but force it into a cohesive graphic design composition. ENSURE THE MOOD ALIGNS WITH THE BRAND VISUAL AESTHETICS (modern, clean, tech-centric, inclusive, vibrant). Include high-quality modifiers (e.g., 'masterpiece', '8k resolution').\n" +
    "2. 'negative_prompt': A detailed ComfyUI negative prompt. You MUST explicitly ban the opposites of their requested style. Ban general bad qualities (e.g., 'blurry, low quality, distorted, watermark', and if it's a poster, ban '3d render, messy text').\n\n" +
    'Output MUST be ONLY a valid JSON object with these exact two keys. ' +
    'Do not include any other text.';

  try {
    const data = await ollamaGenerate(
      systemPrompt,
      `Initial Idea: ${initialPrompt}\n\nClarifying Details:\n${qaText}\n\nJSON Output:`
    );

    return {
      positive_prompt: String(data.positive_prompt ?? 'highly detailed, masterpiece'),
      negative_prompt: String(data.negative_prompt ?? 'blurry, low quality, distorted, watermark'),
    };
  } catch (e) {
    console.error('Ollama Error in generateFinalOutput:', e);
    return {
      positive_prompt: 'An error occurred.',
      negative_prompt: 'An error occurred.',
    };
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'analyze') {
      const { initialPrompt } = body;
      if (!initialPrompt?.trim()) {
        return NextResponse.json({ error: 'initialPrompt is required' }, { status: 400 });
      }
      const questions = await analyzePrompt(initialPrompt.trim());
      return NextResponse.json({ questions });
    }

    if (action === 'generate') {
      const { initialPrompt, qaPairs } = body;
      if (!initialPrompt?.trim()) {
        return NextResponse.json({ error: 'initialPrompt is required' }, { status: 400 });
      }
      const result = await generateFinalOutput(initialPrompt.trim(), qaPairs ?? {});
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action. Use "analyze" or "generate".' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const hint =
      msg.includes('ECONNREFUSED') || msg.includes('fetch failed')
        ? ' — is Ollama running? Run: ollama serve'
        : '';
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}
