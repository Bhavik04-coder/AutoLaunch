'use client';
import { useRef, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useLinkedInPost } from '@/hooks/useLinkedInPost';
import styles from './third-party.module.scss';

const TABS = ['Social Platforms', 'Brand Details', 'Integrations', 'Uploads', 'Templates', 'Exports'];

const PLATFORMS = [
  { id: 'twitter',   name: 'X (Twitter)', subtitle: 'Profile',                      color: '#000000', hasWatch: true,  provider: 'twitter'   },
  { id: 'linkedin',  name: 'LinkedIn',    subtitle: 'Page or Profile',              color: '#0077b5', hasWatch: true,  provider: 'linkedin'  },
  { id: 'instagram', name: 'Instagram',   subtitle: 'Business or Creator accounts', color: '#e4405f', hasWatch: true,  provider: 'instagram' },
  { id: 'facebook',  name: 'Facebook',    subtitle: 'Page',                         color: '#1877f2', hasWatch: true,  provider: 'facebook'  },
  { id: 'youtube',   name: 'YouTube',     subtitle: 'Channel',                      color: '#ff0000', hasWatch: true,  provider: 'youtube'   },
];

const INTEGRATIONS = [
  { id: 'zapier',   name: 'Zapier',            desc: 'Automate workflows across 5,000+ apps',         color: '#ff4a00', icon: '⚡' },
  { id: 'slack',    name: 'Slack',             desc: 'Get post notifications in your Slack channels',  color: '#4a154b', icon: '💬' },
  { id: 'notion',   name: 'Notion',            desc: 'Sync your content calendar with Notion',         color: '#000000', icon: '📝' },
  { id: 'hubspot',  name: 'HubSpot',           desc: 'Connect social activity to your CRM',            color: '#ff7a59', icon: '🔶' },
  { id: 'canva',    name: 'Canva',             desc: 'Import designs directly from Canva',             color: '#00c4cc', icon: '🎨' },
  { id: 'google_a', name: 'Google Analytics',  desc: 'Track social traffic in Google Analytics',       color: '#e37400', icon: '📊' },
  { id: 'webhook',  name: 'Webhooks',          desc: 'Send real-time events to your own endpoints',    color: '#6366f1', icon: '🔗' },
  { id: 'make',     name: 'Make (Integromat)', desc: 'Build advanced automation scenarios',            color: '#6d00cc', icon: '🔄' },
];

// Platforms available for OAuth auth in the Integrations tab
const AUTH_PLATFORMS = [
  { id: 'twitter',   name: 'X (Twitter)', desc: 'Post tweets and threads',              color: '#000000', provider: 'twitter'   },
  { id: 'linkedin',  name: 'LinkedIn',    desc: 'Publish to your profile or page',      color: '#0077b5', provider: 'linkedin'  },
  { id: 'instagram', name: 'Instagram',   desc: 'Post to Business or Creator accounts', color: '#e4405f', provider: 'instagram' },
  { id: 'facebook',  name: 'Facebook',    desc: 'Publish to your Facebook Page',        color: '#1877f2', provider: 'facebook'  },
  { id: 'youtube',   name: 'YouTube',     desc: 'Upload videos to your channel',        color: '#ff0000', provider: 'youtube'   },
  { id: 'google',    name: 'Google',      desc: 'Connect Google account for Analytics', color: '#e37400', provider: 'google'    },
];

const TEMPLATE_CATEGORIES = ['All', 'Promotional', 'Educational', 'Engagement', 'Announcements'];
const TEMPLATES = [
  { id: 't1', name: 'Product Launch',     category: 'Promotional',   platforms: ['instagram','twitter'],  preview: '🚀 Exciting news! Our new [product] is here...' },
  { id: 't2', name: 'Weekly Tips',        category: 'Educational',   platforms: ['linkedin','twitter'],   preview: '💡 Tip of the week: [tip content here]...' },
  { id: 't3', name: 'Poll & Question',    category: 'Engagement',    platforms: ['twitter','instagram'],  preview: '🗳️ Quick question for our community: [question]?' },
  { id: 't4', name: 'Team Spotlight',     category: 'Announcements', platforms: ['linkedin'],             preview: '👋 Meet [name], our [role] who [achievement]...' },
  { id: 't5', name: 'Flash Sale',         category: 'Promotional',   platforms: ['instagram','facebook'], preview: '🔥 LIMITED TIME: [X]% off everything today only!' },
  { id: 't6', name: 'How-To Guide',       category: 'Educational',   platforms: ['linkedin','youtube'],   preview: '📚 Step-by-step: How to [topic] in [X] easy steps...' },
  { id: 't7', name: 'Customer Story',     category: 'Engagement',    platforms: ['instagram','facebook'], preview: '❤️ "[quote from customer]" — [customer name]' },
  { id: 't8', name: 'Event Announcement', category: 'Announcements', platforms: ['all'],                  preview: '📅 Mark your calendar! [Event] is happening on [date]...' },
];

const EXPORT_HISTORY = [
  { id: 'e1', name: 'Analytics Report — March 2026', type: 'PDF',  size: '2.4 MB', date: 'Mar 20, 2026' },
  { id: 'e2', name: 'Post Performance — Q1 2026',    type: 'CSV',  size: '840 KB', date: 'Mar 15, 2026' },
  { id: 'e3', name: 'Audience Insights — Feb 2026',  type: 'XLSX', size: '1.1 MB', date: 'Feb 28, 2026' },
  { id: 'e4', name: 'Content Calendar — March 2026', type: 'CSV',  size: '320 KB', date: 'Mar 10, 2026' },
  { id: 'e5', name: 'Engagement Summary — Feb 2026', type: 'PDF',  size: '3.2 MB', date: 'Feb 14, 2026' },
];

