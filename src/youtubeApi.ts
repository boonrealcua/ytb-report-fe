import type { YoutubeChannelSession } from './youtubeSession';

type YoutubeChannelApiResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
        high?: { url?: string };
      };
    };
    statistics?: {
      subscriberCount?: string;
      viewCount?: string;
      videoCount?: string;
    };
  }>;
};

function toNumber(value: string | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapYoutubeChannelResponse(response: YoutubeChannelApiResponse): YoutubeChannelSession {
  const channel = response.items?.[0];
  if (!channel?.id) {
    throw new Error('No YouTube channel found for this Google account.');
  }

  return {
    id: channel.id,
    title: channel.snippet?.title ?? 'Untitled channel',
    thumbnailUrl: channel.snippet?.thumbnails?.high?.url ?? channel.snippet?.thumbnails?.medium?.url ?? channel.snippet?.thumbnails?.default?.url ?? '',
    subscriberCount: toNumber(channel.statistics?.subscriberCount),
    viewCount: toNumber(channel.statistics?.viewCount),
    videoCount: toNumber(channel.statistics?.videoCount),
  };
}

export async function fetchConnectedYoutubeChannel(accessToken: string): Promise<YoutubeChannelSession> {
  const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch YouTube channel.');
  }

  return mapYoutubeChannelResponse(await response.json());
}
