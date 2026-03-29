'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './launches.module.scss';
import { PostsProvider, usePosts } from '@/contexts/PostsContext';
import { useLinkedInPost } from '@/hooks/useLinkedInPost';
import type { Post } from '@/types';

// ─── SVG Icon helpers ─────────────────────────────────────────────────────────

const icons: Record<string, React.ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
};

const PLATFORMS = [
  { id: 'linkedin',  name: 'LinkedIn',  color: '#0077b5' },
  { id: 'instagram', name: 'Instagram', color: '#e4405f' },
  { id: 'facebook',  name: 'Facebook',  color: '#1877f2' },
  { id: 'twitter',   name: 'X/Twitter', color: '#111111' },
  { id: 'youtube',   name: 'YouTube',   color: '#ff0000' },
];

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

const PANEL_AGENTS = [
  { id: '1', name: 'Echo',  role: 'Content Writer',   image: '/agents_imgs/agent1.png', prompt: 'You are a social media content writer. Write an engaging, platform-optimized post for the given topic. Return ONLY the post text—no explanations, no labels.' },
  { id: '2', name: 'Spark', role: 'Marketing Agent',  image: '/agents_imgs/agent2.png', prompt: 'You are a marketing copywriter. Write conversion-focused, punchy social media content for the given topic. Return ONLY the post text.' },
  { id: '3', name: 'Fixr',  role: 'Analytics Agent',  image: '/agents_imgs/agent3.png', prompt: 'You are a data-driven social media expert. Write high-engagement content based on proven performance patterns for the given topic. Return ONLY the post text.' },
  { id: '4', name: 'Closi', role: 'Trend Spotter',    image: '/agents_imgs/agent4.png', prompt: 'You are a trend analyst. Write viral, trend-aware social media content for the given topic. Return ONLY the post text.' },
  { id: '6', name: 'Ledgr', role: 'Scheduler Agent',  image: '/agents_imgs/agent2.png', prompt: 'You are a scheduling and audience expert. Write time-optimised, audience-aware social media content for the given topic. Return ONLY the post text.' },
] as const;

// ─── Root export ──────────────────────────────────────────────────────────────

export function LaunchesComponent() {
  return (
    <PostsProvider>
      <ScheduleDashboard />
    </PostsProvider>
  );
}

// ─── Dashboard shell ──────────────────────────────────────────────────────────