const PLATFORM_SVG: Record<string, React.ReactNode> = {
  instagram: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  facebook:  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  linkedin:  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  google:    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>,
  pinterest: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
  twitter:   <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube:   <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
};

function PlatformIcon({ id, color }: { id: string; color: string }) {
  return (
    <span className={styles.platformIconWrap} style={{ color, background: `${color}18` }}>
      {PLATFORM_SVG[id] ?? '🔗'}
    </span>
  );
}

function Toast({ msg }: { msg: string }) {
  return <div className={styles.toast}><span>✓</span> {msg}</div>;
}

/* ── Social Platforms ─────────────────────────────────────────────────────── */
function SocialPlatformsTab() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast]     = useState('');

  // connected map from JWT (last OAuth provider that completed)
  const sessionConnected: Record<string, { accessToken: string; connectedAt: number }> =
    (session as any)?.connected ?? {};

  // Persist connected platforms in localStorage so multiple platforms survive
  // across separate OAuth redirects (each redirect creates a new session)
  const [localConnected, setLocalConnected] = useState<Record<string, { name: string; connectedAt: number }>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('al_connected_platforms') ?? '{}'); } catch { return {}; }
  });

  // When session changes (OAuth just completed), merge the new provider in
  useEffect(() => {
    const provider = (session as any)?.provider as string | undefined;
    if (!provider || !sessionConnected[provider]) return;
    setLocalConnected((prev) => {
      const next = {
        ...prev,
        [provider]: {
          name: session?.user?.name ?? provider,
          connectedAt: sessionConnected[provider].connectedAt,
        },
      };
      localStorage.setItem('al_connected_platforms', JSON.stringify(next));
      return next;
    });
  }, [session]);

  const handleConnect = async (id: string, provider: string) => {
    setLoading(id);
    // callbackUrl brings user back to the integrations page after OAuth
    await signIn(provider, { callbackUrl: '/third-party' });
  };

  const handleDisconnect = (id: string, provider: string, name: string) => {
    setLoading(id);
    setLocalConnected((prev) => {
      const next = { ...prev };
      delete next[provider];
      localStorage.setItem('al_connected_platforms', JSON.stringify(next));
      return next;
    });
    setToast(`${name} disconnected`);
    setTimeout(() => setToast(''), 3000);
    setLoading(null);
  };

  return (
    <>
      {toast && <Toast msg={toast} />}
      <div className={styles.platformList}>
        {PLATFORMS.map((p) => {
          const conn = localConnected[p.provider];
          const isConnected = !!conn;
          return (
            <div key={p.id} className={`${styles.platformRow} ${isConnected ? styles.platformRowConnected : ''}`}>
              <PlatformIcon id={p.id} color={p.color} />
              <div className={styles.platformInfo}>
                <div className={styles.platformName}>{p.name}</div>
                <div className={styles.platformSubtitle}>
                  {isConnected ? `Connected as ${conn.name}` : p.subtitle}
                </div>
              </div>
              <div className={styles.platformActions}>
                {isConnected && <span className={styles.connectedBadge}>✓ Connected</span>}
                {isConnected ? (
                  <button type="button" className={styles.disconnectBtn}
                    onClick={() => handleDisconnect(p.id, p.provider, p.name)}
                    disabled={loading === p.id}>
                    {loading === p.id ? <span className={styles.spinner} /> : 'Disconnect'}
                  </button>
                ) : (
                  <button type="button" className={styles.addBtn}
                    onClick={() => handleConnect(p.id, p.provider)}
                    disabled={loading === p.id}>
                    {loading === p.id ? <span className={styles.spinner} /> : 'Connect'}
                  </button>
                )}
                <button type="button" className={styles.linkBtn}>
                  <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  FAQ
                </button>
                {p.hasWatch && (
                  <button type="button" className={styles.linkBtn}>
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                    </svg>
                    Watch Videos
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Brand Details ────────────────────────────────────────────────────────── */
type CaptionResult = {
  linkedin:  { content: string; metadata: { readabilityScore: number; engagementPotential: number } };
  twitter:   { tweet:   string; metadata: { readabilityScore: number; engagementPotential: number } };
  instagram: { caption: string; metadata: { readabilityScore: number; engagementPotential: number } };
};

function BrandDetailsTab() {
  const { data: session } = useSession();
  const [brandName,  setBrandName]  = useState('AutoLaunch');
  const [website,    setWebsite]    = useState('https://autolaunch.io');
  const [industry,   setIndustry]   = useState('SaaS / Technology');
  const [tagline,    setTagline]    = useState('Your agentic social media scheduling tool');
  const [voice,      setVoice]      = useState('professional');
  const [primary,    setPrimary]    = useState('#6366f1');
  const [secondary,  setSecondary]  = useState('#8b5cf6');
  const [logoUrl,    setLogoUrl]    = useState('');
  const [saved,      setSaved]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Caption generator state
  const [cgModel,       setCgModel]       = useState<'gemini' | 'llama'>('gemini');
  const [cgGoal,        setCgGoal]        = useState('Awareness');
  const [cgFeature,     setCgFeature]     = useState('');
  const [cgLoading,     setCgLoading]     = useState(false);
  const [cgError,       setCgError]       = useState('');
  const [cgResult,      setCgResult]      = useState<CaptionResult | null>(null);
  const [cgActiveTab,   setCgActiveTab]   = useState<'linkedin' | 'twitter' | 'instagram'>('linkedin');
  const [copied,        setCopied]        = useState('');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDate,  setScheduleDate]  = useState('');
  const [scheduleTime,  setScheduleTime]  = useState('');
  const [scheduled,     setScheduled]     = useState(false);

  // Image upload for posts
  const [cgImage,        setCgImage]        = useState<File | null>(null);
  const [cgImagePreview, setCgImagePreview] = useState<string | null>(null);
  const [cgDragging,     setCgDragging]     = useState(false);
  const cgImageRef = useRef<HTMLInputElement>(null);

  // LinkedIn posting via reusable hook
  const { postToLinkedIn, isPosting: postingToLI, result: liPostResult, message: liPostMsg } = useLinkedInPost();

  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      setCgError('Image must be under 10 MB.');
      return;
    }
    setCgImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setCgImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCgImage(null);
    setCgImagePreview(null);
    if (cgImageRef.current) cgImageRef.current.value = '';
  };

  const handleGenerate = async () => {
    setCgLoading(true);
    setCgError('');
    setCgResult(null);
    try {
      const res = await fetch('/api/caption-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, tagline, voice, industry, goal: cgGoal, featureNote: cgFeature, model: cgModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCgResult(data as CaptionResult);
    } catch (e: unknown) {
      setCgError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setCgLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSchedule = async () => {
    await new Promise((r) => setTimeout(r, 700));
    setScheduled(true);
    setTimeout(() => { setScheduled(false); setScheduleModal(false); }, 2500);
  };

  // ── Post to LinkedIn ──────────────────────────────────────────────────
  const handlePostToLinkedIn = async () => {
    const content = cgResult?.linkedin?.content;
    if (!content) {
      return; // button is disabled if no content anyway
    }
    await postToLinkedIn(content, cgImage);
  };

  const activeContent = cgResult
    ? cgActiveTab === 'linkedin'  ? cgResult.linkedin.content
    : cgActiveTab === 'twitter'   ? cgResult.twitter.tweet
    : cgResult.instagram.caption
    : '';

  const save = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const PLATFORM_TABS = [
    { key: 'linkedin'  as const, label: '🔵 LinkedIn',  icon: '🔵' },
    { key: 'twitter'   as const, label: '🐦 Twitter/X', icon: '🐦' },
    { key: 'instagram' as const, label: '📸 Instagram', icon: '📸' },
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Brand Identity</h3>
        <p className={styles.sectionDesc}>Helps AI generate on-brand content for your social posts.</p>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bd-name">Brand Name</label>
            <input id="bd-name" type="text" className={styles.input} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bd-web">Website</label>
            <input id="bd-web" type="url" className={styles.input} value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bd-industry">Industry</label>
            <select id="bd-industry" className={styles.select} value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {['SaaS / Technology','E-commerce','Healthcare','Finance','Education','Marketing Agency','Real Estate','Food & Beverage','Fashion','Other'].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bd-voice">Brand Voice</label>
            <select id="bd-voice" className={styles.select} value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="casual">Casual &amp; Friendly</option>
              <option value="witty">Witty &amp; Humorous</option>
              <option value="inspirational">Inspirational</option>
              <option value="authoritative">Authoritative</option>
            </select>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="bd-tagline">Tagline / Description</label>
            <textarea id="bd-tagline" className={styles.textarea} rows={3} value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Visual Identity</h3>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bd-primary">Primary Color</label>
            <div className={styles.colorRow}>
              <input id="bd-primary-picker" type="color" aria-label="Primary color picker" className={styles.colorPicker} value={primary} onChange={(e) => setPrimary(e.target.value)} />
              <input id="bd-primary" type="text" className={styles.input} value={primary} onChange={(e) => setPrimary(e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bd-secondary">Secondary Color</label>
            <div className={styles.colorRow}>
              <input id="bd-secondary-picker" type="color" aria-label="Secondary color picker" className={styles.colorPicker} value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              <input id="bd-secondary" type="text" className={styles.input} value={secondary} onChange={(e) => setSecondary(e.target.value)} />
            </div>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Brand Logo</label>
            <div className={styles.uploadZone} onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}>
              {logoUrl
                ? <img src={logoUrl} alt="Brand logo" className={styles.logoPreview} />
                : <>
                    <span className={styles.uploadIcon}>🖼️</span>
                    <span className={styles.uploadText}>Click to upload logo</span>
                    <span className={styles.uploadHint}>PNG, SVG or JPG · Max 2 MB</span>
                  </>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" aria-label="Upload brand logo" className={styles.hiddenInput}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoUrl(URL.createObjectURL(f)); }} />
          </div>
        </div>
      </div>

      <button type="button" className={styles.saveBtn} onClick={save}>
        {saved ? '✓ Saved!' : 'Save Brand Details'}
      </button>

      {/* ── AI Caption Generator ─────────────────────────────────────────── */}
      <div className={styles.tabSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>✨ AI Caption Generator</h3>
            <p className={styles.sectionDesc}>Generate on-brand captions for LinkedIn, Twitter/X, and Instagram using your brand details above.</p>
          </div>
        </div>

        <div className={styles.cgFeatureRow}>
          <div className={styles.field} style={{ flex: 1 }}>
            <label className={styles.label} htmlFor="cg-feature">New Release / Feature <span className={styles.cgOptional}>(optional)</span></label>
            <textarea
              id="cg-feature"
              className={styles.textarea}
              rows={2}
              value={cgFeature}
              onChange={(e) => setCgFeature(e.target.value)}
              placeholder="e.g. We just launched AI-powered scheduling — it auto-picks the best time to post based on your audience activity..."
            />
          </div>
        </div>

        {/* ── Image upload area ─────────────────────────────────────────── */}
        <div className={styles.cgImageSection}>
          <label className={styles.label}>Post Image <span className={styles.cgOptional}>(optional — will be attached to LinkedIn post)</span></label>
          {cgImagePreview ? (
            <div className={styles.cgImagePreviewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cgImagePreview} alt="Upload preview" className={styles.cgImagePreview} />
              <div className={styles.cgImageOverlay}>
                <span className={styles.cgImageName}>📎 {cgImage?.name}</span>
                <div className={styles.cgImageActions}>
                  <button type="button" className={styles.cgImageChangeBtn} onClick={() => cgImageRef.current?.click()}>🔄 Change</button>
                  <button type="button" className={styles.cgImageRemoveBtn} onClick={removeImage}>🗑 Remove</button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`${styles.cgImageDropZone} ${cgDragging ? styles.cgImageDropZoneActive : ''}`}
              onClick={() => cgImageRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setCgDragging(true); }}
              onDragLeave={() => setCgDragging(false)}
              onDrop={(e) => { e.preventDefault(); setCgDragging(false); handleImageSelect(e.dataTransfer.files[0]); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && cgImageRef.current?.click()}
            >
              <span className={styles.cgImageDropIcon}>🖼️</span>
              <span className={styles.cgImageDropText}>Click or drag an image here</span>
              <span className={styles.cgImageDropHint}>PNG, JPG, GIF · Max 10 MB</span>
            </div>
          )}
          <input
            ref={cgImageRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className={styles.hiddenInput}
            aria-label="Upload post image"
            onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className={styles.cgModelToggle}>
          <span className={styles.cgModelLabel}>Model</span>
          <button
            type="button"
            className={`${styles.cgModelBtn} ${cgModel === 'gemini' ? styles.cgModelBtnActive : ''}`}
            onClick={() => setCgModel('gemini')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Gemini
          </button>
          <button
            type="button"
            className={`${styles.cgModelBtn} ${cgModel === 'llama' ? styles.cgModelBtnActive : ''}`}
            onClick={() => setCgModel('llama')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-5h2v2h-2zm0-8h2v6h-2z"/></svg>
            Llama 3.2
          </button>
        </div>

        <div className={styles.cgControls}>
          <div className={styles.field} style={{ flex: 1, maxWidth: 280 }}>
            <label className={styles.label} htmlFor="cg-goal">Campaign Goal</label>
            <select id="cg-goal" className={styles.select} value={cgGoal} onChange={(e) => setCgGoal(e.target.value)}>
              {['Awareness', 'Signups', 'Traffic', 'Engagement', 'Sales', 'Retention'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <button type="button" className={styles.generateBtn} onClick={handleGenerate} disabled={cgLoading}>
            {cgLoading ? <><span className={styles.spinner} /> Generating...</> : '⚡ Generate Captions'}
          </button>
        </div>

        {/* Brand context pill */}
        <div className={styles.cgContext}>
          <span className={styles.cgContextPill}>🏷️ {brandName}</span>
          <span className={styles.cgContextPill}>🎙️ {voice}</span>
          <span className={styles.cgContextPill}>🏭 {industry}</span>
          <span className={styles.cgContextPill}>🎯 {cgGoal}</span>
          <span className={`${styles.cgContextPill} ${styles.cgModelPill}`}>
            {cgModel === 'gemini' ? '✦ Gemini' : '🦙 Llama 3.2'}
          </span>
        </div>

        {cgError && <div className={styles.cgError}>⚠️ {cgError}</div>}

        {cgLoading && (
          <div className={styles.cgSkeleton}>
            <div className={styles.cgSkeletonLine} style={{ width: '60%' }} />
            <div className={styles.cgSkeletonLine} style={{ width: '90%' }} />
            <div className={styles.cgSkeletonLine} style={{ width: '75%' }} />
            <div className={styles.cgSkeletonLine} style={{ width: '50%' }} />
          </div>
        )}

        {cgResult && !cgLoading && (
          <div className={styles.cgOutput}>
            {/* Platform tabs */}
            <div className={styles.cgTabs}>
              {PLATFORM_TABS.map((t) => (
                <button key={t.key} type="button"
                  className={`${styles.cgTab} ${cgActiveTab === t.key ? styles.cgTabActive : ''}`}
                  onClick={() => setCgActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* LinkedIn */}
            {cgActiveTab === 'linkedin' && (
              <div className={styles.cgCard}>
                <div className={styles.cgCardHeader}>
                  <span className={styles.cgPlatformBadge} style={{ background: 'rgba(0,119,181,.12)', color: '#0077b5' }}>🔵 LinkedIn</span>
                  <div className={styles.cgMeta}>
                    <span className={styles.cgMetaPill}>📊 Readability {cgResult.linkedin.metadata?.readabilityScore ?? '—'}/10</span>
                    <span className={styles.cgMetaPill}>🔥 Engagement {cgResult.linkedin.metadata?.engagementPotential ?? '—'}/10</span>
                    <span className={styles.cgMetaPill}>📝 {cgResult.linkedin.content?.length ?? 0} chars</span>
                  </div>
                </div>
                {cgImagePreview && (
                  <div className={styles.cgCardImagePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cgImagePreview} alt="Attached" className={styles.cgCardImageThumb} />
                    <span className={styles.cgCardImageLabel}>📎 Image attached — will be posted with caption</span>
                  </div>
                )}
                <pre className={styles.cgText}>{cgResult.linkedin.content ?? ''}</pre>
                <div className={styles.cgCardActions}>
                  <button type="button" className={styles.cgCopyBtn}
                    onClick={() => handleCopy(cgResult.linkedin.content ?? '', 'linkedin')}>
                    {copied === 'linkedin' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button type="button" className={styles.cgScheduleBtn} onClick={() => setScheduleModal(true)}>
                    📅 Create Post &amp; Schedule
                  </button>
                  <button type="button" className={styles.cgPostNowBtn}
                    onClick={handlePostToLinkedIn}
                    disabled={postingToLI || liPostResult === 'success'}>
                    {postingToLI
                      ? <><span className={styles.spinner} /> Posting...</>
                      : liPostResult === 'success'
                        ? '✓ Posted!'
                        : cgImage
                          ? '🚀 Post with Image to LinkedIn'
                          : '🚀 Post Now to LinkedIn'}
                  </button>
                </div>
                {liPostMsg && (
                  <div className={`${styles.cgPostFeedback} ${liPostResult === 'success' ? styles.cgPostSuccess : styles.cgPostError}`}>
                    {liPostResult === 'success' ? '✅' : '⚠️'} {liPostMsg}
                  </div>
                )}
              </div>
            )}

            {/* Twitter */}
            {cgActiveTab === 'twitter' && (
              <div className={styles.cgCard}>
                <div className={styles.cgCardHeader}>
                  <span className={styles.cgPlatformBadge} style={{ background: 'rgba(0,0,0,.08)', color: 'rgb(var(--new-textColor))' }}>🐦 Twitter / X</span>
                  <div className={styles.cgMeta}>
                    <span className={styles.cgMetaPill}>📊 Readability {cgResult.twitter.metadata?.readabilityScore ?? '—'}/10</span>
                    <span className={styles.cgMetaPill}>🔥 Engagement {cgResult.twitter.metadata?.engagementPotential ?? '—'}/10</span>
                    <span className={`${styles.cgMetaPill} ${(cgResult.twitter.tweet?.length ?? 0) > 280 ? styles.cgMetaWarn : ''}`}>
                      📝 {cgResult.twitter.tweet?.length ?? 0}/280
                    </span>
                  </div>
                </div>
                <pre className={styles.cgText}>{cgResult.twitter.tweet ?? ''}</pre>
                <div className={styles.cgCardActions}>
                  <button type="button" className={styles.cgCopyBtn}
                    onClick={() => handleCopy(cgResult.twitter.tweet ?? '', 'twitter')}>
                    {copied === 'twitter' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button type="button" className={styles.cgScheduleBtn} onClick={() => setScheduleModal(true)}>
                    📅 Create Post &amp; Schedule
                  </button>
                </div>
              </div>
            )}

            {/* Instagram */}
            {cgActiveTab === 'instagram' && (
              <div className={styles.cgCard}>
                <div className={styles.cgCardHeader}>
                  <span className={styles.cgPlatformBadge} style={{ background: 'rgba(228,64,95,.1)', color: '#e4405f' }}>📸 Instagram</span>
                  <div className={styles.cgMeta}>
                    <span className={styles.cgMetaPill}>📊 Readability {cgResult.instagram.metadata?.readabilityScore ?? '—'}/10</span>
                    <span className={styles.cgMetaPill}>🔥 Engagement {cgResult.instagram.metadata?.engagementPotential ?? '—'}/10</span>
                  </div>
                </div>
                <pre className={styles.cgText}>{cgResult.instagram.caption ?? ''}</pre>
                <div className={styles.cgCardActions}>
                  <button type="button" className={styles.cgCopyBtn}
                    onClick={() => handleCopy(cgResult.instagram.caption ?? '', 'instagram')}>
                    {copied === 'instagram' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button type="button" className={styles.cgScheduleBtn} onClick={() => setScheduleModal(true)}>
                    📅 Create Post &amp; Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Schedule Modal ───────────────────────────────────────────────── */}
      {scheduleModal && (
        <div className={styles.cgModalOverlay} onClick={() => setScheduleModal(false)}>
          <div className={styles.cgModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cgModalHeader}>
              <h4 className={styles.cgModalTitle}>📅 Schedule Post</h4>
              <button type="button" className={styles.cgModalClose} onClick={() => setScheduleModal(false)}>✕</button>
            </div>

            <div className={styles.cgModalPlatform}>
              {cgActiveTab === 'linkedin'  && <span style={{ color: '#0077b5' }}>🔵 LinkedIn</span>}
              {cgActiveTab === 'twitter'   && <span>🐦 Twitter / X</span>}
              {cgActiveTab === 'instagram' && <span style={{ color: '#e4405f' }}>📸 Instagram</span>}
            </div>

            <pre className={styles.cgModalPreview}>{activeContent.slice(0, 200)}{activeContent.length > 200 ? '…' : ''}</pre>

            <div className={styles.cgModalFields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sch-date">Date</label>
                <input id="sch-date" type="date" className={styles.input} value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sch-time">Time</label>
                <input id="sch-time" type="time" className={styles.input} value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)} />
              </div>
            </div>

            <div className={styles.cgModalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setScheduleModal(false)}>Cancel</button>
              <button type="button" className={styles.saveBtn} onClick={handleSchedule}
                disabled={!scheduleDate || !scheduleTime || scheduled}>
                {scheduled ? '✓ Scheduled!' : '📅 Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Integrations ─────────────────────────────────────────────────────────── */
function IntegrationsTab() {
  const { data: session } = useSession();
  const [enabled,  setEnabled]  = useState<Record<string, boolean>>({ slack: true });
  const [loading,  setLoading]  = useState<string | null>(null);
  const [toast,    setToast]    = useState('');
  const [webhook,  setWebhook]  = useState('');
  const [whSaved,  setWhSaved]  = useState(false);
  const [whEvents, setWhEvents] = useState<Record<string, boolean>>({
    'Post published': true, 'Post failed': true, 'New follower milestone': false, 'Analytics report ready': false,
  });

  // Persist connected platforms in localStorage (shared with SocialPlatformsTab)
  const [localConnected, setLocalConnected] = useState<Record<string, { name: string; connectedAt: number }>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('al_connected_platforms') ?? '{}'); } catch { return {}; }
  });

  // Merge newly completed OAuth into local state
  useEffect(() => {
    const provider = (session as any)?.provider as string | undefined;
    const sessionConnected: Record<string, { accessToken: string; connectedAt: number }> = (session as any)?.connected ?? {};
    if (!provider || !sessionConnected[provider]) return;
    setLocalConnected((prev) => {
      const next = {
        ...prev,
        [provider]: { name: session?.user?.name ?? provider, connectedAt: sessionConnected[provider].connectedAt },
      };
      localStorage.setItem('al_connected_platforms', JSON.stringify(next));
      return next;
    });
  }, [session]);

  const handleConnect = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/third-party' });
  };

  const handleDisconnect = (id: string, provider: string, name: string) => {
    setLoading(provider);
    setLocalConnected((prev) => {
      const next = { ...prev };
      delete next[provider];
      localStorage.setItem('al_connected_platforms', JSON.stringify(next));
      return next;
    });
    setToast(`${name} disconnected`);
    setTimeout(() => setToast(''), 3000);
    setLoading(null);
  };

  const toggle = async (id: string, name: string) => {
    setLoading(id);
    await new Promise((r) => setTimeout(r, 700));
    const wasOn = enabled[id];
    setEnabled((p) => ({ ...p, [id]: !p[id] }));
    setToast(`${name} ${wasOn ? 'disabled' : 'enabled'}`);
    setTimeout(() => setToast(''), 3000);
    setLoading(null);
  };

  const saveWebhook = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setWhSaved(true);
    setTimeout(() => setWhSaved(false), 2500);
  };

  return (
    <div className={styles.tabContent}>
      {toast && <Toast msg={toast} />}

      {/* ── Platform Auth ──────────────────────────────────────────────── */}
      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Connected Accounts</h3>
        <p className={styles.sectionDesc}>Authorize platforms to allow AutoLaunch to publish posts on your behalf.</p>
        <div className={styles.authPlatformGrid}>
          {AUTH_PLATFORMS.map((p) => {
            const conn = localConnected[p.provider];
            const isConnected = !!conn;
            const isLoading = loading === p.provider;
            return (
              <div key={p.id} className={`${styles.authPlatformCard} ${isConnected ? styles.authPlatformCardConnected : ''}`}>
                <div className={styles.authPlatformTop}>
                  <PlatformIcon id={p.id} color={p.color} />
                  <div className={styles.authPlatformInfo}>
                    <div className={styles.authPlatformName}>{p.name}</div>
                    <div className={styles.authPlatformDesc}>
                      {isConnected ? `Connected as ${conn.name}` : p.desc}
                    </div>
                  </div>
                  {isConnected && <span className={styles.connectedBadge}>✓</span>}
                </div>
                <div className={styles.authPlatformActions}>
                  {isConnected ? (
                    <button type="button" className={styles.disconnectBtn}
                      onClick={() => handleDisconnect(p.id, p.provider, p.name)}
                      disabled={isLoading}>
                      {isLoading ? <span className={styles.spinner} /> : 'Disconnect'}
                    </button>
                  ) : (
                    <button type="button" className={styles.authConnectBtn}
                      style={{ '--platform-color': p.color } as React.CSSProperties}
                      onClick={() => handleConnect(p.provider)}
                      disabled={isLoading}>
                      {isLoading ? <><span className={styles.spinner} /> Connecting...</> : `Connect ${p.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Third-Party Tools ──────────────────────────────────────────── */}
      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Third-Party Integrations</h3>
        <p className={styles.sectionDesc}>Connect AutoLaunch with your favourite tools to automate your workflow.</p>
        <div className={styles.integrationGrid}>
          {INTEGRATIONS.map((intg) => (
            <div key={intg.id} className={`${styles.integrationCard} ${enabled[intg.id] ? styles.integrationActive : ''}`}>
              <div className={styles.integrationIcon} style={{ background: `${intg.color}18`, color: intg.color }}>
                {intg.icon}
              </div>
              <div className={styles.integrationBody}>
                <div className={styles.integrationName}>{intg.name}</div>
                <div className={styles.integrationDesc}>{intg.desc}</div>
              </div>
              <button type="button"
                aria-label={`Toggle ${intg.name}`}
                className={`${styles.toggle} ${enabled[intg.id] ? styles.toggleOn : ''}`}
                onClick={() => toggle(intg.id, intg.name)} disabled={loading === intg.id}>
                <span className={styles.toggleThumb} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Webhook Configuration</h3>
        <p className={styles.sectionDesc}>Receive real-time POST requests when events happen in AutoLaunch.</p>
        <div className={styles.webhookBox}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="wh-url">Endpoint URL</label>
            <div className={styles.webhookRow}>
              <input id="wh-url" type="url" className={styles.input} placeholder="https://your-server.com/webhook"
                value={webhook} onChange={(e) => setWebhook(e.target.value)} />
              <button type="button" className={styles.saveBtn} onClick={saveWebhook}>
                {whSaved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>
          <div className={styles.webhookEvents}>
            <div className={styles.label} style={{ marginBottom: 10 }}>Trigger on</div>
            {Object.keys(whEvents).map((ev) => (
              <label key={ev} className={styles.checkRow}>
                <input type="checkbox" className={styles.checkbox} checked={whEvents[ev]}
                  onChange={() => setWhEvents((p) => ({ ...p, [ev]: !p[ev] }))} />
                <span>{ev}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Uploads ──────────────────────────────────────────────────────────────── */
type UploadFile = { id: string; name: string; size: string; type: string; url: string; date: string };

function UploadsTab() {
  const [files,    setFiles]   = useState<UploadFile[]>([
    { id: 'u1', name: 'brand-hero.png',   size: '1.2 MB', type: 'image',    url: '', date: 'Mar 18, 2026' },
    { id: 'u2', name: 'product-demo.mp4', size: '24 MB',  type: 'video',    url: '', date: 'Mar 15, 2026' },
    { id: 'u3', name: 'logo-white.svg',   size: '48 KB',  type: 'image',    url: '', date: 'Mar 10, 2026' },
    { id: 'u4', name: 'team-photo.jpg',   size: '3.4 MB', type: 'image',    url: '', date: 'Mar 5, 2026'  },
    { id: 'u5', name: 'brand-guide.pdf',  size: '5.1 MB', type: 'document', url: '', date: 'Feb 28, 2026' },
  ]);
  const [dragging, setDragging] = useState(false);
  const [filter,   setFilter]   = useState<'all'|'image'|'video'|'document'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next: UploadFile[] = Array.from(list).map((f) => ({
      id:   Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size > 1_000_000 ? `${(f.size / 1_000_000).toFixed(1)} MB` : `${Math.round(f.size / 1000)} KB`,
      type: f.type.startsWith('video') ? 'video' : f.type.startsWith('image') ? 'image' : 'document',
      url:  f.type.startsWith('image') ? URL.createObjectURL(f) : '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    setFiles((p) => [...next, ...p]);
  };

  const filtered = filter === 'all' ? files : files.filter((f) => f.type === filter);

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Media Library</h3>
            <p className={styles.sectionDesc}>Upload and manage assets used across your social posts.</p>
          </div>
          <button type="button" className={styles.saveBtn} onClick={() => fileRef.current?.click()}>+ Upload Files</button>
        </div>

        <div className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}>
          <span className={styles.dropIcon}>☁️</span>
          <span className={styles.dropText}>Drag &amp; drop files here, or click to browse</span>
          <span className={styles.dropHint}>Images, videos, PDFs · Max 50 MB each</span>
        </div>
        <input ref={fileRef} type="file" multiple aria-label="Upload media files" className={styles.hiddenInput} onChange={(e) => addFiles(e.target.files)} />

        <div className={styles.filterRow}>
          {(['all','image','video','document'] as const).map((f) => (
            <button key={f} type="button"
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {' '}({f === 'all' ? files.length : files.filter((x) => x.type === f).length})
            </button>
          ))}
        </div>

        <div className={styles.fileGrid}>
          {filtered.map((f) => (
            <div key={f.id} className={styles.fileCard}>
              <div className={styles.fileThumb}>
                {f.url
                  ? <img src={f.url} alt={f.name} className={styles.fileImg} />
                  : <span className={styles.fileTypeIcon}>{f.type === 'video' ? '🎬' : f.type === 'document' ? '📄' : '🖼️'}</span>
                }
              </div>
              <div className={styles.fileMeta}>
                <div className={styles.fileName}>{f.name}</div>
                <div className={styles.fileInfo}>{f.size} · {f.date}</div>
              </div>
              <button type="button" className={styles.fileDelete} aria-label="Delete file"
                onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}>✕</button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.emptyFiles}>No {filter === 'all' ? '' : filter + ' '}files yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Templates ────────────────────────────────────────────────────────────── */
function TemplatesTab() {
  const [category,  setCategory]  = useState('All');
  const [search,    setSearch]    = useState('');
  const [used,      setUsed]      = useState<string | null>(null);
  const [creating,  setCreating]  = useState(false);
  const [newName,   setNewName]   = useState('');
  const [newBody,   setNewBody]   = useState('');
  const [customs,   setCustoms]   = useState<typeof TEMPLATES>([]);

  const all = [...TEMPLATES, ...customs];
  const filtered = all.filter((t) =>
    (category === 'All' || t.category === category) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    setCustoms((p) => [...p, {
      id: 'c' + Date.now(), name: newName, category: 'Promotional',
      platforms: ['all'], preview: newBody || 'Custom template content...',
    }]);
    setNewName(''); setNewBody(''); setCreating(false);
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Post Templates</h3>
            <p className={styles.sectionDesc}>Reusable templates to speed up content creation.</p>
          </div>
          <button type="button" className={styles.saveBtn} onClick={() => setCreating(true)}>+ New Template</button>
        </div>

        {creating && (
          <div className={styles.createTemplateBox}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tpl-name">Template Name</label>
              <input id="tpl-name" type="text" className={styles.input} placeholder="e.g. Monday Motivation"
                value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tpl-body">Content</label>
              <textarea id="tpl-body" className={styles.textarea} rows={3}
                placeholder="Write your template content with [placeholders]..."
                value={newBody} onChange={(e) => setNewBody(e.target.value)} />
            </div>
            <div className={styles.createTemplateActions}>
              <button type="button" className={styles.saveBtn} onClick={handleCreate}>Save Template</button>
              <button type="button" className={styles.cancelBtn} onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className={styles.templateToolbar}>
          <input type="search" className={styles.searchInput} placeholder="Search templates..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className={styles.filterRow}>
            {TEMPLATE_CATEGORIES.map((c) => (
              <button key={c} type="button"
                className={`${styles.filterBtn} ${category === c ? styles.filterActive : ''}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className={styles.templateGrid}>
          {filtered.map((t) => (
            <div key={t.id} className={styles.templateCard}>
              <div className={styles.templateHeader}>
                <span className={styles.templateCategory}>{t.category}</span>
                <div className={styles.templatePlatforms}>
                  {t.platforms.map((pid) => (
                    <span key={pid} className={styles.tplPlatformDot} title={pid}>
                      {pid === 'all' ? '🌐' : PLATFORM_SVG[pid] ?? pid}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.templateName}>{t.name}</div>
              <div className={styles.templatePreview}>{t.preview}</div>
              <div className={styles.templateActions}>
                <button type="button" className={styles.useBtn}
                  onClick={() => { setUsed(t.id); setTimeout(() => setUsed(null), 2000); }}>
                  {used === t.id ? '✓ Copied!' : 'Use Template'}
                </button>
                <button type="button" className={styles.editTplBtn}>Edit</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className={styles.emptyFiles}>No templates match your search</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Exports ──────────────────────────────────────────────────────────────── */
function ExportsTab() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated,  setGenerated]  = useState<string | null>(null);
  const [dateRange,  setDateRange]  = useState('last30');
  const [format,     setFormat]     = useState('PDF');
  const [reportType, setReportType] = useState('analytics');

  const generate = async () => {
    const key = `${reportType}-${format}-${Date.now()}`;
    setGenerating(key);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(null);
    setGenerated(key);
    setTimeout(() => setGenerated(null), 3000);
  };

  return (
    <div className={styles.tabContent}>
      {generated && <Toast msg="Report generated and ready to download" />}

      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Generate Report</h3>
        <p className={styles.sectionDesc}>Export your analytics, post performance, and audience data.</p>
        <div className={styles.exportForm}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="exp-type">Report Type</label>
              <select id="exp-type" className={styles.select} value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="analytics">Analytics Overview</option>
                <option value="posts">Post Performance</option>
                <option value="audience">Audience Insights</option>
                <option value="calendar">Content Calendar</option>
                <option value="engagement">Engagement Summary</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="exp-range">Date Range</label>
              <select id="exp-range" className={styles.select} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="last90">Last 90 days</option>
                <option value="thisYear">This year</option>
                <option value="allTime">All time</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Format</label>
              <div className={styles.formatRow}>
                {['PDF', 'CSV', 'XLSX'].map((f) => (
                  <button key={f} type="button"
                    className={`${styles.formatBtn} ${format === f ? styles.formatActive : ''}`}
                    onClick={() => setFormat(f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" className={styles.generateBtn} onClick={generate} disabled={!!generating}>
            {generating ? <><span className={styles.spinner} /> Generating...</> : '↓ Generate Report'}
          </button>
        </div>
      </div>

      <div className={styles.tabSection}>
        <h3 className={styles.sectionTitle}>Export History</h3>
        <div className={styles.exportTable}>
          <div className={styles.exportTableHead}>
            <span>Report</span><span>Format</span><span>Size</span><span>Date</span><span></span>
          </div>
          {EXPORT_HISTORY.map((e) => (
            <div key={e.id} className={styles.exportRow}>
              <span className={styles.exportName}>{e.name}</span>
              <span className={styles.exportBadge} data-type={e.type.toLowerCase()}>{e.type}</span>
              <span className={styles.exportSize}>{e.size}</span>
              <span className={styles.exportDate}>{e.date}</span>
              <button type="button" className={styles.downloadBtn}>↓ Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Root component ───────────────────────────────────────────────────────── */
export function ThirdPartyComponent() {
  const [activeTab, setActiveTab] = useState('Social Platforms');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Brand &amp; Social Accounts</h1>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button key={tab} type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'Social Platforms' && <SocialPlatformsTab />}
        {activeTab === 'Brand Details'    && <BrandDetailsTab />}
        {activeTab === 'Integrations'     && <IntegrationsTab />}
        {activeTab === 'Uploads'          && <UploadsTab />}
        {activeTab === 'Templates'        && <TemplatesTab />}
        {activeTab === 'Exports'          && <ExportsTab />}
      </div>
    </div>
  );
}
