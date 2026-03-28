'use client';

import React, { useState } from 'react';
import styles from './launches.module.scss';
import { CalendarComponent } from './calendar.component';
import { NewPostModal } from './new.post.modal';
import { PostsProvider, usePosts, Post } from '@/contexts/PostsContext';
import { useLinkedInPost } from '@/hooks/useLinkedInPost';

export function LaunchesComponent() {
  return (
    <PostsProvider>
      <LaunchesInner />
    </PostsProvider>
  );
}

function LaunchesInner() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showNewPost, setShowNewPost] = useState(false);
  const { addPost } = usePosts();

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={view === 'calendar' ? styles.active : ''}
            onClick={() => setView('calendar')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21 23" fill="none">
              <path d="M19.5 9.5H1.5M14.5 1.5V5.5M6.5 1.5V5.5M6.3 21.5H14.7C16.38 21.5 17.22 21.5 17.862 21.173C18.426 20.885 18.885 20.426 19.173 19.862C19.5 19.22 19.5 18.38 19.5 16.7V8.3C19.5 6.62 19.5 5.78 19.173 5.138C18.885 4.574 18.426 4.115 17.862 3.827C17.22 3.5 16.38 3.5 14.7 3.5H6.3C4.62 3.5 3.78 3.5 3.138 3.827C2.574 4.115 2.115 4.574 1.827 5.138C1.5 5.78 1.5 6.62 1.5 8.3V16.7C1.5 18.38 1.5 19.22 1.827 19.862C2.115 20.426 2.574 20.885 3.138 21.173C3.78 21.5 4.62 21.5 6.3 21.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Calendar
          </button>
          <button
            type="button"
            className={view === 'list' ? styles.active : ''}
            onClick={() => setView('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            List
          </button>
        </div>

        <button type="button" className={styles.newPostBtn} onClick={() => setShowNewPost(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Create Post
        </button>
      </div>

      <PostTrackerBar />
      <div className={styles.content}>
        {view === 'calendar' ? <CalendarComponent /> : <PostListView />}
      </div>

      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onPostCreated={(data) => addPost({ ...data, scheduledAt: data.scheduledAt || '' })}
        />
      )}
    </div>
  );
}

function PostTrackerBar() {
  const { posts } = usePosts();
  const total = posts.length;
  const published = posts.filter((p) => p.status === 'published').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const failed = posts.filter((p) => p.status === 'failed').length;

  const publishedPct = total ? Math.round((published / total) * 100) : 0;
  const scheduledPct = total ? Math.round((scheduled / total) * 100) : 0;
  const failedPct = total ? Math.round((failed / total) * 100) : 0;

  return (
    <div className={styles.tracker}>
      <div className={styles.trackerStats}>
        <span className={styles.trackerStat}>
          <span className={styles.dot} data-type="published" />
          Published <strong>{published}</strong> ({publishedPct}%)
        </span>
        <span className={styles.trackerStat}>
          <span className={styles.dot} data-type="scheduled" />
          Scheduled <strong>{scheduled}</strong> ({scheduledPct}%)
        </span>
        {failed > 0 && (
          <span className={styles.trackerStat}>
            <span className={styles.dot} data-type="failed" />
            Failed <strong>{failed}</strong> ({failedPct}%)
          </span>
        )}
        <span className={styles.trackerTotal}>Total: {total} posts</span>
      </div>
      <div className={styles.trackerBar}>
        <div className={styles.trackerFill} data-type="published" style={{ width: `${publishedPct}%` }} title={`Published: ${publishedPct}%`} />
        <div className={styles.trackerFill} data-type="scheduled" style={{ width: `${scheduledPct}%` }} title={`Scheduled: ${scheduledPct}%`} />
        <div className={styles.trackerFill} data-type="failed" style={{ width: `${failedPct}%` }} title={`Failed: ${failedPct}%`} />
      </div>
      <div className={styles.trackerLabels}>
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function PostListView() {
  const { posts } = usePosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  return (
    <div className={styles.listView}>
      {sorted.map((post) => (
        <PostListCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostListCard({ post }: { post: Post }) {
  const { postToLinkedIn, isPosting, result, message } = useLinkedInPost();
  const hasLinkedIn = post.platforms.some((p) => p.toLowerCase() === 'linkedin');

  return (
    <div className={styles.postCard}>
      <div className={styles.postStatus} data-status={post.status} />
      <div className={styles.postContent}>{post.content}</div>
      <div className={styles.postMeta}>
        <div className={styles.postPlatforms}>
          {post.platforms.map((p) => (
            <span key={p} className={styles.platformTag}>{p}</span>
          ))}
        </div>
        <div className={styles.postDate}>
          {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {hasLinkedIn && (
        <div className={styles.postActions}>
          {message && (
            <span className={result === 'success' ? styles.postSuccessMsg : styles.postErrorMsg}>
              {result === 'success' ? '✅' : '⚠️'} {message}
            </span>
          )}
          <button
            type="button"
            className={styles.postLinkedInBtn}
            onClick={() => postToLinkedIn(post.content)}
            disabled={isPosting || result === 'success'}
          >
            {isPosting ? 'Posting...' : result === 'success' ? '✓ Posted!' : '🚀 Post to LinkedIn'}
          </button>
        </div>
      )}
    </div>
  );
}
