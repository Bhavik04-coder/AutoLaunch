'use client';

import { useState } from 'react';
import styles from './analytics.module.scss';

const METRICS = [
  { label: 'Total Impressions', value: '124.5K', change: '+12.4%', up: true, icon: '👁️' },
  { label: 'Engagements', value: '8,320', change: '+5.2%', up: true, icon: '💬' },
  { label: 'Followers Gained', value: '1,240', change: '+18.7%', up: true, icon: '👥' },
  { label: 'Posts Published', value: '48', change: '-2.1%', up: false, icon: '📝' },
];

const PLATFORMS = [
  { name: 'Twitter/X', followers: '12.4K', engagement: '3.2', engagementPct: 32, posts: 18, key: 'twitter' },
  { name: 'LinkedIn',  followers: '8.1K',  engagement: '5.8', engagementPct: 58, posts: 12, key: 'linkedin' },
  { name: 'Instagram', followers: '22.3K', engagement: '4.1', engagementPct: 41, posts: 10, key: 'instagram' },
  { name: 'Facebook',  followers: '5.6K',  engagement: '1.9', engagementPct: 19, posts: 8,  key: 'facebook' },
];

const BARS = [
  { day: 'Mon', heightClass: styles.barH40 },
  { day: 'Tue', heightClass: styles.barH65 },
  { day: 'Wed', heightClass: styles.barH45 },
  { day: 'Thu', heightClass: styles.barH80 },
  { day: 'Fri', heightClass: styles.barH55 },
  { day: 'Sat', heightClass: styles.barH90 },
  { day: 'Sun', heightClass: styles.barH70 },
];

const TOP_POSTS = [
  { text: 'Product launch announcement 🚀 — introducing our new AI scheduling engine', platform: 'Twitter/X', engagement: '2.4K engagements' },
  { text: 'Behind the scenes: how we built AutoLaunch in 6 months', platform: 'LinkedIn', engagement: '1.8K engagements' },
  { text: 'Weekly tips: 5 ways to grow your Instagram following organically', platform: 'Instagram', engagement: '1.2K engagements' },
];

export function AnalyticsComponent() {
  const [range, setRange] = useState('7d');

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.pageTitle}>Analytics</span>
          <div className={styles.rangeSelector}>
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                type="button"
                className={range === r ? styles.active : ''}
                onClick={() => setRange(r)}
              >
                {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className={styles.exportBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>

      <div className={styles.content}>
        {/* Metric cards */}
        <div className={styles.metrics}>
          {METRICS.map((m) => (
            <div key={m.label} className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricIcon}>{m.icon}</span>
              </div>
              <div className={styles.metricValue}>{m.value}</div>
              <div className={styles.metricFooter}>
                <span className={`${styles.metricChange} ${m.up ? styles.up : styles.down}`}>
                  {m.up ? '↑' : '↓'} {m.change}
                </span>
                <span className={styles.metricPeriod}>vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Impressions Over Time</h3>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: '#FF6B35' }} />
                Impressions
              </div>
            </div>
          </div>
          <div className={styles.chartArea}>
            <div className={styles.chartBars}>
              {BARS.map(({ day, heightClass }) => (
                <div key={day} className={styles.barWrapper}>
                  <div className={`${styles.bar} ${heightClass}`} />
                  <div className={styles.barLabel}>{day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className={styles.bottomRow}>
          {/* Platform breakdown */}
          <div className={styles.platformsCard}>
            <h3 className={styles.sectionTitle}>Platform Breakdown</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Followers</th>
                  <th>Engagement</th>
                  <th>Posts</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORMS.map((p) => (
                  <tr key={p.name}>
                    <td>
                      <div className={styles.platformName}>
                        <div className={`${styles.platformDot} ${styles[`dot_${p.key}`]}`} />
                        {p.name}
                      </div>
                    </td>
                    <td>{p.followers}</td>
                    <td>
                      <div className={styles.engagementBar}>
                        <div className={styles.engagementTrack}>
                          <div className={styles.engagementFill} style={{ width: `${p.engagementPct}%` }} />
                        </div>
                        {p.engagement}%
                      </div>
                    </td>
                    <td>{p.posts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top posts */}
          <div className={styles.topPostsCard}>
            <h3 className={styles.sectionTitle}>Top Performing Posts</h3>
            {TOP_POSTS.map((post, i) => (
              <div key={i} className={styles.topPost}>
                <div className={styles.topPostRank}>{i + 1}</div>
                <div className={styles.topPostContent}>
                  <div className={styles.topPostText}>{post.text}</div>
                  <div className={styles.topPostMeta}>{post.platform} · {post.engagement}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
