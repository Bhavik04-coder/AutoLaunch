'use client';

import { useState } from 'react';
import styles from './PostComposer.module.scss';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { useLayout } from '@/contexts/LayoutContext';
import { useLinkedInPost } from '@/hooks/useLinkedInPost';
import AIContentGenerator from './AIContentGenerator';

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: PostData) => void;
}

interface PostData {
  content: string;
  platforms: string[];
  scheduledDate?: Date;
  media: File[];
}

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: '𝕏', color: '#000' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: '#0077b5' },
  { id: 'facebook', name: 'Facebook', icon: 'f', color: '#1877f2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#e4405f' },
  { id: 'youtube', name: 'YouTube', icon: '▶', color: '#ff0000' },
];

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

export default function PostComposer({ isOpen, onClose, onSubmit }: PostComposerProps) {
  const { fetch: customFetch, apiUrl } = useLayout();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [media, setMedia] = useState<File[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [error, setError] = useState('');

  // LinkedIn posting via reusable hook
  const {
    postToLinkedIn, isPosting: postingToLI, result: liPostResult, message: liPostMsg,
  } = useLinkedInPost();
  const showLinkedInBtn = selectedPlatforms.includes('linkedin') && content.trim().length > 0;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleAiEnhance = async () => {
    if (!content.trim()) return;
    setIsEnhancing(true);
    setError('');
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `Improve this social media post to be more engaging, concise, and impactful. Keep it under 280 characters. Return only the improved post text, no explanations:\n\n${content}`,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
      const data = await res.json();
      setContent(data.response?.trim() || content);
    } catch (err: any) {
      setError(`AI enhance failed: ${err.message}. Make sure Ollama is running with llama3.2.`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async () => {
    if (!content || selectedPlatforms.length === 0) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await customFetch(apiUrl('/posts'), {
        method: 'POST',
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          scheduledAt: scheduledDate || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save post');
      const data = await res.json();
      if (onSubmit) {
        onSubmit({
          content,
          platforms: selectedPlatforms,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
          media,
        });
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setSelectedPlatforms([]);
    setMedia([]);
    setScheduledDate('');
    setError('');
    onClose();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(Array.from(e.target.files));
    }
  };

  return (
    <>
    <AIContentGenerator
      isOpen={isGeneratorOpen}
      onClose={() => setIsGeneratorOpen(false)}
      onUseContent={(generated) => {
        setContent(generated);
        setIsGeneratorOpen(false);
      }}
    />
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Post">
      <div className={styles.composer}>
        {/* Platform Selection */}
        <div className={styles.section}>
          <label className={styles.label}>Select Platforms</label>
          <div className={styles.platforms}>
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                className={`${styles.platformBtn} ${
                  selectedPlatforms.includes(platform.id) ? styles.active : ''
                }`}
                onClick={() => togglePlatform(platform.id)}
                style={{
                  borderColor: selectedPlatforms.includes(platform.id)
                    ? platform.color
                    : undefined,
                }}
              >
                <span className={styles.platformIcon}>{platform.icon}</span>
                <span className={styles.platformName}>{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className={styles.section}>
          <label className={styles.label}>Post Content</label>
          <textarea
            className={styles.textarea}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          <div className={styles.charCount}>
            {content.length} / 280 characters
          </div>
        </div>

        {/* Media Upload */}
        <div className={styles.section}>
          <label className={styles.label}>Media</label>
          <div className={styles.mediaUpload}>
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className={styles.fileInput}
            />
            <label htmlFor="media-upload" className={styles.uploadBtn}>
              <span>📎</span>
              <span>Add Photos or Videos</span>
            </label>
            {media.length > 0 && (
              <div className={styles.mediaPreview}>
                {media.map((file, index) => (
                  <div key={index} className={styles.mediaItem}>
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className={styles.section}>
          <label className={styles.label}>Schedule (Optional)</label>
          <input
            type="datetime-local"
            aria-label="Schedule date and time"
            className={styles.dateInput}
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {error && <div className={styles.error}>{error}</div>}
          {liPostMsg && (
            <div className={styles.error} style={
              liPostResult === 'success'
                ? { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }
                : undefined
            }>
              {liPostResult === 'success' ? '✅' : '⚠️'} {liPostMsg}
            </div>
          )}
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsGeneratorOpen(true)}
            disabled={isSubmitting || isEnhancing}
          >
            🚀 AI Generate
          </Button>
          <Button
            variant="ai"
            onClick={handleAiEnhance}
            isLoading={isEnhancing}
            disabled={isEnhancing || isSubmitting || !content.trim()}
          >
            ✨ AI Enhance
          </Button>
          {showLinkedInBtn && (
            <Button
              variant="primary"
              onClick={() => postToLinkedIn(content)}
              isLoading={postingToLI}
              disabled={postingToLI || liPostResult === 'success' || isSubmitting}
            >
              {liPostResult === 'success' ? '✓ Posted!' : '🚀 Post to LinkedIn'}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!content || selectedPlatforms.length === 0 || isSubmitting || isEnhancing}
          >
            {scheduledDate ? 'Schedule Post' : 'Post Now'}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
