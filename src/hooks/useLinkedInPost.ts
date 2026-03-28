'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface UseLinkedInPostResult {
  postToLinkedIn: (content: string, image?: File | null) => Promise<void>;
  isPosting: boolean;
  result: 'success' | 'error' | null;
  message: string;
  clearResult: () => void;
  isConnected: boolean;
}

/**
 * Reusable hook for posting content (with optional image) to LinkedIn.
 * Reads the LinkedIn access token from the NextAuth session and localStorage.
 * Posts via the /api/linkedin-post server-side route.
 */
export function useLinkedInPost(): UseLinkedInPostResult {
  const { data: session } = useSession();
  const [isPosting, setIsPosting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  // Determine connection state from session + localStorage
  const sessionConnected: Record<string, { accessToken: string; connectedAt: number }> =
    (session as any)?.connected ?? {};
  const linkedinData = sessionConnected['linkedin'];

  let localConnected: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      localConnected = JSON.parse(localStorage.getItem('al_connected_platforms') ?? '{}');
    } catch { /* ignore */ }
  }

  const isConnected = !!(linkedinData?.accessToken || localConnected['linkedin']);

  const clearResult = () => {
    setResult(null);
    setMessage('');
  };

  const postToLinkedIn = async (content: string, image?: File | null) => {
    if (!content?.trim()) {
      setResult('error');
      setMessage('Post content cannot be empty.');
      setTimeout(clearResult, 4000);
      return;
    }

    const accessToken = linkedinData?.accessToken;
    if (!accessToken) {
      setResult('error');
      setMessage(
        localConnected['linkedin']
          ? 'LinkedIn token not available in this session. Please disconnect and reconnect LinkedIn to grant posting permission.'
          : 'LinkedIn is not connected. Go to Social Platforms or Integrations tab to connect first.'
      );
      setTimeout(clearResult, 5000);
      return;
    }

    setIsPosting(true);
    setResult(null);
    setMessage('');

    try {
      let res: Response;

      if (image) {
        // Send as FormData for image upload
        const formData = new FormData();
        formData.append('accessToken', accessToken);
        formData.append('content', content);
        formData.append('image', image);
        res = await fetch('/api/linkedin-post', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text-only: send as JSON
        res = await fetch('/api/linkedin-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, content }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Posting failed');
      setResult('success');
      setMessage(data.message || 'Post published to LinkedIn!');
    } catch (e: unknown) {
      setResult('error');
      setMessage(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsPosting(false);
      setTimeout(clearResult, 6000);
    }
  };

  return { postToLinkedIn, isPosting, result, message, clearResult, isConnected };
}
