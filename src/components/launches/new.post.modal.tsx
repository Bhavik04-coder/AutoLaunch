'use client';

import { useState, useRef, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import styles from './new.post.modal.module.scss';

const PlatformIcons: Record<string, JSX.Element> = {
  twitter: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  linkedin: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>),
  instagram: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>),
  facebook: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  youtube: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>),
};

const PLATFORMS = [
  { id: 'twitter',   name: 'X',         color: '#000000' },
  { id: 'linkedin',  name: 'LinkedIn',  color: '#0077b5' },
  { id: 'instagram', name: 'Instagram', color: '#e4405f' },
  { id: 'facebook',  name: 'Facebook',  color: '#1877f2' },
  { id: 'youtube',   name: 'YouTube',   color: '#ff0000' },
];

const AGENTS = [
  { id: 'writer',  name: 'Content Writer',    desc: 'Rewrites your post to be more engaging and platform-optimized',   systemPrompt: 'You are a social media content writer. Help the user craft engaging, platform-optimized posts.' },
  { id: 'hashtag', name: 'Hashtag Optimizer', desc: 'Suggests the best hashtags for maximum reach',                    systemPrompt: 'You are a hashtag strategy expert. Suggest relevant, trending hashtags grouped by reach (broad, niche, branded).' },
  { id: 'hook',    name: 'Hook Writer',        desc: 'Adds a powerful attention-grabbing hook to your post',            systemPrompt: 'You are a copywriter specializing in hooks. Help the user write powerful opening lines that stop the scroll.' },
  { id: 'shorter', name: 'Make it Shorter',   desc: 'Condenses your post while keeping the key message',               systemPrompt: 'You are an editor. Help the user condense their posts to be punchy and under 180 characters when possible.' },
  { id: 'cta',     name: 'Add CTA',           desc: 'Adds a compelling call-to-action to your post',                   systemPrompt: 'You are a conversion copywriter. Help the user add compelling calls-to-action to their social media posts.' },
  { id: 'emoji',   name: 'Add Emojis',        desc: 'Sprinkles relevant emojis to boost engagement',                   systemPrompt: 'You are a social media specialist. Help the user add relevant emojis to make their posts more engaging and expressive.' },
];

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

