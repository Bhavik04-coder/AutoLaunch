'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import styles from './home.module.scss';

function NavDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div
      className={styles.navDropdown}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className={styles.navDropdownTrigger}>
        {label}
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
      <div className={styles.videoSectionHeader}>
        <h2 className={styles.sectionTitle}>See it in action</h2>
        <p className={styles.sectionSubtitle}>Watch how AutoLaunch transforms your social media workflow</p>
      </div>

      <div className={styles.videoWrapper}>
        {/* Floating social icons around the video */}
        <div className={`${styles.floatingIcon} ${styles.fi_tl}`} aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_tr}`} aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_bl}`} aria-label="Twitter / X">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_br}`} aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_ml}`} aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_mr}`} aria-label="Twitter / X">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_tc}`} aria-label="Twitter / X">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
        <div className={`${styles.floatingIcon} ${styles.fi_bc}`} aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
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
            style={{ background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(99,102,241,0.25) 0%, transparent 65%)` }}
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

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const features = [
    {
      id: 'launches',
      title: 'Launches',
      description: 'Schedule and manage your social media posts with our intuitive calendar',
      color: '#6366f1',
      path: '/launches'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track performance and get insights across all your social platforms',
      color: '#8b5cf6',
      path: '/analytics'
    },
    {
      id: 'media',
      title: 'Media Library',
      description: 'Store and organize all your media files in one centralized place',
      color: '#ec4899',
      path: '/media'
    },
    {
      id: 'agents',
      title: 'AI Agents',
      description: 'Generate engaging content with AI-powered suggestions',
      color: '#f59e0b',
      path: '/agents'
    },
    {
      id: 'plugs',
      title: 'Plugins',
      description: 'Extend functionality with powerful plugins and integrations',
      color: '#10b981',
      path: '/plugs'
    },
    {
      id: 'third-party',
      title: 'Integrations',
      description: 'Connect with Twitter, Facebook, Instagram, LinkedIn and more',
      color: '#3b82f6',
      path: '/third-party'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your profile, team members, and account preferences',
      color: '#6b7280',
      path: '/settings'
    }
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Image src="/large.png" alt="AutoLaunch logo" width={36} height={36} className={styles.navLogoImg} priority />
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
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.decorativeLeaf}>🌿</div>
          <div className={styles.decorativeStar1}>✨</div>
          <div className={styles.decorativeStar2}>✦</div>
          <div className={styles.decorativeCircles}>
            <div className={styles.circle1}></div>
            <div className={styles.circle2}></div>
          </div>
        </div>
        
        <div className={styles.heroContent}>

          <h1 className={styles.heroTitle}>
            Your agentic social
            <br />
            media scheduling tool
            <svg className={styles.underline} viewBox="0 0 300 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15 Q 150 5, 295 15" stroke="url(#gradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </h1>

          <p className={styles.heroSubtitle}>
            AutoLaunch offers everything you need to manage your social media posts, build
            <br />
            an audience, capture leads, and grow your business faster with AI
          </p>

          <div className={styles.socialIcons}>
            <div className={styles.socialIcon} data-social="instagram">📷</div>
            <div className={styles.socialIcon} data-social="youtube">▶️</div>
            <div className={styles.socialIcon} data-social="linkedin">in</div>
            <div className={styles.socialIcon} data-social="pinterest">📌</div>
            <div className={styles.socialIcon} data-social="twitter">🐦</div>
            <div className={styles.socialIcon} data-social="producthunt">📧</div>
            <div className={styles.socialIcon} data-social="x">𝕏</div>
            <div className={styles.socialIcon} data-social="facebook">f</div>
            <div className={styles.socialIcon} data-social="reddit">🤖</div>
            <div className={styles.socialIcon} data-social="bluesky">💬</div>
            <div className={styles.socialIcon} data-social="discord">🎮</div>
            <div className={styles.socialIcon} data-social="twitch">📺</div>
            <div className={styles.socialIcon} data-social="telegram">✈️</div>
            <div className={styles.socialIcon} data-social="whatsapp">💬</div>
          </div>

          <button className={styles.ctaButton} onClick={() => router.push('/auth/login')}>
            Start your 7-day free trial
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </section>

      {/* Features Section - Clickable Cards */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Explore Features</h2>
          <p className={styles.sectionSubtitle}>
            Click on any feature to get started
          </p>
        </div>
        
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div
              key={feature.id}
              className={styles.featureCard}
              onClick={() => router.push(`/auth/login?redirect=${feature.path}`)}
            >
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <div className={styles.featureArrow}>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Showcase Section */}
      <VideoShowcase />

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <h2 className={styles.testimonialsTitle}>Trusted by customers all over the world</h2>

        {/* Row 1 — scrolls left */}
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeLeft}>
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className={styles.marqueeTrack}>
                <div className={`${styles.testimonialCard} ${styles.purple}`}>
                  <div className={styles.statValue}>+10%</div>
                  <div className={styles.statLabel}>Grew following</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Raymond Harrison</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.blue}`}>
                  <div className={styles.statValue}>x2</div>
                  <div className={styles.statLabel}>Boost in engagement rate</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Lisa Anders</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.blueLight}`}>
                  <div className={styles.statValue}>x4</div>
                  <div className={styles.statLabel}>Increase in traffic</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Cindy Goodman</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.purpleDeep}`}>
                  <div className={styles.statValue}>+15%</div>
                  <div className={styles.statLabel}>Followers</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Larry Williams</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.purpleBright}`}>
                  <div className={styles.statValue}>+50%</div>
                  <div className={styles.statLabel}>Increase in followers</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Paula Wright</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeRight}>
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className={styles.marqueeTrack}>
                <div className={`${styles.testimonialCard} ${styles.purpleMid}`}>
                  <div className={styles.statValue}>+10%</div>
                  <div className={styles.statLabel}>Increase in impressions</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Joel Johnson</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.purpleViolet}`}>
                  <div className={styles.statValue}>+15%</div>
                  <div className={styles.statLabel}>Increase in engagement</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Jason Smith</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.pink}`}>
                  <div className={styles.statValue}>2x</div>
                  <div className={styles.statLabel}>Boost in engagement rate</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Sherry Porter</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.pinkBright}`}>
                  <div className={styles.statValue}>3x</div>
                  <div className={styles.statLabel}>Increase in traffic</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Betty McGee</span></div>
                </div>
                <div className={`${styles.testimonialCard} ${styles.blueAccent}`}>
                  <div className={styles.statValue}>3k</div>
                  <div className={styles.statLabel}>Saved per month</div>
                  <div className={styles.userInfo}><span className={styles.userName}>Jonathan Turner</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterCard}>
          <h2 className={styles.newsletterTitle}>Subscribe to the Newsletter</h2>
          <p className={styles.newsletterSubtitle}>For occasional updates, news and events</p>
          
          <div className={styles.newsletterForm}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className={styles.emailInput}
            />
            <button className={styles.subscribeButton}>
              Subscribe
            </button>
            <svg className={styles.arrow} viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 25 Q 30 10, 50 25 T 90 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M85 20 L95 25 L85 30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Product Hunt Badges */}
        <div className={styles.badgesContainer}>
          <div className={styles.badge}>
            <div className={styles.badgeIcon}>🏆</div>
            <div className={styles.badgeContent}>
              <div className={styles.badgeLabel}>PRODUCT HUNT</div>
              <div className={styles.badgeTitle}>#1 Product of the Month</div>
            </div>
          </div>
          
          <div className={styles.badge}>
            <div className={styles.badgeIcon}>🥇</div>
            <div className={styles.badgeContent}>
              <div className={styles.badgeLabel}>PRODUCT HUNT</div>
              <div className={styles.badgeTitle}>#1 Product of the Week</div>
            </div>
          </div>
          
          <div className={styles.badge}>
            <div className={styles.badgeIcon}>🥇</div>
            <div className={styles.badgeContent}>
              <div className={styles.badgeLabel}>PRODUCT HUNT</div>
              <div className={styles.badgeTitle}>#1 Product of the Day</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>AutoLaunch</h3>
            <p className={styles.footerText}>
              The all-in-one social media management platform for modern teams.
            </p>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Product</h4>
            <a href="#features">Features</a>
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
          <p>&copy; 2026 AutoLaunch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
