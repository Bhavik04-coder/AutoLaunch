'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AIContentGenerator.module.scss';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface AIContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onUseContent: (content: string) => void;
}

interface FormData {
  feature_name: string;
  description: string;
  target_audience: string;
  key_benefit: string;
  campaign_goal: string;
  tone_override: string;
}

interface GeneratedPackage {
  linkedin: { caption: string; hashtags: string; cta: string; postingTime: string };
  twitter: { mainTweet: string; thread: string; hashtags: string };
  instagram: { caption: string; hashtags: string; reelHook: string };
  whatsapp: string;
  seo: { keywords: string; trendingHashtags: string; longTail: string };
  imagePrompts: { square: string; story: string; landscape: string };
  videoScript: string;
}

const TABS = [
  { key: 'linkedin', label: '💼 LinkedIn' },
  { key: 'twitter', label: '𝕏 Twitter' },
  { key: 'instagram', label: '📷 Instagram' },
  { key: 'whatsapp', label: '💬 WhatsApp' },
  { key: 'seo', label: '🔍 SEO' },
  { key: 'imagePrompts', label: '🖼 Images' },
  { key: 'videoScript', label: '🎬 Video' },
] as const;

type TabKey = typeof TABS[number]['key'];



function buildPrompt(f: FormData): string {
  return `You are AutoLaunch AI — a content generation engine. Generate a complete multi-platform content package from the details below.

Feature Name: ${f.feature_name}
Description: ${f.description}
Target Audience: ${f.target_audience}
Key Benefit: ${f.key_benefit}
Campaign Goal: ${f.campaign_goal}
${f.tone_override ? `Tone Override: ${f.tone_override}` : ''}

Return ONLY valid JSON (no markdown, no code fences) matching this exact structure:
{
  "linkedin": {
    "caption": "1200-1800 char professional storytelling caption",
    "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5",
    "cta": "Call to action line",
    "postingTime": "Suggested posting time"
  },
  "twitter": {
    "mainTweet": "Under 280 chars, hook-first tweet",
    "thread": "Tweet 1/5: ...\\nTweet 2/5: ...\\nTweet 3/5: ...\\nTweet 4/5: ...\\nTweet 5/5: ...",
    "hashtags": "#tag1 #tag2 #tag3"
  },
  "instagram": {
    "caption": "150-300 char conversational emoji-rich caption",
    "hashtags": "#tag1 #tag2 #tag3 (25-30 hashtags total)",
    "reelHook": "Short catchy reel hook text"
  },
  "whatsapp": "100-200 char friendly message with [link] placeholder",
  "seo": {
    "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10",
    "trendingHashtags": "#trend1 #trend2 #trend3 #trend4 #trend5",
    "longTail": "phrase one | phrase two | phrase three"
  },
  "imagePrompts": {
    "square": "1080x1080 clean SaaS-style AI image generation prompt",
    "story": "1080x1920 vertical bold announcement style prompt",
    "landscape": "1920x1080 banner-style product showcase prompt"
  },
  "videoScript": "Duration: 15-30s\\nHook (0-3s): ...\\nProblem: ...\\nSolution: ...\\nCTA: ...\\nVisuals: ...\\nMusic: ..."
}`;
}