function AgentPanel({
  agent,
  postContent,
  onUseText,
  onClose,
}: {
  agent: typeof AGENTS[number];
  postContent: string;
  onUseText: (text: string) => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  // On mount: greet + auto-send post content if available
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const greeting: ChatMessage = {
      role: 'assistant',
      text: `Hi! I'm the ${agent.name} agent. ${agent.desc}.${postContent.trim() ? " I've loaded your current post — let me know what you'd like to do with it." : ' Paste or describe your post and I\'ll help you improve it.'}`,
    };

    if (postContent.trim()) {
      const userMsg: ChatMessage = { role: 'user', text: postContent.trim() };
      setMessages([greeting, userMsg]);
      // Auto-run the agent on the existing content
      runAgent([greeting, userMsg], postContent.trim());
    } else {
      setMessages([greeting]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const runAgent = async (currentMessages: ChatMessage[], userText: string) => {
    setIsLoading(true);
    const history = currentMessages.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    const prompt = `${agent.systemPrompt}\n\n${history}\nAssistant:`;
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      });
      if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
      const data = await res.json();
      setMessages((p) => [...p, { role: 'assistant', text: data.response?.trim() || 'No response.' }]);
    } catch (err: any) {
      setMessages((p) => [...p, { role: 'assistant', text: `⚠️ ${err.message}. Make sure Ollama is running with llama3.2.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;
    setInput('');
    const next: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(next);
    await runAgent(next, userText);
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className={styles.agentPanel}>
      {/* Panel header */}
      <div className={styles.agentPanelHeader}>
        <div className={styles.agentPanelTitle}>
          <span className={styles.agentPanelDot} />
          {agent.name}
        </div>
        <button type="button" className={styles.agentPanelClose} onClick={onClose} aria-label="Close agent panel">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6L18 18"/>
          </svg>
        </button>
      </div>

      {/* Quick action — re-send updated post content */}
      {postContent.trim() && (
        <button
          type="button"
          className={styles.agentQuickBtn}
          onClick={() => {
            const userMsg: ChatMessage = { role: 'user', text: `Here is my updated post:\n\n${postContent}` };
            const next = [...messages, userMsg];
            setMessages(next);
            runAgent(next, postContent);
          }}
          disabled={isLoading}
        >
          ↑ Send updated post to agent
        </button>
      )}

      {/* Messages */}
      <div className={styles.agentMessages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.agentMsg} ${msg.role === 'user' ? styles.agentMsgUser : styles.agentMsgBot}`}>
            <p className={styles.agentMsgText}>{msg.text}</p>
            {msg.role === 'assistant' && (
              <div className={styles.agentMsgActions}>
                <button type="button" className={styles.agentMsgBtn} onClick={() => copyText(msg.text, i)}>
                  {copied === i ? '✓ Copied' : 'Copy'}
                </button>
                <button type="button" className={styles.agentMsgBtnPrimary} onClick={() => onUseText(msg.text)}>
                  Use in post →
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.agentMsg} ${styles.agentMsgBot}`}>
            <span className={styles.agentTyping}><span /><span /><span /></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.agentInput}>
        <textarea
          className={styles.agentInputBox}
          placeholder={`Ask ${agent.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2}
          disabled={isLoading}
        />
        <button type="button" className={styles.agentSendBtn} onClick={() => send()} disabled={isLoading || !input.trim()} aria-label="Send">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function NewPostModal({ onClose, onPostCreated, initialDate, initialPost }: {
  onClose: () => void;
  onPostCreated?: (data: { content: string; platforms: string[]; scheduledAt?: string }) => void;
  initialDate?: string;
  initialPost?: { content: string; platforms: string[]; scheduledAt?: string };
}) {
  const { fetch: customFetch, apiUrl } = useLayout();
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [platforms, setPlatforms] = useState<string[]>(initialPost?.platforms ?? []);
  const [scheduleDate, setScheduleDate] = useState(initialDate ?? initialPost?.scheduledAt ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAgent, setActiveAgent] = useState<typeof AGENTS[number] | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Image generation
  const [imgPrompt, setImgPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imgError, setImgError] = useState('');

  const toggle = (id: string) =>
    setPlatforms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleGenerateImage = async () => {
    if (!imgPrompt.trim()) return;
    setIsGeneratingImg(true); setImgError(''); setGeneratedImg(null);
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt.trim())}?width=1024&height=576&seed=${Math.floor(Math.random() * 99999)}&nologo=true`;
      await new Promise<void>((resolve, reject) => {
        const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(); img.src = url;
      });
      setGeneratedImg(url);
    } catch { setImgError('Image generation failed. Try a different prompt.'); }
    finally { setIsGeneratingImg(false); }
  };

  const handleSubmit = async () => {
    if (!content || platforms.length === 0) return;
    setIsSubmitting(true); setError('');
    try {
      const res = await customFetch(apiUrl('/posts'), {
        method: 'POST',
        body: JSON.stringify({ content, platforms, scheduledAt: scheduleDate || undefined, image: generatedImg || undefined }),
      });
      if (!res.ok) throw new Error('Failed to save post');
      onPostCreated?.({ content, platforms, scheduledAt: scheduleDate || undefined });
      setSuccess(true);
      setTimeout(onClose, 3200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) { setActiveAgent(null); onClose(); } }}>
      <div className={`${styles.modalWrap} ${activeAgent ? styles.modalWrapExpanded : ''}`}>

        {/* ── Main modal ── */}
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Create Post</h2>
            <button type="button" aria-label="Close modal" className={styles.closeBtn} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {success && (
            <div className={styles.successOverlay}>
              <div className={styles.successContent}>
                <div className={styles.successIcon}>🎉</div>
                <h3 className={styles.successTitle}>Post {scheduleDate ? 'Scheduled' : 'Published'}!</h3>
                <p className={styles.successSub}>Here&apos;s what AutoLaunch saved you today</p>
                <div className={styles.savingsGrid}>
                  <div className={styles.savingCard}><span className={styles.savingValue}>~2 hrs</span><span className={styles.savingLabel}>Time saved</span></div>
                  <div className={styles.savingCard}><span className={styles.savingValue}>$120</span><span className={styles.savingLabel}>Cost saved</span></div>
                  <div className={styles.savingCard}><span className={styles.savingValue}>{platforms.length}x</span><span className={styles.savingLabel}>Platforms reached</span></div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.body}>
            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Platforms */}
            <div className={styles.section}>
              <label className={styles.label}>Platforms</label>
              <div className={styles.platforms}>
                {PLATFORMS.map((p) => (
                  <button key={p.id} type="button" data-platform={p.id} data-selected={platforms.includes(p.id) ? 'true' : undefined}
                    className={`${styles.platformBtn} ${platforms.includes(p.id) ? styles.selected : ''}`} onClick={() => toggle(p.id)}>
                    <span className={styles.platformIcon}>{PlatformIcons[p.id]}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className={styles.section}>
              <label htmlFor="post-content" className={styles.label}>Content</label>
              <textarea id="post-content" className={styles.textarea} placeholder="What's on your mind?" value={content}
                onChange={(e) => setContent(e.target.value)} rows={4} />
              <div className={styles.charCount}>{content.length} / 280</div>
            </div>

            {/* AI Agents */}
            <div className={styles.section}>
              <label className={styles.label}>
                AI Agents
                <span className={styles.labelBadge}>Powered by Ollama</span>
              </label>
              <div className={styles.agentsGrid}>
                {AGENTS.map((agent) => (
                  <button key={agent.id} type="button"
                    className={`${styles.agentBtn} ${activeAgent?.id === agent.id ? styles.agentBtnActive : ''}`}
                    onClick={() => setActiveAgent(activeAgent?.id === agent.id ? null : agent)}
                    disabled={isSubmitting}>
                    {agent.name}
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Image generation */}
            <div className={styles.section}>
              <label className={styles.label}>
                AI Image Generation
                <span className={styles.labelBadge}>Powered by Pollinations</span>
              </label>
              <div className={styles.imgGenRow}>
                <input type="text" className={styles.imgPromptInput} placeholder="Describe the image you want..."
                  value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()} />
                <button type="button" className={styles.imgGenBtn} onClick={handleGenerateImage} disabled={isGeneratingImg || !imgPrompt.trim()}>
                  {isGeneratingImg ? <span className={styles.imgSpinner} /> : '✦ Generate'}
                </button>
              </div>
              {imgError && <p className={styles.imgError}>{imgError}</p>}
              {isGeneratingImg && (
                <div className={styles.imgPlaceholder}>
                  <span className={styles.imgLoadingDots}><span /><span /><span /></span>
                  <p>Generating your image...</p>
                </div>
              )}
              {generatedImg && !isGeneratingImg && (
                <div className={styles.imgPreviewWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedImg} alt="Generated" className={styles.imgPreview} />
                  <div className={styles.imgActions}>
                    <button type="button" className={styles.imgActionBtn} onClick={() => setGeneratedImg(null)}>🗑 Remove</button>
                    <button type="button" className={styles.imgActionBtn} onClick={handleGenerateImage}>🔄 Regenerate</button>
                    <a href={generatedImg} download="generated.jpg" target="_blank" rel="noreferrer" className={styles.imgActionBtn}>⬇ Download</a>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className={styles.section}>
              <label htmlFor="post-schedule" className={styles.label}>Schedule (optional)</label>
              <input id="post-schedule" type="datetime-local" className={styles.dateInput} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="button" className={styles.submitBtn}
              disabled={!content || platforms.length === 0 || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Saving...' : scheduleDate ? 'Schedule Post' : 'Post Now'}
            </button>
          </div>
        </div>

        {/* ── Agent slide panel ── */}
        <div className={`${styles.agentPanelWrap} ${activeAgent ? styles.agentPanelWrapOpen : ''}`}>
          {activeAgent && (
            <AgentPanel
              agent={activeAgent}
              postContent={content}
              onUseText={(text) => { setContent(text); setActiveAgent(null); }}
              onClose={() => setActiveAgent(null)}
            />
          )}
        </div>

      </div>
    </div>
  );
}
