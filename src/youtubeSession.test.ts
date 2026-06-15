// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearYoutubeSession, getYoutubeSession, saveYoutubeSession } from './youtubeSession';

const session = {
  accessToken: 'token-123',
  expiresAt: 1_900_000_000_000,
  channel: {
    id: 'UC123',
    title: 'Demo Channel',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    subscriberCount: 1200,
    viewCount: 3400,
    videoCount: 56,
  },
};

describe('youtube session storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('saves and reads a valid session from sessionStorage', () => {
    vi.setSystemTime(new Date('2026-06-16T00:00:00.000Z'));

    saveYoutubeSession(session);

    expect(getYoutubeSession()).toEqual(session);
  });

  it('clears expired session and returns null', () => {
    vi.setSystemTime(new Date('2026-06-16T00:00:00.000Z'));

    saveYoutubeSession({ ...session, expiresAt: Date.now() - 1000 });

    expect(getYoutubeSession()).toBeNull();
    expect(sessionStorage.getItem('ytb_google_session')).toBeNull();
  });

  it('clears stored session on disconnect', () => {
    saveYoutubeSession(session);

    clearYoutubeSession();

    expect(getYoutubeSession()).toBeNull();
  });
});