function ScheduleDashboard() {
  const { addPost } = usePosts();
  const [successMsg, setSuccessMsg] = useState('');

  const handlePostCreated = useCallback(
    (data: { content: string; platforms: string[]; scheduledAt?: string; mediaUrls?: string[]; linkedInQueued?: boolean }) => {
      addPost(data);
      if (!data.platforms.includes('linkedin') || data.scheduledAt) {
        setSuccessMsg(data.scheduledAt ? 'Post scheduled!' : 'Post published!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    },
    [addPost],
  );

  return (
    <div className={styles.dashboard}>
      <PostScheduler />
      {successMsg && <div className={styles.successToast}>{successMsg} ✓</div>}
      <CreatePanel onPostCreated={handlePostCreated} />
      <CalendarPanel />
    </div>
  );
}

// ─── Post Scheduler (auto-posts to LinkedIn at scheduled time) ────────────────

function PostScheduler() {
  const { posts, updatePostStatus } = usePosts();
  const { postToLinkedIn } = useLinkedInPost();

  const postsRef      = useRef(posts);
  const postFnRef     = useRef(postToLinkedIn);
  const updateFnRef   = useRef(updatePostStatus);
  const processingIds = useRef(new Set<string>());

  useEffect(() => { postsRef.current    = posts;           }, [posts]);
  useEffect(() => { postFnRef.current   = postToLinkedIn;  }, [postToLinkedIn]);
  useEffect(() => { updateFnRef.current = updatePostStatus; }, [updatePostStatus]);

  useEffect(() => {
    const run = async () => {
      const now = Date.now();
      const due = postsRef.current.filter(
        (p) =>
          p.status === 'scheduled' &&
          p.linkedInQueued === true &&
          new Date(p.scheduledAt).getTime() <= now &&
          !processingIds.current.has(p.id),
      );
      for (const post of due) {
        processingIds.current.add(post.id);
        const ok = await postFnRef.current(post.content);
        updateFnRef.current(post.id, ok ? 'published' : 'failed');
      }
    };
    const interval = setInterval(run, 30_000);
    run();
    return () => clearInterval(interval);
  }, []);

  return null;
}

// ─── Create Schedule Panel ────────────────────────────────────────────────────

function CreatePanel({
  onPostCreated,
}: {
  onPostCreated: (data: { content: string; platforms: string[]; scheduledAt?: string; mediaUrls?: string[]; linkedInQueued?: boolean }) => void;
}) {
  const [platforms, setPlatforms]       = useState<string[]>(['linkedin', 'instagram', 'facebook']);
  const [postType, setPostType]         = useState<'Post' | 'Story' | 'Reel'>('Post');
  const [content, setContent]           = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile]       = useState<File | null>(null);
  const [mediaIsVideo, setMediaIsVideo] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { postToLinkedIn, isPosting: isPostingToLI, result: liResult, message: liMsg } = useLinkedInPost();

  // ── Agent picker state ──────────────────────────────────────────────────────
  const [showAgentPicker, setShowAgentPicker]       = useState(false);
  const [agentPrompt, setAgentPrompt]               = useState('');
  const [activeAgentId, setActiveAgentId]           = useState<string | null>(null);
  const [agentOutput, setAgentOutput]               = useState('');
  const [isAgentGenerating, setIsAgentGenerating]   = useState(false);

  const handleAgentGenerate = async (agent: typeof PANEL_AGENTS[number]) => {
    const instruction = agentPrompt.trim() || content.trim();
    if (!instruction || isAgentGenerating) return;
    setActiveAgentId(agent.id);
    setAgentOutput('');
    setIsAgentGenerating(true);
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `${agent.prompt}\n\nTopic / instruction: ${instruction}\n\nPost:`,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      setAgentOutput(data.response?.trim() || 'No response.');
    } catch (err: unknown) {
      setAgentOutput(err instanceof Error ? `⚠️ ${err.message}` : '⚠️ Could not reach Ollama. Make sure it is running with llama3.2.');
    } finally {
      setIsAgentGenerating(false);
    }
  };

  const openAgentPicker = () => {
    setShowAgentPicker((prev) => !prev);
    if (!showAgentPicker) {
      setAgentPrompt(content.trim());
      setAgentOutput('');
      setActiveAgentId(null);
    }
  };

  const hashtags = Array.from(new Set(content.match(/#\w+/g) ?? []));
  const isLinkedInSelected = platforms.includes('linkedin');

  const togglePlatform = (id: string) =>
    setPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  const applyFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setMediaFile(file);
    setMediaIsVideo(file.type.startsWith('video/'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };


  const handleSchedule = async () => {
    if ((!content.trim() && !mediaPreview) || isSubmitting) return;
    setIsSubmitting(true);

    const isScheduled = !!scheduleDate;

    // If LinkedIn selected and posting NOW, send directly to LinkedIn
    if (isLinkedInSelected && !isScheduled) {
      await postToLinkedIn(content.trim(), mediaFile ?? undefined);
    }

    onPostCreated({
      content: content.trim(),
      platforms,
      scheduledAt: scheduleDate || undefined,
      mediaUrls: mediaPreview ? [mediaPreview] : undefined,
      // Queue for auto-post only when LinkedIn is selected + future schedule
      linkedInQueued: isLinkedInSelected && isScheduled,
    });

    setContent('');
    setMediaPreview(null);
    setMediaFile(null);
    setMediaIsVideo(false);
    setScheduleDate('');
    setIsSubmitting(false);
  };

  const displayDate = scheduleDate
    ? new Date(scheduleDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Set date & time...';

  const canSubmit = (content.trim().length > 0 || !!mediaPreview) && platforms.length > 0;

  return (
    <div className={styles.createPanel}>

      {/* ── Panel header ── */}
      <div className={styles.createHeader}>
        <h2 className={styles.createTitle}>Create Schedule</h2>
        <button className={styles.menuBtn} type="button" aria-label="More options">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <circle cx="12" cy="5"  r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── Account + platform buttons row ── */}
      <div className={styles.accountRow}>
        <div className={styles.accountInfo}>
          <div className={styles.accountAvatar}>A</div>
          <span className={styles.accountName}>@AutoLaunch</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <div className={styles.platformBtns}>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.name}
              onClick={() => togglePlatform(p.id)}
              className={`${styles.platformIconBtn} ${platforms.includes(p.id) ? styles.platformIconBtnActive : ''}`}
              style={{ '--pcol': p.color } as React.CSSProperties}
            >
              {icons[p.id]}
            </button>
          ))}
          <button type="button" className={styles.platformAddBtn} title="Add platform">+</button>
        </div>
      </div>

      {/* ── Post type tabs ── */}
      <div className={styles.postTypeTabs}>
        {(['Post', 'Story', 'Reel'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setPostType(t)}
            className={`${styles.postTypeTab} ${postType === t ? styles.postTypeTabActive : ''}`}
          >
            {t === 'Post'  && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>}
            {t === 'Story' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>}
            {t === 'Reel'  && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>}
            {t}
          </button>
        ))}
      </div>

      {/* ── Media upload zone ── */}
      <div
        className={`${styles.mediaZone} ${isDragging ? styles.mediaZoneDragging : ''} ${mediaPreview ? styles.mediaZoneFilled : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => { if (!mediaPreview) fileInputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !mediaPreview && fileInputRef.current?.click()}
        aria-label={mediaPreview ? 'Media preview' : 'Upload media'}
      >
        {mediaPreview ? (
          <>
            {mediaIsVideo ? (
              <video src={mediaPreview} className={styles.mediaImg} muted playsInline />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={mediaPreview} alt="Preview" className={styles.mediaImg} />
            )}
            <div className={styles.mediaOverlay}>
              <button
                type="button"
                className={styles.mediaRemoveBtn}
                onClick={(e) => { e.stopPropagation(); setMediaPreview(null); setMediaFile(null); setMediaIsVideo(false); }}
              >
                ✕ Remove
              </button>
              <button
                type="button"
                className={styles.mediaChangeBtn}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                ↑ Change
              </button>
            </div>
          </>
        ) : (
          <div className={styles.mediaEmpty}>
            <div className={styles.mediaUploadIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <p className={styles.mediaEmptyText}>Click to upload media</p>
            <span className={styles.mediaEmptyHint}>PNG, JPG, GIF, MP4 up to 50MB</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={handleFileChange}
        />
      </div>

      {/* ── Caption textarea ── */}
      <textarea
        className={styles.captionArea}
        placeholder="Write a caption for your post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2200}
      />

      {/* ── Hashtag pills ── */}
      {hashtags.length > 0 && (
        <div className={styles.hashtagRow}>
          {hashtags.map((h) => (
            <span key={h} className={styles.hashtag}>{h}</span>
          ))}
        </div>
      )}

      {/* ── Action bar ── */}
      <div className={styles.captionActions}>
        <button
          type="button"
          className={`${styles.aiBtn} ${showAgentPicker ? styles.aiBtnActive : ''}`}
          onClick={openAgentPicker}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
          AI Agents
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"
            style={{ transform: showAgentPicker ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <button type="button" className={styles.emojiBtn} aria-label="Add emoji">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
          </svg>
        </button>
        {content.length > 0 && (
          <span className={styles.charCount}>{content.length}</span>
        )}
      </div>

      {/* ── Agent Picker Panel ── */}
      {showAgentPicker && (
        <div className={styles.agentPickerPanel}>
          {/* Shared prompt input */}
          <div className={styles.agentPickerPromptRow}>
            <input
              type="text"
              className={styles.agentPickerInput}
              placeholder="Describe what to write about…"
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && activeAgentId) {
                  const a = PANEL_AGENTS.find((a) => a.id === activeAgentId);
                  if (a) handleAgentGenerate(a);
                }
              }}
            />
          </div>

          {/* Agent chips */}
          <div className={styles.agentChipGrid}>
            {PANEL_AGENTS.map((agent) => {
              const isActive = activeAgentId === agent.id;
              const isLoading = isActive && isAgentGenerating;
              return (
                <button
                  key={agent.id}
                  type="button"
                  className={`${styles.agentChip} ${isActive ? styles.agentChipActive : ''}`}
                  onClick={() => handleAgentGenerate(agent)}
                  disabled={isAgentGenerating}
                  title={agent.role}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.image} alt={agent.name} className={styles.agentChipAvatar} />
                  <span className={styles.agentChipName}>{agent.name}</span>
                  <span className={styles.agentChipRole}>{agent.role}</span>
                  {isLoading && <span className={styles.agentChipSpinner} />}
                </button>
              );
            })}
          </div>

          {/* Generated output */}
          {agentOutput && (
            <div className={styles.agentOutput}>
              <p className={styles.agentOutputText}>{agentOutput}</p>
              <div className={styles.agentOutputActions}>
                <button
                  type="button"
                  className={styles.agentInsertBtn}
                  onClick={() => { setContent(agentOutput); setAgentOutput(''); setShowAgentPicker(false); }}
                >
                  ✦ Insert into Caption
                </button>
                <button
                  type="button"
                  className={styles.agentAppendBtn}
                  onClick={() => { setContent((prev) => prev ? `${prev}\n\n${agentOutput}` : agentOutput); setAgentOutput(''); setShowAgentPicker(false); }}
                >
                  + Append
                </button>
                <button
                  type="button"
                  className={styles.agentDismissBtn}
                  onClick={() => setAgentOutput('')}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LinkedIn status bar ── */}
      {liMsg && (
        <div
          className={styles.liStatusBar}
          style={liResult === 'success'
            ? { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }
            : { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
        >
          {liResult === 'success' ? '✅' : '⚠️'} {liMsg}
        </div>
      )}

      {/* ── Footer: date picker + schedule btn ── */}
      <div className={styles.createFooter}>
        <div
          className={styles.datePickerRow}
          role="button"
          tabIndex={0}
          onClick={() => { const el = dateInputRef.current; if (el) { (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.() ?? el.click(); } }}
          onKeyDown={(e) => { if (e.key === 'Enter') { const el = dateInputRef.current; if (el) { (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.() ?? el.click(); } } }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span className={styles.dateDisplay}>{displayDate}</span>
          <input
            ref={dateInputRef}
            type="datetime-local"
            className={styles.hiddenDateInput}
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <button
          type="button"
          className={styles.scheduleBtn}
          onClick={handleSchedule}
          disabled={!canSubmit || isSubmitting || isPostingToLI}
        >
          {(isSubmitting || isPostingToLI)
            ? (isPostingToLI ? 'Posting to LinkedIn…' : 'Saving…')
            : scheduleDate
              ? (isLinkedInSelected ? 'Schedule + LinkedIn' : 'Schedule')
              : (isLinkedInSelected ? 'Post Now + LinkedIn' : 'Post Now')}
          {!isSubmitting && !isPostingToLI && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Calendar Panel ───────────────────────────────────────────────────────────

function CalendarPanel() {
  const { posts }                           = usePosts();
  const [current, setCurrent]               = useState(new Date());
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [calView, setCalView]               = useState<'calendar' | 'grid' | 'list'>('calendar');
  const [selectedDay, setSelectedDay]       = useState<number | null>(null);

  const year        = current.getFullYear();
  const month       = current.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getPostsForDay = (day: number): Post[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter((p) => {
      if (!p.scheduledAt.startsWith(dateStr)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (platformFilter !== 'all' && !p.platforms.includes(platformFilter)) return false;
      return true;
    });
  };

  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (platformFilter !== 'all' && !p.platforms.includes(platformFilter)) return false;
    return true;
  });

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  return (
    <div className={styles.calendarPanel}>

      {/* ── Header ── */}
      <div className={styles.calHeader}>
        <div className={styles.calHeaderLeft}>
          <h2 className={styles.calTitle}>Your Schedule</h2>
          <p className={styles.calSubtitle}>Manage and track your scheduled uploads to ensure everything goes as planned</p>
        </div>
        <div className={styles.calNav}>
          <button type="button" className={styles.calNavBtn} onClick={() => { setCurrent(new Date(year, month - 1)); setSelectedDay(null); }} aria-label="Previous month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M15 18L9 12l6-6"/></svg>
          </button>
          <button type="button" className={styles.todayBtn} onClick={() => { setCurrent(new Date()); setSelectedDay(null); }}>Today</button>
          <button type="button" className={styles.calNavBtn} onClick={() => { setCurrent(new Date(year, month + 1)); setSelectedDay(null); }} aria-label="Next month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <span className={styles.monthLabel}>{`${MONTHS[month].substring(0, 3)} ${year}`}</span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.calToolbar}>
        <div className={styles.calFilters}>
          <select className={styles.calFilter} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="all">Social Account</option>
            {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className={styles.calFilter} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Post Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className={styles.calViewToggle}>
          <button type="button" className={calView === 'calendar' ? styles.viewBtnActive : styles.viewBtn} onClick={() => setCalView('calendar')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </button>
          <button type="button" className={calView === 'grid' ? styles.viewBtnActive : styles.viewBtn} onClick={() => setCalView('grid')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button type="button" className={calView === 'list' ? styles.viewBtnActive : styles.viewBtn} onClick={() => setCalView('list')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      {calView === 'list' ? (
        <ListView posts={filteredPosts} />
      ) : (
        <div className={styles.calBody}>
          <div className={styles.calGrid}>
            {/* Day name headers */}
            {DAYS.map((d) => (
              <div key={d} className={styles.calDayName}>{d}</div>
            ))}

            {/* Empty leading cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className={styles.calEmptyCell} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day      = i + 1;
              const dayPosts = getPostsForDay(day);
              const isTodayDay = isToday(day);
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  className={`${styles.calCell} ${isTodayDay ? styles.calCellToday : ''} ${isSelected ? styles.calCellSelected : ''}`}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedDay(day === selectedDay ? null : day)}
                >
                  <div className={`${styles.calDayNum} ${isTodayDay ? styles.calDayNumToday : ''}`}>{day}</div>
                  {dayPosts.length > 0 && (
                    <div className={styles.calCellThumbs}>
                      {dayPosts.slice(0, 4).map((post) => (
                        <div key={post.id} className={styles.calThumb}>
                          {post.mediaUrls?.[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={post.mediaUrls[0]} alt="" className={styles.calThumbImg} loading="lazy" />
                          ) : (
                            <div className={styles.calThumbPlaceholder} style={{ background: getStatusColor(post.status) }} />
                          )}
                        </div>
                      ))}
                      {dayPosts.length > 4 && (
                        <span className={styles.calMoreBadge}>+{dayPosts.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day detail sidebar */}
          {selectedDay && (
            <div className={styles.dayDetail}>
              <div className={styles.dayDetailHeader}>
                <div>
                  <div className={styles.dayDetailDate}>{MONTHS[month]} {selectedDay}, {year}</div>
                  <div className={styles.dayDetailCount}>{selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}</div>
                </div>
                <button type="button" className={styles.dayDetailClose} onClick={() => setSelectedDay(null)}>✕</button>
              </div>
              {selectedPosts.length === 0 ? (
                <div className={styles.dayDetailEmpty}><span>📭</span><p>No posts scheduled</p></div>
              ) : (
                <div className={styles.dayDetailList}>
                  {selectedPosts.map((post) => (
                    <DayPostItem key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Day post item ────────────────────────────────────────────────────────────

function DayPostItem({ post }: { post: Post }) {
  const time = new Date(post.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={styles.dayPostItem}>
      {post.mediaUrls?.[0] && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={post.mediaUrls[0]} alt="" className={styles.dayPostThumb} />
      )}
      <div className={styles.dayPostInfo}>
        <p className={styles.dayPostContent}>{post.content.substring(0, 70)}{post.content.length > 70 ? '…' : ''}</p>
        <div className={styles.dayPostMeta}>
          <div className={styles.dayPostPlatforms}>
            {post.platforms.slice(0, 3).map((p) => (
              <span key={p} style={{ color: getPlatformColor(p) }}>{icons[p]}</span>
            ))}
          </div>
          <span className={styles.dayPostTime}>{time}</span>
          <span className={`${styles.dayPostStatus} ${styles[`status_${post.status}`]}`}>{post.status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ posts }: { posts: Post[] }) {
  const sorted = [...posts].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  if (sorted.length === 0) {
    return <div className={styles.listEmpty}><span>📭</span><p>No posts found</p></div>;
  }
  return (
    <div className={styles.listView}>
      {sorted.map((post) => (
        <div key={post.id} className={styles.listItem}>
          {post.mediaUrls?.[0] && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={post.mediaUrls[0]} alt="" className={styles.listThumb} />
          )}
          <div className={styles.listItemContent}>
            <p className={styles.listItemText}>{post.content}</p>
            <div className={styles.listItemMeta}>
              <div className={styles.listItemPlatforms}>
                {post.platforms.map((p) => (
                  <span key={p} style={{ color: getPlatformColor(p) }}>{icons[p]}</span>
                ))}
              </div>
              <span className={styles.listItemDate}>
                {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={`${styles.listItemStatus} ${styles[`status_${post.status}`]}`}>{post.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'published': return '#22c55e';
    case 'scheduled': return '#FF6B35';
    case 'failed':    return '#ef4444';
    default:          return '#9ca3af';
  }
}

function getPlatformColor(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.color ?? '#9ca3af';
}
