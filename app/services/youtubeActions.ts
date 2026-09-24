import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../constants/google';

GoogleSignin.configure({
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  ...(Platform.OS === 'android' ? { webClientId: GOOGLE_WEB_CLIENT_ID } : {}),
  offlineAccess: false,
  scopes: ['profile', 'email', 'openid'],
});

const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

export class YoutubeActionError extends Error {
  cancelled = false;

  constructor(message: string, cancelled = false) {
    super(message);
    this.cancelled = cancelled;
  }
}

let youtubeAccessReady = false;

function hasYoutubeScope() {
  if (youtubeAccessReady) return true;
  const user = GoogleSignin.getCurrentUser() as { scopes?: string[]; data?: { scopes?: string[] } } | null;
  const scopes = user?.scopes || user?.data?.scopes || [];
  return scopes.some((scope) => scope.includes('youtube'));
}

async function youtubeToken() {
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  if (!GoogleSignin.getCurrentUser()) {
    const signIn = await GoogleSignin.signIn();
    if (signIn?.type === 'cancelled') {
      throw new YoutubeActionError('Cancelled', true);
    }
  }

  if (!hasYoutubeScope()) {
    const granted = await GoogleSignin.addScopes({ scopes: [YOUTUBE_SCOPE] });
    if ((granted as { type?: string })?.type === 'cancelled') {
      throw new YoutubeActionError('Cancelled', true);
    }
  }

  const tokens = await GoogleSignin.getTokens();
  if (!tokens?.accessToken) {
    throw new YoutubeActionError('Google did not return a YouTube token');
  }
  youtubeAccessReady = true;
  return tokens.accessToken;
}

async function savedYoutubeToken() {
  if (!GoogleSignin.getCurrentUser()) return null;
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens?.accessToken || null;
  } catch {
    return null;
  }
}

async function youtubeFetch(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 204) return {};
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data?.error?.errors?.[0]?.reason || '';
    const message = data?.error?.message || 'YouTube request failed';
    if (response.status === 403 && /accessNotConfigured|forbidden|insufficient/i.test(`${reason} ${message}`)) {
      throw new YoutubeActionError(
        'Google blocked YouTube access. Add youtube.force-ssl on the consent screen and add this account as a test user.'
      );
    }
    throw new YoutubeActionError(message);
  }
  return data;
}

async function readEngagement(token: string, videoId: string, channelId: string) {
  const [rating, subscription] = await Promise.all([
    youtubeFetch(`videos/getRating?id=${encodeURIComponent(videoId)}`, token),
    channelId
      ? youtubeFetch(
          `subscriptions?part=id&mine=true&forChannelId=${encodeURIComponent(channelId)}`,
          token
        )
      : Promise.resolve({ items: [] }),
  ]);
  const liked = rating?.items?.[0]?.rating === 'like';
  const subscriptionId = subscription?.items?.[0]?.id || '';
  return { liked, subscribed: Boolean(subscriptionId), subscriptionId };
}

export async function readYoutubeEngagement(videoId: string, channelId: string) {
  const token = await youtubeToken();
  return readEngagement(token, videoId, channelId);
}

export async function readYoutubeEngagementIfAllowed(videoId: string, channelId: string) {
  const token = await savedYoutubeToken();
  if (!token || !channelId) return null;
  try {
    const status = await readEngagement(token, videoId, channelId);
    youtubeAccessReady = true;
    return status;
  } catch {
    return null;
  }
}

export async function setVideoLiked(videoId: string, liked: boolean) {
  const token = await youtubeToken();
  await youtubeFetch(
    `videos/rate?id=${encodeURIComponent(videoId)}&rating=${liked ? 'like' : 'none'}`,
    token,
    { method: 'POST' }
  );
}

export function youtubeScopeGranted() {
  return Boolean(GoogleSignin.getCurrentUser()) && hasYoutubeScope();
}

export async function setChannelSubscribed(channelId: string, subscriptionId: string | null) {
  const token = await youtubeToken();
  if (subscriptionId) {
    await youtubeFetch(`subscriptions?id=${encodeURIComponent(subscriptionId)}`, token, { method: 'DELETE' });
    return '';
  }
  try {
    const created = await youtubeFetch('subscriptions?part=snippet', token, {
      method: 'POST',
      body: JSON.stringify({
        snippet: {
          resourceId: { kind: 'youtube#channel', channelId },
        },
      }),
    });
    return String(created?.id || '');
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/duplicate|already/i.test(message)) throw error;
    const existing = await youtubeFetch(
      `subscriptions?part=id&mine=true&forChannelId=${encodeURIComponent(channelId)}`,
      token
    );
    return String(existing?.items?.[0]?.id || '');
  }
}

export async function postVideoComment(videoId: string, text: string) {
  const token = await youtubeToken();
  const created = await youtubeFetch('commentThreads?part=snippet', token, {
    method: 'POST',
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: { snippet: { textOriginal: text } },
      },
    }),
  });
  const snippet = created?.snippet?.topLevelComment?.snippet;
  return {
    id: String(created?.id || created?.snippet?.topLevelComment?.id || Date.now()),
    author: snippet?.authorDisplayName || 'You',
    text: snippet?.textDisplay || text,
  };
}
