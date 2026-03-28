// ── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
}

export interface Subscription {
  tier: 'free' | 'pro' | 'business' | 'enterprise' | 'lifetime';
  status: 'active' | 'trialing' | 'canceled' | 'expired';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
}

// ── Platform ─────────────────────────────────────────────────────────────────
export type PlatformId = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'google';

export interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  provider: string;
  description: string;
  maxChars?: number;
  supportsVideo: boolean;
  supportsImages: boolean;
}

export interface ConnectedAccount {
  provider: PlatformId;
  name: string;
  connectedAt: number;
  accessToken?: string;
}

// ── Post ─────────────────────────────────────────────────────────────────────
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string;       // always present — defaults to now if not scheduled
  status: PostStatus;
  mediaUrls?: string[];
  hashtags?: string[];
  timezone?: string;
  createdAt?: string;
  linkedInQueued?: boolean;  // true = auto-post to LinkedIn when scheduledAt arrives
}

export interface CreatePostPayload {
  content: string;
  platforms: string[];
  scheduledAt?: string;
  mediaUrls?: string[];
  hashtags?: string[];
  timezone?: string;
}

// ── Integration ───────────────────────────────────────────────────────────────
export interface Integration {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  enabled: boolean;
  configUrl?: string;
}

// ── Media ─────────────────────────────────────────────────────────────────────
export type MediaType = 'image' | 'video' | 'document';

export interface MediaFile {
  id: string;
  name: string;
  size: string;
  type: MediaType;
  url: string;
  date: string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface AnalyticsStat {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}