function CopyBox({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={styles.sectionBlock}>
      {label && <span className={styles.sectionLabel}>{label}</span>}
      <div className={styles.contentBox}>
        {text}
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function AIContentGenerator({ isOpen, onClose, onUseContent }: AIContentGeneratorProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    feature_name: '',
    description: '',
    target_audience: '',
    key_benefit: '',
    campaign_goal: '',
    tone_override: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('linkedin');

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isValid = form.feature_name && form.description && form.target_audience && form.key_benefit && form.campaign_goal;

  const handleGenerate = async () => {
    if (!isValid) return;
    setIsGenerating(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/content-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(form) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server returned ${res.status}`);
      }
      const parsed = await res.json() as GeneratedPackage;
      if (!parsed?.linkedin) throw new Error('Could not parse AI response. Try again.');
      setResult(parsed);
      setActiveTab('linkedin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setForm({ feature_name: '', description: '', target_audience: '', key_benefit: '', campaign_goal: '', tone_override: '' });
    setResult(null);
    setError('');
    onClose();
  };

  const handleGenerateImage = (prompt: string) => {
    handleClose();
    router.push(`/media?imagePrompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="✨ AI Content Generator" size="lg">
      <div className={styles.generator}>
        {!result && !isGenerating && (
          <div className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Feature Name <span className={styles.required}>*</span></label>
                <input className={styles.input} placeholder="e.g. Smart Scheduling" value={form.feature_name} onChange={set('feature_name')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Target Audience <span className={styles.required}>*</span></label>
                <input className={styles.input} placeholder="e.g. SaaS founders, marketers" value={form.target_audience} onChange={set('target_audience')} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description <span className={styles.required}>*</span></label>
              <textarea className={styles.textarea} placeholder="Describe the feature or product in detail..." value={form.description} onChange={set('description')} rows={3} />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Key Benefit <span className={styles.required}>*</span></label>
                <input className={styles.input} placeholder="e.g. Save 5 hours per week" value={form.key_benefit} onChange={set('key_benefit')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Campaign Goal <span className={styles.required}>*</span></label>
                <select className={styles.select} value={form.campaign_goal} onChange={set('campaign_goal')} aria-label="Campaign Goal">
                  <option value="">Select a goal...</option>
                  <option value="drive signups">Drive Signups</option>
                  <option value="increase engagement">Increase Engagement</option>
                  <option value="boost brand awareness">Boost Brand Awareness</option>
                  <option value="generate leads">Generate Leads</option>
                  <option value="announce a launch">Announce a Launch</option>
                  <option value="drive traffic to website">Drive Website Traffic</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tone Override <span className={styles.optionalLabel}>(optional)</span></label>
              <input className={styles.input} placeholder="e.g. Bold & witty, Formal, Inspirational..." value={form.tone_override} onChange={set('tone_override')} />
            </div>

            <div className={styles.actions}>
              {error && <div className={styles.error}>{error}</div>}
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button variant="ai" onClick={handleGenerate} disabled={!isValid}>
                ✨ Generate Content Package
              </Button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Generating your full content package...</span>
            <span className={styles.loadingSubtext}>This may take 15–30 seconds</span>
          </div>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsTitle}>Content Package Ready</span>
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>← Regenerate</Button>
            </div>

            <div className={styles.tabs}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`${styles.tab} ${activeTab === t.key ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={styles.platformContent}>
              {activeTab === 'linkedin' && (
                <>
                  <CopyBox label="Caption" text={result.linkedin.caption} />
                  <CopyBox label="Hashtags" text={result.linkedin.hashtags} />
                  <CopyBox label="CTA" text={result.linkedin.cta} />
                  <CopyBox label="Best Posting Time" text={result.linkedin.postingTime} />
                  <Button variant="primary" size="sm" className={styles.useBtn} onClick={() => onUseContent(result.linkedin.caption + '\n\n' + result.linkedin.hashtags + '\n\n' + result.linkedin.cta)}>
                    Use in Composer →
                  </Button>
                </>
              )}
              {activeTab === 'twitter' && (
                <>
                  <CopyBox label="Main Tweet" text={result.twitter.mainTweet} />
                  <CopyBox label="Thread" text={result.twitter.thread} />
                  <CopyBox label="Hashtags" text={result.twitter.hashtags} />
                  <Button variant="primary" size="sm" className={styles.useBtn} onClick={() => onUseContent(result.twitter.mainTweet)}>
                    Use in Composer →
                  </Button>
                </>
              )}
              {activeTab === 'instagram' && (
                <>
                  <CopyBox label="Caption" text={result.instagram.caption} />
                  <CopyBox label="Reel Hook" text={result.instagram.reelHook} />
                  <CopyBox label="Hashtags" text={result.instagram.hashtags} />
                  <Button variant="primary" size="sm" className={styles.useBtn} onClick={() => onUseContent(result.instagram.caption + '\n\n' + result.instagram.hashtags)}>
                    Use in Composer →
                  </Button>
                </>
              )}
              {activeTab === 'whatsapp' && (
                <>
                  <CopyBox label="Message" text={result.whatsapp} />
                  <Button variant="primary" size="sm" className={styles.useBtn} onClick={() => onUseContent(result.whatsapp)}>
                    Use in Composer →
                  </Button>
                </>
              )}
              {activeTab === 'seo' && (
                <>
                  <CopyBox label="10 Primary Keywords" text={result.seo.keywords} />
                  <CopyBox label="5 Trending Hashtags" text={result.seo.trendingHashtags} />
                  <CopyBox label="3 Long-Tail Phrases" text={result.seo.longTail} />
                </>
              )}
              {activeTab === 'imagePrompts' && (
                <>
                  <div className={styles.imagePromptRow}>
                    <CopyBox label="Square 1:1 (1080×1080)" text={result.imagePrompts.square} />
                    <Button variant="ai" size="sm" className={styles.genImgBtn} onClick={() => handleGenerateImage(result.imagePrompts.square)}>
                      🎨 Generate Image
                    </Button>
                  </div>
                  <div className={styles.imagePromptRow}>
                    <CopyBox label="Story 9:16 (1080×1920)" text={result.imagePrompts.story} />
                    <Button variant="ai" size="sm" className={styles.genImgBtn} onClick={() => handleGenerateImage(result.imagePrompts.story)}>
                      🎨 Generate Image
                    </Button>
                  </div>
                  <div className={styles.imagePromptRow}>
                    <CopyBox label="Landscape 16:9 (1920×1080)" text={result.imagePrompts.landscape} />
                    <Button variant="ai" size="sm" className={styles.genImgBtn} onClick={() => handleGenerateImage(result.imagePrompts.landscape)}>
                      🎨 Generate Image
                    </Button>
                  </div>
                </>
              )}
              {activeTab === 'videoScript' && (
                <CopyBox label="15–30s Video Script" text={result.videoScript} />
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
