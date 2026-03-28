'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Post } from '@/types';

// Re-export so existing imports from this file keep working
export type { Post };

interface PostsContextType {
  posts: Post[];
  addPost: (post: { content: string; platforms: string[]; scheduledAt?: string }) => void;
}

const INITIAL_POSTS: Post[] = [
  { id: '1', content: 'Product launch announcement 🚀', scheduledAt: '2026-03-15T10:00:00', platforms: ['twitter'],            status: 'published' },
  { id: '2', content: 'Behind the scenes video',        scheduledAt: '2026-03-18T14:00:00', platforms: ['instagram'],          status: 'scheduled' },
  { id: '3', content: 'Weekly tips thread',             scheduledAt: '2026-03-20T09:00:00', platforms: ['twitter', 'linkedin'], status: 'scheduled' },
  { id: '4', content: 'Customer success story',         scheduledAt: '2026-03-25T11:00:00', platforms: ['linkedin'],           status: 'scheduled' },
];

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const addPost = useCallback((data: { content: string; platforms: string[]; scheduledAt?: string }) => {
    const post: Post = {
      id: Date.now().toString(),
      content: data.content,
      platforms: data.platforms,
      scheduledAt: data.scheduledAt ?? new Date().toISOString(),
      status: data.scheduledAt ? 'scheduled' : 'published',
    };
    setPosts((prev) => [...prev, post]);
  }, []);

  return (
    <PostsContext.Provider value={{ posts, addPost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
