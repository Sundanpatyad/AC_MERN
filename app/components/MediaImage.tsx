import React from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { resolveMediaUrl } from '../utils/mediaUrl';

type Props = Omit<ImageProps, 'source'> & {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
};

/**
 * Loads /api/v1/media images with Bearer token.
 * Native Image has no website Referer — without auth the API returns 403.
 */
export function MediaImage({ uri, style, ...rest }: Props) {
  const token = useAuthStore((s) => s.token);
  const resolved = resolveMediaUrl(uri);

  if (!resolved) return null;

  const needsAuth = resolved.includes('/api/v1/media/');
  const headers =
    needsAuth && token
      ? { Authorization: `Bearer ${String(token).replace(/^"|"$/g, '')}` }
      : undefined;

  return (
    <Image
      {...rest}
      source={headers ? { uri: resolved, headers } : { uri: resolved }}
      style={style}
    />
  );
}
