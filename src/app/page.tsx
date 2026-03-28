'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import styles from './home.module.scss';

// ─── Scroll-reveal hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealActive);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Nav Dropdown ────────────────────────────────────────────────────────────
function NavDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.navDropdown} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={styles.navDropdownTrigger}>
        {label}
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={styles.navDropdownMenu}>
          {items.map((item) => (
            <button
              key={item.href + item.label}
              className={styles.navDropdownItem}
              onClick={() => router.push(`/auth/login?redirect=${item.href}`)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trusted By ──────────────────────────────────────────────────────────────
function TrustedBy() {
  const platforms = [
    { name: 'LinkedIn', color: '#0077B5' },
    { name: 'Instagram', color: '#E4405F' },
    { name: 'X / Twitter', color: '#ffffff' },
    { name: 'YouTube', color: '#FF0000' },
    { name: 'Meta', color: '#1877F2' },
    { name: 'TikTok', color: '#69C9D0' },
  ];
  return (
    <div className={styles.trustedBy}>
      <p className={styles.trustedLabel}>Trusted by creators on</p>
      <div className={styles.trustedLogos}>
        {platforms.map((p) => (
          <span key={p.name} className={styles.trustedLogo} style={{ color: p.color }}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Value Prop ───────────────────────────────────────────────────────────────
function ValueProp() {
  return (
    <section className={styles.valuePropSection}>
      <div className={styles.valuePropInner}>
        <div className={`${styles.sectionHeader} ${styles.reveal}`}>
          <span className={styles.sectionEyebrow}>Built for growth</span>
          <h2 className={styles.sectionTitle}>The way social media management<br />should have always worked</h2>
          <p className={styles.sectionSubtitle}>A focused workflow where your team always knows what to post, when to post it, and how it's performing.</p>
        </div>

        <div className={styles.valuePropGrid}>
          {/* Card 1 */}
          <div className={`${styles.valuePropCard} ${styles.reveal}`}>
            <div className={styles.vpMockUI}>
              <div className={styles.vpMockHeader}>
                <div className={styles.vpMockDots}>
                  <span /><span /><span />
                </div>
                <span className={styles.vpMockTitle}>Connect Accounts</span>
              </div>
              <div className={styles.vpPlatformList}>
                {[
                  { name: 'LinkedIn', color: '#0077B5', connected: true },
                  { name: 'Instagram', color: '#E4405F', connected: true },
                  { name: 'X / Twitter', color: '#1a1a1a', connected: false },
                ].map((p) => (
                  <div key={p.name} className={styles.vpPlatformRow}>
                    <div className={styles.vpPlatformDot} style={{ background: p.color }} />
                    <span>{p.name}</span>
                    <span className={p.connected ? styles.vpConnected : styles.vpDisconnected}>
                      {p.connected ? '✓ Connected' : '+ Connect'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <h3 className={styles.vpCardTitle}>Connect your channels</h3>
            <p className={styles.vpCardText}>Wire up all your social accounts in under 2 minutes. OAuth sign-in, no copy-pasting tokens.</p>
          </div>

          {/* Card 2 */}
          <div className={`${styles.valuePropCard} ${styles.valuePropCardAccent} ${styles.reveal}`} style={{ transitionDelay: '100ms' }}>
            <div className={styles.vpAbsoluteBadge}>New</div>
            <div className={styles.vpMockUI}>
              <div className={styles.vpMockHeader}>
                <div className={styles.vpMockDots}><span /><span /><span /></div>
                <span className={styles.vpMockTitle}>AI Caption</span>
              </div>
              <div className={styles.vpChatRow}>
                <div className={styles.vpChatPrompt}>Write a caption for my product launch 🚀</div>
              </div>
              <div className={styles.vpChatResponse}>
                <div className={styles.vpAiBadge}>✦ AI</div>
                <p>Ready to change the game? Introducing our latest product — built for speed, designed for impact. Drop a 🚀 if you're ready!</p>
              </div>
              <div className={styles.vpPlatformTags}>
                <span style={{ background: '#0077B5' }}>LinkedIn</span>
                <span style={{ background: '#E4405F' }}>Instagram</span>
                <span style={{ background: '#1a1a1a' }}>X</span>
              </div>
            </div>
            <h3 className={styles.vpCardTitle}>Create &amp; schedule</h3>
            <p className={styles.vpCardText}>AI drafts your captions. One calendar. Every platform. Publish instantly or queue it up for peak hours.</p>
          </div>

          {/* Card 3 */}
          <div className={`${styles.valuePropCard} ${styles.reveal}`} style={{ transitionDelay: '200ms' }}>
            <div className={styles.vpMockUI}>
              <div className={styles.vpMockHeader}>
                <div className={styles.vpMockDots}><span /><span /><span /></div>
                <span className={styles.vpMockTitle}>Analytics</span>
              </div>
              <div className={styles.vpStatRow}>
                <div className={styles.vpStat}>
                  <span className={styles.vpStatNum}>+34%</span>
                  <span className={styles.vpStatLbl}>Engagement</span>
                </div>
                <div className={styles.vpStat}>
                  <span className={styles.vpStatNum}>2.1k</span>
                  <span className={styles.vpStatLbl}>Followers</span>
                </div>
              </div>
              <div className={styles.vpBarChart}>
                {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
                  <div key={i} className={styles.vpBar} style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <h3 className={styles.vpCardTitle}>Track &amp; optimize</h3>
            <p className={styles.vpCardText}>See exactly what drives growth. Engagement rates, reach, best posting times — all in one place.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Video Showcase ───────────────────────────────────────────────────────────
function VideoShowcase() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    setTransform(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)');
    setIsHovered(false);
  };

  return (
    <section className={styles.videoSection}>
      <div className={`${styles.videoSectionHeader} ${styles.reveal}`}>
        <span className={styles.sectionEyebrow}>Live demo</span>
        <h2 className={styles.sectionTitle}>See it in action</h2>
        <p className={styles.sectionSubtitle}>Watch how AutoLaunch transforms your social media workflow in real time</p>
      </div>

      <div className={styles.videoWrapper}>
        <div className={`${styles.floatingIcon} ${styles.fi_tl}`} aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_tr}`} aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_bl}`} aria-label="X / Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_br}`} aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_ml}`} aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_mr}`} aria-label="X / Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_tc}`} aria-label="X / Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_bc}`} aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        </div>

        <div
          ref={cardRef}
          className={styles.videoCard}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{ transform, transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out' }}
        >
          <div
            className={styles.videoGlow}
            style={{ background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,107,53,0.2) 0%, transparent 65%)` }}
          />
          <video
            className={styles.video}
            src="/motion2Fast_Animate_this_modern_SaaS_dashboard_UI_where_a_user_0.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className={styles.videoOverlay}>
            <div className={styles.videoLabel}>Live Demo</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const router = useRouter();
  return (
    <section className={styles.featuresAltSection}>
      <div className={styles.featuresAltInner}>

        {/* Feature 1 — AI Captions */}
        <div className={`${styles.featureRow} ${styles.reveal}`}>
          <div className={styles.featureMockWrap}>
            <div className={styles.featureMock}>
              <div className={styles.fmHeader}>
                <div className={styles.fmDots}><span /><span /><span /></div>
                <span className={styles.fmTitle}>AI Caption Generator</span>
              </div>
              <div className={styles.fmBody}>
                <div className={styles.fmPromptRow}>
                  <span className={styles.fmUser}>You</span>
                  <div className={styles.fmPrompt}>Generate a post announcing our new feature drop 🚀</div>
                </div>
                <div className={styles.fmResponseRow}>
                  <span className={styles.fmAiLabel}>✦ AI</span>
                  <div className={styles.fmResponse}>
                    <p><strong>LinkedIn:</strong> Exciting news! We've just shipped a feature that changes everything. Faster workflows, smarter AI, and results you can measure. Ready to level up? 🚀 #ProductLaunch #AI</p>
                    <p><strong>Instagram:</strong> New drop just landed 🔥 Tap to see what we've been building... #BuildInPublic</p>
                  </div>
                </div>
                <div className={styles.fmActions}>
                  <button className={styles.fmBtn}>Copy LinkedIn</button>
                  <button className={styles.fmBtn}>Copy Instagram</button>
                  <button className={`${styles.fmBtn} ${styles.fmBtnPrimary}`}>Schedule all →</button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.featureText}>
            <span className={styles.sectionEyebrow}>AI-powered</span>
            <h3 className={styles.featureRowTitle}>Write once,<br />post everywhere</h3>
            <p className={styles.featureRowDesc}>Our AI understands each platform's tone and character limits. One prompt generates platform-optimized captions for LinkedIn, Instagram, X, Facebook, and more — simultaneously.</p>
            <div className={styles.featureStat}>
              <span className={styles.featureStatNum}>10×</span>
              <span className={styles.featureStatLbl}>faster content creation</span>
            </div>
            <button className={styles.featureRowCta} onClick={() => router.push('/auth/login?redirect=/agents')}>
              Try AI captions →
            </button>
          </div>
        </div>

        {/* Feature 2 — Smart Scheduling (reversed) */}
        <div className={`${styles.featureRow} ${styles.featureRowReverse} ${styles.reveal}`}>
          <div className={styles.featureMockWrap}>
            <div className={`${styles.featureMock} ${styles.featureMockAccent}`}>
              <div className={styles.fmHeader}>
                <div className={styles.fmDots}><span /><span /><span /></div>
                <span className={styles.fmTitle}>Content Calendar — March 2026</span>
              </div>
              <div className={styles.calGrid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className={styles.calDayHead}>{d}</div>
                ))}
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const hasPost = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26].includes(day);
                  const colors = ['#0077B5', '#E4405F', '#6366f1'];
                  return (
                    <div key={day} className={`${styles.calDay} ${hasPost ? styles.calDayActive : ''}`}>
                      <span>{day}</span>
                      {hasPost && (
                        <div className={styles.calDots}>
                          {colors.slice(0, day % 3 === 0 ? 3 : day % 2 === 0 ? 2 : 1).map((c, ci) => (
                            <div key={ci} className={styles.calDot} style={{ background: c }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.featureText}>
            <span className={styles.sectionEyebrow}>Smart scheduling</span>
            <h3 className={styles.featureRowTitle}>Your whole month,<br />planned in minutes</h3>
            <p className={styles.featureRowDesc}>Visual drag-and-drop calendar. AutoLaunch finds your audience's peak engagement windows and fills your schedule automatically — across all connected platforms.</p>
            <div className={styles.featureStat}>
              <span className={styles.featureStatNum}>40%</span>
              <span className={styles.featureStatLbl}>less time on scheduling</span>
            </div>
            <button className={styles.featureRowCta} onClick={() => router.push('/auth/login?redirect=/launches')}>
              Open calendar →
            </button>
          </div>
        </div>

        {/* Feature 3 — Analytics */}
        <div className={`${styles.featureRow} ${styles.reveal}`}>
          <div className={styles.featureMockWrap}>
            <div className={styles.featureMock}>
              <div className={styles.fmHeader}>
                <div className={styles.fmDots}><span /><span /><span /></div>
                <span className={styles.fmTitle}>Performance Overview</span>
              </div>
              <div className={styles.analyticsBody}>
                <div className={styles.analyticsStats}>
                  {[
                    { label: 'Total Reach', value: '142k', change: '+18%', color: '#6366f1' },
                    { label: 'Engagement', value: '8.4%', change: '+34%', color: '#ec4899' },
                    { label: 'Followers', value: '+2.1k', change: 'this week', color: '#10b981' },
                  ].map((s) => (
                    <div key={s.label} className={styles.analyticsStat}>
                      <span className={styles.analyticsStatVal} style={{ color: s.color }}>{s.value}</span>
                      <span className={styles.analyticsStatChange}>{s.change}</span>
                      <span className={styles.analyticsStatLbl}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.analyticsChart}>
                  {[40, 65, 50, 80, 60, 90, 75, 85, 70, 95, 80, 100].map((h, i) => (
                    <div key={i} className={styles.analyticsBar} style={{ height: `${h}%`, background: `hsl(${240 + i * 10}, 70%, 60%)`, animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <div className={styles.analyticsPlatformRow}>
                  {[
                    { name: 'LinkedIn', color: '#0077B5', pct: 42 },
                    { name: 'Instagram', color: '#E4405F', pct: 31 },
                    { name: 'X', color: '#fff', pct: 27 },
                  ].map((p) => (
                    <div key={p.name} className={styles.analyticsPlatform}>
                      <div className={styles.analyticsPlatformBar}>
                        <div className={styles.analyticsPlatformFill} style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                      <span style={{ color: p.color }}>{p.name}</span>
                      <span>{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.featureText}>
            <span className={styles.sectionEyebrow}>Unified analytics</span>
            <h3 className={styles.featureRowTitle}>Know exactly<br />what's working</h3>
            <p className={styles.featureRowDesc}>One dashboard for every platform. Track reach, engagement, follower growth, and best-performing content. Stop guessing, start growing with data.</p>
            <div className={styles.featureStat}>
              <span className={styles.featureStatNum}>3×</span>
              <span className={styles.featureStatLbl}>faster growth for data-driven teams</span>
            </div>
            <button className={styles.featureRowCta} onClick={() => router.push('/auth/login?redirect=/analytics')}>
              View analytics →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Dashboard Showcase (dark section) ───────────────────────────────────────
function DashboardShowcase() {
  const stats = [
    { value: '10M+', label: 'Posts scheduled', color: '#6366f1' },
    { value: '50K+', label: 'Creators using AutoLaunch', color: '#8b5cf6' },
    { value: '8', label: 'Platforms supported', color: '#ec4899' },
    { value: '95%', label: 'Time saved on content', color: '#10b981' },
    { value: '3×', label: 'Average follower growth', color: '#f59e0b' },
    { value: '24/7', label: 'AI content assistance', color: '#3b82f6' },
  ];

  const features = [
    { icon: '🤖', title: 'AI Content Agent', desc: 'Generates platform-ready captions with one prompt. Tone-matched per channel.' },
    { icon: '📅', title: 'Smart Calendar', desc: 'Drag-and-drop scheduling with auto-optimal time detection.' },
    { icon: '📊', title: 'Cross-Platform Analytics', desc: 'Unified metrics across all connected accounts in real time.' },
    { icon: '🖼️', title: 'Media Library', desc: 'Store, organize, and reuse assets across all your campaigns.' },
    { icon: '🔔', title: 'Smart Notifications', desc: 'Alerts for peak engagement windows, trending topics, and post reminders.' },
    { icon: '🔗', title: '8 Integrations', desc: 'LinkedIn, Instagram, X, YouTube, Facebook, TikTok, Pinterest & more.' },
  ];

  return (
    <section className={styles.dashSection}>
      <div className={styles.dashInner}>
        <div className={`${styles.sectionHeader} ${styles.reveal}`}>
          <span className={styles.sectionEyebrow}>Everything in one place</span>
          <h2 className={styles.sectionTitle}>All your social media tools,<br />finally unified</h2>
          <p className={styles.sectionSubtitle}>A connected platform that keeps your team informed, aligned, and growing at every stage.</p>
        </div>

        <div className={styles.dashLayout}>
          {/* Stats column */}
          <div className={`${styles.dashStats} ${styles.reveal}`}>
            {stats.map((s, i) => (
              <div key={s.label} className={styles.dashStat} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className={styles.dashStatVal} style={{ color: s.color }}>{s.value}</span>
                <span className={styles.dashStatLbl}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Feature grid */}
          <div className={`${styles.dashFeatureGrid} ${styles.reveal}`}>
            {features.map((f, i) => (
              <div key={f.title} className={styles.dashFeatureCard} style={{ transitionDelay: `${i * 60}ms` }}>
                <div className={styles.dashFeatureIcon}>{f.icon}</div>
                <h4 className={styles.dashFeatureTitle}>{f.title}</h4>
                <p className={styles.dashFeatureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Before / After ───────────────────────────────────────────────────────────
function BeforeAfter() {
  return (
    <section className={styles.beforeAfterSection}>
      <div className={styles.beforeAfterInner}>
        <div className={`${styles.sectionHeader} ${styles.reveal}`}>
          <span className={styles.baEyebrow}>Before → After</span>
          <h2 className={styles.sectionTitle}>From scattered tabs to<br />one powerful hub</h2>
          <p className={styles.sectionSubtitle}>Clearer workflows, fewer context switches, and every platform always on the same page — without juggling tools.</p>
        </div>

        <div className={`${styles.baLayout} ${styles.reveal}`}>
          {/* Before */}
          <div className={styles.baBefore}>
            <p className={styles.baLabel}>Before</p>
            <div className={styles.baScatteredTools}>
              {['Buffer', 'Hootsuite', 'Canva', 'Google Sheets', 'Slack DMs', 'Notion Docs'].map((t) => (
                <div key={t} className={styles.baScatteredTool}>{t}</div>
              ))}
            </div>
          </div>

          {/* Center hub */}
          <div className={styles.baHub}>
            <div className={styles.baHubInner}>
              <Image src="/large.png" alt="AutoLaunch" width={40} height={40} className={styles.baHubLogo} />
              <span>AutoLaunch</span>
            </div>
            <p className={styles.baHubLabel}>Your social hub</p>
          </div>

          {/* After */}
          <div className={styles.baAfter}>
            <p className={styles.baLabel}>After</p>
            <div className={styles.baAfterList}>
              {[
                { dot: '#6366f1', text: 'AI caption generation' },
                { dot: '#8b5cf6', text: 'One unified calendar' },
                { dot: '#10b981', text: 'Cross-platform analytics' },
                { dot: '#ec4899', text: 'Media library' },
                { dot: '#3b82f6', text: '8 platform integrations' },
              ].map((item) => (
                <div key={item.text} className={styles.baAfterItem}>
                  <div className={styles.baAfterDot} style={{ background: item.dot }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How it Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Connect your accounts',
      desc: 'Sign in with LinkedIn, Instagram, X, YouTube, Facebook, and more. OAuth one-click setup — no tokens to copy, no API keys to manage. Ready in under 5 minutes.',
    },
    {
      num: '02',
      title: 'Create or generate content',
      desc: 'Write from scratch or let AI generate platform-optimized captions. Upload media to your library, set your publishing schedule, and preview exactly how posts will look on each channel.',
    },
    {
      num: '03',
      title: 'Launch and track results',
      desc: 'AutoLaunch publishes at optimal times. Track reach, engagement, follower growth, and revenue impact — all in one real-time dashboard. Iterate fast with AI-powered insights.',
    },
  ];

  return (
    <section className={styles.howItWorksSection}>
      <div className={styles.howItWorksInner}>
        <div className={`${styles.sectionHeader} ${styles.reveal}`}>
          <span className={styles.sectionEyebrow}>How it works</span>
          <h2 className={styles.sectionTitle}>Simple workflow built<br />for real results</h2>
          <p className={styles.sectionSubtitle}>From setup to your first published post in minutes, not hours.</p>
        </div>

        <div className={`${styles.howItWorksLayout} ${styles.reveal}`}>
          {/* Visual side */}
          <div className={styles.hiwVisual}>
            <div className={styles.hiwMockCard}>
              <div className={styles.hiwMockHeader}>
                <div className={styles.hiwMockStep}>Step {activeStep + 1} of 3</div>
                <div className={styles.hiwMockProgress}>
                  {steps.map((_, i) => (
                    <div key={i} className={`${styles.hiwProgressDot} ${i <= activeStep ? styles.hiwProgressDotActive : ''}`} />
                  ))}
                </div>
              </div>
              <div className={styles.hiwMockBody}>
                {activeStep === 0 && (
                  <div className={styles.hiwMockConnect}>
                    {[
                      { name: 'LinkedIn', color: '#0077B5' },
                      { name: 'Instagram', color: '#E4405F' },
                      { name: 'YouTube', color: '#FF0000' },
                      { name: 'X / Twitter', color: '#fff' },
                    ].map((p, i) => (
                      <div key={p.name} className={styles.hiwPlatformRow} style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className={styles.hiwPlatformDot} style={{ background: p.color }} />
                        <span>{p.name}</span>
                        <span className={styles.hiwConnectedBadge}>Connected ✓</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeStep === 1 && (
                  <div className={styles.hiwMockCreate}>
                    <div className={styles.hiwTextarea}>Announcing our biggest update yet! 🚀 We've rebuilt the editor from the ground up with AI-powered suggestions...</div>
                    <div className={styles.hiwPlatformBadges}>
                      {['LinkedIn', 'Instagram', 'X'].map(p => <span key={p} className={styles.hiwPlatBadge}>{p}</span>)}
                    </div>
                    <div className={styles.hiwAiRow}>
                      <span className={styles.hiwAiSpark}>✦</span>
                      <span>AI optimized for all 3 platforms</span>
                    </div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className={styles.hiwMockLaunch}>
                    <div className={styles.hiwLaunchStats}>
                      {[
                        { label: 'Reach', value: '14.2k', up: true },
                        { label: 'Likes', value: '847', up: true },
                        { label: 'Shares', value: '312', up: true },
                      ].map(s => (
                        <div key={s.label} className={styles.hiwLaunchStat}>
                          <span className={styles.hiwLaunchVal}>{s.value}</span>
                          <span className={styles.hiwLaunchLbl}>{s.label} {s.up ? '↑' : '↓'}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.hiwLaunchChart}>
                      {[30, 45, 60, 80, 65, 90, 75].map((h, i) => (
                        <div key={i} className={styles.hiwLaunchBar} style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Steps side */}
          <div className={styles.hiwSteps}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`${styles.hiwStep} ${i === activeStep ? styles.hiwStepActive : ''}`}
                onClick={() => setActiveStep(i)}
              >
                <div className={styles.hiwStepHeader}>
                  <span className={styles.hiwStepNum}>({step.num})</span>
                  <span className={styles.hiwStepTitle}>{step.title}</span>
                  <span className={styles.hiwStepToggle}>{i === activeStep ? '−' : '+'}</span>
                </div>
                {i === activeStep && (
                  <p className={styles.hiwStepDesc}>{step.desc}</p>
                )}
              </div>
            ))}
            <button className={styles.hiwCta} onClick={() => router.push('/auth/login')}>
              Get started free →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer CTA ────────────────────────────────────────────────────────────────
function FooterCTA() {
  const router = useRouter();
  return (
    <section className={styles.footerCtaSection}>
      <div className={`${styles.footerCtaInner} ${styles.reveal}`}>
        <h2 className={styles.footerCtaTitle}>
          Start scheduling smarter{' '}
          <span className={styles.footerCtaAccent}>today</span>
        </h2>
        <p className={styles.footerCtaSubtitle}>Set up your first campaign in minutes. No credit card required.</p>
        <button className={styles.footerCtaBtn} onClick={() => router.push('/auth/register')}>
          Get started free
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M7 13L13 7M13 7H8M13 7V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  useScrollReveal();

  return (
    <div className={styles.container}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Image src="/large.png" alt="AutoLaunch logo" width={34} height={34} className={styles.navLogoImg} priority />
          <span>AutoLaunch</span>
        </div>
        <div className={styles.navLinks}>
          <NavDropdown label="Features" items={[
            { label: '🚀 Launches', href: '/launches' },
            { label: '📊 Analytics', href: '/analytics' },
            { label: '🖼️ Media Library', href: '/media' },
            { label: '🤖 AI Agents', href: '/agents' },
          ]} />
          <NavDropdown label="Socials" items={[
            { label: '𝕏 Twitter / X', href: '/third-party' },
            { label: 'in LinkedIn', href: '/third-party' },
            { label: '📷 Instagram', href: '/third-party' },
            { label: 'f Facebook', href: '/third-party' },
          ]} />
          <NavDropdown label="Resources" items={[
            { label: '🔌 Plugins', href: '/plugs' },
            { label: '🔗 Integrations', href: '/third-party' },
            { label: '⚙️ Settings', href: '/settings' },
          ]} />
          {session ? (
            <div className={styles.navUser}>
              {session.user?.image && (
                <Image src={session.user.image} alt={session.user.name ?? ''} width={32} height={32} className={styles.navAvatar} />
              )}
              <span className={styles.navUserName}>{session.user?.name}</span>
              <button type="button" className={styles.navLink} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
              <button type="button" className={styles.navCta} onClick={() => router.push('/launches')}>Dashboard</button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className={styles.navLink}>Sign in</Link>
              <Link href="/auth/register" className={styles.navCta}>Get started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.decorativeCircles}>
            <div className={styles.circle1} />
            <div className={styles.circle2} />
          </div>
          <div className={styles.heroBlobLeft} />
          <div className={styles.heroBlobRight} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-powered social media management
          </div>

          <h1 className={styles.heroTitle}>
            Schedule smarter.
            <br />
            <span className={styles.heroTitleAccent}>Grow faster.</span>
            <svg className={styles.underline} viewBox="0 0 320 18" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 14 Q 160 4, 316 14"
                stroke="url(#heroGrad)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="320"
                strokeDashoffset="320"
                style={{ animation: 'drawLinePath 1s ease-out 1.2s forwards' }}
              />
              <defs>
                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </h1>

          <p className={styles.heroSubtitle}>
            AutoLaunch helps you create, schedule, and analyze content across<br />every social platform — powered by AI. One tool. Every channel.
          </p>

          <div className={styles.heroPlatformRow}>
            {[
              { name: 'LinkedIn', bg: '#0077B5', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
              { name: 'Instagram', bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
              { name: 'X', bg: '#111', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
              { name: 'YouTube', bg: '#FF0000', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
              { name: 'Facebook', bg: '#1877F2', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
              { name: 'TikTok', bg: 'linear-gradient(135deg,#69C9D0,#010101)', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.6a6.34 6.34 0 0 0 6.34-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.79a4.85 4.85 0 0 1-1.07-.1z" /></svg> },
            ].map((p) => (
              <div key={p.name} className={styles.heroPlatformIcon} style={{ background: p.bg }} aria-label={p.name} title={p.name}>
                {p.svg}
              </div>
            ))}
          </div>

          <div className={styles.heroCtaRow}>
            <button className={styles.ctaButton} onClick={() => router.push('/auth/login')}>
              Start your 7-day free trial
              <span className={styles.ctaArrow}>→</span>
            </button>
            <button className={styles.ctaSecondary} onClick={() => router.push('/auth/login')}>
              Watch demo
            </button>
          </div>

          <p className={styles.heroNoCc}>No credit card required · Cancel anytime</p>
        </div>
      </section>

      <TrustedBy />
      <ValueProp />
      <FeaturesSection />
      <VideoShowcase />
      <DashboardShowcase />
      <BeforeAfter />
      <HowItWorks />

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className={styles.testimonialsSection}>
        <h2 className={`${styles.testimonialsTitle} ${styles.reveal}`}>Trusted by creators all over the world</h2>

        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeLeft}>
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className={styles.marqueeTrack}>
                {[
                  { val: '+10%', lbl: 'Grew following', name: 'Raymond Harrison', cls: styles.purple },
                  { val: 'x2', lbl: 'Boost in engagement', name: 'Lisa Anders', cls: styles.blue },
                  { val: 'x4', lbl: 'Increase in traffic', name: 'Cindy Goodman', cls: styles.blueLight },
                  { val: '+15%', lbl: 'Followers gained', name: 'Larry Williams', cls: styles.purpleDeep },
                  { val: '+50%', lbl: 'Increase in followers', name: 'Paula Wright', cls: styles.purpleBright },
                ].map((t) => (
                  <div key={t.name} className={`${styles.testimonialCard} ${t.cls}`}>
                    <div className={styles.statValue}>{t.val}</div>
                    <div className={styles.statLabel}>{t.lbl}</div>
                    <div className={styles.userInfo}><span className={styles.userName}>{t.name}</span></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeRight}>
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className={styles.marqueeTrack}>
                {[
                  { val: '+10%', lbl: 'Increase in impressions', name: 'Joel Johnson', cls: styles.purpleMid },
                  { val: '+15%', lbl: 'Increase in engagement', name: 'Jason Smith', cls: styles.purpleViolet },
                  { val: '2x', lbl: 'Boost in engagement rate', name: 'Sherry Porter', cls: styles.pink },
                  { val: '3x', lbl: 'Increase in traffic', name: 'Betty McGee', cls: styles.pinkBright },
                  { val: '3k', lbl: 'Hours saved per month', name: 'Jonathan Turner', cls: styles.blueAccent },
                ].map((t) => (
                  <div key={t.name} className={`${styles.testimonialCard} ${t.cls}`}>
                    <div className={styles.statValue}>{t.val}</div>
                    <div className={styles.statLabel}>{t.lbl}</div>
                    <div className={styles.userInfo}><span className={styles.userName}>{t.name}</span></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterCTA />

      {/* ── Newsletter ───────────────────────────────────────── */}
      <section className={styles.newsletterSection}>
        <div className={`${styles.newsletterCard} ${styles.reveal}`}>
          <h2 className={styles.newsletterTitle}>Subscribe to the Newsletter</h2>
          <p className={styles.newsletterSubtitle}>Growth tips, platform updates, and AI content ideas — straight to your inbox</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" className={styles.emailInput} />
            <button className={styles.subscribeButton}>Subscribe</button>
            <svg className={styles.arrow} viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 25 Q 30 10, 50 25 T 90 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M85 20 L95 25 L85 30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className={`${styles.badgesContainer} ${styles.reveal}`}>
          {[
            { icon: '🏆', label: 'PRODUCT HUNT', title: '#1 Product of the Month' },
            { icon: '🥇', label: 'PRODUCT HUNT', title: '#1 Product of the Week' },
            { icon: '🥇', label: 'PRODUCT HUNT', title: '#1 Product of the Day' },
          ].map((b) => (
            <div key={b.title} className={styles.badge}>
              <div className={styles.badgeIcon}>{b.icon}</div>
              <div className={styles.badgeContent}>
                <div className={styles.badgeLabel}>{b.label}</div>
                <div className={styles.badgeTitle}>{b.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>AutoLaunch</h3>
            <p className={styles.footerText}>The all-in-one social media management platform for modern creators and teams.</p>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Product</h4>
            <a href="/auth/login?redirect=/launches">Launches</a>
            <a href="/auth/login?redirect=/analytics">Analytics</a>
            <a href="/auth/login?redirect=/agents">AI Agents</a>
            <a href="/auth/login?redirect=/third-party">Integrations</a>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Company</h4>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#careers">Careers</a>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#contact">Contact</a>
            <a href="#status">Status</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div className={styles.footerBigLogo}>AutoLaunch</div>
          <p>&copy; 2026 AutoLaunch. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
