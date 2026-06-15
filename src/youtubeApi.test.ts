import { describe, expect, it } from 'vitest';
import { mapYoutubeChannelResponse } from './youtubeApi';

describe('youtube api mapping', () => {
  it('maps YouTube channel API response to client channel session', () => {
    const mapped = mapYoutubeChannelResponse({
      items: [
        {
          id: 'UC123',
          snippet: {
            title: 'Demo Channel',
            thumbnails: {
              default: { url: 'https://example.com/default.jpg' },
              high: { url: 'https://example.com/high.jpg' },
            },
          },
          statistics: {
            subscriberCount: '1200',
            viewCount: '3400',
            videoCount: '56',
          },
        },
      ],
    });

    expect(mapped).toEqual({
      id: 'UC123',
      title: 'Demo Channel',
      thumbnailUrl: 'https://example.com/high.jpg',
      subscriberCount: 1200,
      viewCount: 3400,
      videoCount: 56,
    });
  });

  it('throws when Google account has no YouTube channel', () => {
    expect(() => mapYoutubeChannelResponse({ items: [] })).toThrow('No YouTube channel found for this Google account.');
  });
});
