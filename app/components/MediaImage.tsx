import React, { useMemo } from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import { Image, ImageContentFit, ImageProps } from 'expo-image';
import { useAuthStore } from '../store/authStore';
import { resolveMediaUrl } from '../utils/mediaUrl';

type Props = Omit<ImageProps, 'source' | 'style'> & {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  /** RN Image compat — mapped to expo-image contentFit */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
};

function toContentFit(mode?: Props['resizeMode']): ImageContentFit | undefined {
  if (!mode) return undefined;
  if (mode === 'stretch') return 'fill';
  if (mode === 'repeat') return 'none';
  if (mode === 'center') return 'contain';
  return mode;
}

/**
 * Fast media load: prefers direct R2 URLs from the API; falls back to /api/v1/media
 * with Bearer only when needed. Disk+memory cache via expo-image.
 */
export function MediaImage({ uri, style, resizeMode, contentFit, ...rest }: Props) {
  const token = useAuthStore((s) => s.token);
  const resolved = resolveMediaUrl(uri);

  const source = useMemo(() => {
    if (!resolved) return null;
    const isApiMedia = resolved.includes('/api/v1/media/');
    const hasSig = /[?&]sig=/.test(resolved);
    // Direct R2 / CDN / signed API URLs — no Authorization (lets 302→R2 work)
    if (!isApiMedia || hasSig) {
      return { uri: resolved };
    }
    if (!token) return { uri: resolved };
    const cleaned = String(token).replace(/^"|"$/g, '');
    return cleaned
      ? { uri: resolved, headers: { Authorization: `Bearer ${cleaned}` } }
      : { uri: resolved };
  }, [resolved, token]);

  if (!source) return null;

  return (
    <Image
      {...rest}
      source={source}
      style={style}
      contentFit={contentFit ?? toContentFit(resizeMode) ?? 'cover'}
      cachePolicy="memory-disk"
      recyclingKey={resolved || undefined}
      transition={120}
    />
  );
}
