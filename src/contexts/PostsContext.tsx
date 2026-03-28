'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Post } from '@/types';

// Re-export so existing imports from this file keep working
export type { Post };

interface PostsContextType {
  posts: Post[];
  addPost: (post: { content: string; platforms: string[]; scheduledAt?: string; mediaUrls?: string[]; linkedInQueued?: boolean }) => void;
  updatePostStatus: (id: string, status: Post['status']) => void;
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    content: 'Product launch announcement 🚀 We\'re excited to share something incredible with you all!',
    scheduledAt: '2026-03-01T10:00:00',
    platforms: ['twitter', 'linkedin'],
    status: 'published',
    mediaUrls: ['https://picsum.photos/seed/launch1/400/300'],
  },
  {
    id: '2',
    content: 'Behind the scenes video of our amazing team working hard on the next big feature #BTS',
    scheduledAt: '2026-03-06T10:00:00',
    platforms: ['instagram'],
    status: 'published',
    mediaUrls: ['https://picsum.photos/seed/bts2/400/300'],
  },
  {
    id: '3',
    content: 'Behind the scenes sneak peek',
    scheduledAt: '2026-03-06T14:00:00',
    platforms: ['facebook'],
    status: 'published',
    mediaUrls: ['https://picsum.photos/seed/sneak3/400/300'],
  },
  {
    id: '4',
    content: 'Weekly tips thread — How to grow your social media presence in 2026',
    scheduledAt: '2026-03-13T09:00:00',
    platforms: ['twitter', 'linkedin'],
    status: 'published',
    mediaUrls: ['https://picsum.photos/seed/tips4/400/300'],
  },
  {
    id: '5',
    content: 'Customer success story: How @StartupXYZ grew 300% using AutoLaunch',
    scheduledAt: '2026-03-19T11:00:00',
    platforms: ['linkedin'],
    status: 'scheduled',
    mediaUrls: ['https://picsum.photos/seed/success5/400/300'],
  },
  {
    id: '6',
    content: 'Mountain adventure content — breathtaking views ahead! #Travel #Adventure',
    scheduledAt: '2026-03-19T14:00:00',
    platforms: ['instagram', 'facebook'],
    status: 'scheduled',
    mediaUrls: ['https://picsum.photos/seed/mountain6/400/300'],
  },
  {
    id: '7',
    content: 'Team spotlight: Meet Sarah, our head of AI research',
    scheduledAt: '2026-03-19T16:00:00',
    platforms: ['linkedin'],
    status: 'scheduled',
    mediaUrls: ['https://picsum.photos/seed/team7/400/300'],
  },
  {
    id: '8',
    content: 'New feature drop! AI-powered scheduling just got smarter 🤖',
    scheduledAt: '2026-03-22T10:00:00',
    platforms: ['twitter', 'instagram'],
    status: 'scheduled',
    mediaUrls: ['https://picsum.photos/seed/feature8/400/300'],
  },
  {
    id: '9',
    content: 'Community Q&A session — drop your questions below 👇',
    scheduledAt: '2026-03-28T15:00:00',
    platforms: ['twitter', 'linkedin', 'facebook'],
    status: 'scheduled',
  },
  {
    id: '10',
    content: 'Weekend inspiration: The best content creators share one secret...',
    scheduledAt: '2026-03-29T11:00:00',
    platforms: ['instagram'],
    status: 'scheduled',
    mediaUrls: ['https://picsum.photos/seed/inspire10/400/300'],
  },
];

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const addPost = useCallback((data: { content: string; platforms: string[]; scheduledAt?: string; mediaUrls?: string[]; linkedInQueued?: boolean }) => {
    const post: Post = {
      id: Date.now().toString(),
      content: data.content,
      platforms: data.platforms,
      scheduledAt: data.scheduledAt ?? new Date().toISOString(),
      status: data.scheduledAt ? 'scheduled' : 'published',
      mediaUrls: data.mediaUrls,
      linkedInQueued: data.linkedInQueued,
    };
    setPosts((prev) => [...prev, post]);
  }, []);

  const updatePostStatus = useCallback((id: string, status: Post['status']) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status, linkedInQueued: false } : p)));
  }, []);

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePostStatus }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
