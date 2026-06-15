export type YoutubeChannelSession = {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
};

export type YoutubeSession = {
  accessToken: string;
  expiresAt: number;
  channel: YoutubeChannelSession;
};

export const YOUTUBE_SESSION_KEY = 'ytb_google_session';

export function saveYoutubeSession(session: YoutubeSession) {
  sessionStorage.setItem(YOUTUBE_SESSION_KEY, JSON.stringify(session));
}

export function getYoutubeSession(): YoutubeSession | null {
  const raw = sessionStorage.getItem(YOUTUBE_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as YoutubeSession;
    if (!session.accessToken || !session.expiresAt || !session.channel?.id) {
      clearYoutubeSession();
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      clearYoutubeSession();
      return null;
    }

    return session;
  } catch {
    clearYoutubeSession();
    return null;
  }
}

export function clearYoutubeSession() {
  sessionStorage.removeItem(YOUTUBE_SESSION_KEY);
}
