'use client';

import { useState } from 'react';
import styles from './Calendar.module.scss';
import { usePosts } from '@/contexts/PostsContext';
import { Post } from '@/contexts/PostsContext';
import { NewPostModal } from './new.post.modal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PLATFORM_META: Record<string, { color: string; icon: React.ReactNode }> = {
  twitter: {
    color: '#1d9bf0',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  linkedin: {
    color: '#0077b5',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  instagram: {
    color: '#e4405f',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
  facebook: {
    color: '#1877f2',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  youtube: {
    color: '#ff0000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  bluesky: {
    color: '#0085ff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>,
  },
};

function PlatformIcon({ platform }: { platform: string }) {
  const meta = PLATFORM_META[platform.toLowerCase()];
  if (!meta) return null;
  return (
    <span className={styles.platformIcon} style={{ color: meta.color }} title={platform}>
      {meta.icon}
    </span>
  );
}

export function CalendarComponent() {
  const { posts, addPost } = usePosts();
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter((p) => p.scheduledAt.startsWith(dateStr));
  };

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  const handleDayClick = (day: number) => {
    setSelectedDay(day === selectedDay ? null : day);
  };

  const openCreateModal = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00`;
    setModalDate(dateStr);
    setEditPost(null);
  };

  const openEditModal = (post: Post) => {
    setEditPost(post);
    setModalDate(post.scheduledAt);
  };

  return (
    <>
      <div className={styles.calendarWrapper}>
        <div className={styles.calendar}>
          <div className={styles.header}>
            <button type="button" aria-label="Previous month" className={styles.navBtn}
              onClick={() => { setCurrent(new Date(year, month - 1)); setSelectedDay(null); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className={styles.monthTitle}>{MONTHS[month]} {year}</h2>
            <button type="button" aria-label="Next month" className={styles.navBtn}
              onClick={() => { setCurrent(new Date(year, month + 1)); setSelectedDay(null); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className={styles.grid}>
            {DAYS.map((d) => (
              <div key={d} className={styles.dayName}>{d}</div>
            ))}

            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className={styles.emptyCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  className={`${styles.cell} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={styles.dayNum}>{day}</div>
                  <div className={styles.posts}>
                    {dayPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className={styles.postChip} data-status={post.status}
                        title={post.content}
                        onClick={(e) => { e.stopPropagation(); openEditModal(post); }}>
                        <div className={styles.chipIcons}>
                          {post.platforms.slice(0, 3).map((p) => (
                            <PlatformIcon key={p} platform={p} />
                          ))}
                        </div>
                        <span className={styles.chipText}>{post.content.substring(0, 18)}</span>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className={styles.more}>+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDay && (
          <div className={styles.dayPanel}>
            <div className={styles.dayPanelHeader}>
              <div>
                <span className={styles.dayPanelDate}>{MONTHS[month]} {selectedDay}, {year}</span>
                <span className={styles.dayPanelCount}>{selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.dayPanelActions}>
                <button type="button" className={styles.dayPanelAddBtn}
                  onClick={() => openCreateModal(selectedDay)} aria-label="Create post">
                  + New Post
                </button>
                <button type="button" className={styles.dayPanelClose}
                  onClick={() => setSelectedDay(null)} aria-label="Close">✕</button>
              </div>
            </div>

            {selectedPosts.length === 0 ? (
              <div className={styles.dayPanelEmpty}>
                <span>📭</span>
                <p>No posts scheduled</p>
                <button type="button" className={styles.dayPanelEmptyBtn}
                  onClick={() => openCreateModal(selectedDay)}>
                  + Create Post
                </button>
              </div>
            ) : (
              <div className={styles.dayPanelList}>
                {selectedPosts.map((post) => (
                  <DayPostCard key={post.id} post={post} onEdit={() => openEditModal(post)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post modal — create or edit */}
      {modalDate !== null && (
        <NewPostModal
          initialDate={modalDate}
          initialPost={editPost ?? undefined}
          onClose={() => { setModalDate(null); setEditPost(null); }}
          onPostCreated={(data) => {
            addPost(data);
            setModalDate(null);
            setEditPost(null);
          }}
        />
      )}
    </>
  );
}

function DayPostCard({ post, onEdit }: { post: Post; onEdit: () => void }) {
  return (
    <div className={styles.dayPostCard} data-status={post.status} onClick={onEdit} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}>
      <div className={styles.dayPostTop}>
        <div className={styles.dayPostPlatforms}>
          {post.platforms.map((p) => (
            <span key={p} className={styles.dayPostPlatformTag}
              style={{ borderColor: PLATFORM_META[p.toLowerCase()]?.color }}>
              <PlatformIcon platform={p} />
              {p}
            </span>
          ))}
        </div>
        <span className={styles.dayPostStatus} data-status={post.status}>{post.status}</span>
      </div>
      <p className={styles.dayPostContent}>{post.content}</p>
      <span className={styles.dayPostTime}>
        {new Date(post.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
