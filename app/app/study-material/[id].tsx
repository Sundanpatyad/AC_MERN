import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { ZoomablePdfPages } from '../../components/ZoomablePdfPages';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { cachedPageUri, readCachedPageUris, saveCachedPage } from '../../services/pdfCache';
import { AppPalette, Fonts } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(bytes: Uint8Array) {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += B64[(triplet >> 18) & 63];
    result += B64[(triplet >> 12) & 63];
    result += i + 1 < bytes.length ? B64[(triplet >> 6) & 63] : '=';
    result += i + 2 < bytes.length ? B64[triplet & 63] : '=';
  }
  return result;
}

async function readError(error: any) {
  const data = error?.response?.data;
  if (data instanceof ArrayBuffer) {
    try {
      return JSON.parse(new TextDecoder().decode(data)).message;
    } catch {
      return null;
    }
  }
  return data?.message || error?.message || null;
}

export default function StudyReaderScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [pages, setPages] = useState<string[]>([]);
  const [status, setStatus] = useState('Loading material...');
  const [pageLabel, setPageLabel] = useState('');

  useEffect(() => {
    let active = true;
    const lock = async () => {
      try {
        const ScreenCapture = await import('expo-screen-capture');
        if (!(await ScreenCapture.isAvailableAsync()) || !active) return;
        await ScreenCapture.preventScreenCaptureAsync('study-pdf');
      } catch {
        // Native module is available after a rebuild
      }
    };
    lock();
    return () => {
      active = false;
      import('expo-screen-capture')
        .then((ScreenCapture) => ScreenCapture.allowScreenCaptureAsync('study-pdf'))
        .catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    const loadPage = async (ticket: string, revision: string, page: number) => {
      const cached = cachedPageUri(id, revision, page);
      if (cached) return cached;
      const response = await apiConnector.get(endpoints.PDF_PAGE(id, page), {
        headers: { 'X-AC-Viewer': ticket },
        responseType: 'arraybuffer',
        timeout: 60000,
      });
      const bytes = new Uint8Array(response.data);
      return saveCachedPage(id, revision, page, bytes) || `data:image/jpeg;base64,${toBase64(bytes)}`;
    };

    const open = async () => {
      const loaded: string[] = [];
      try {
        const ticketResponse = await apiConnector.post(endpoints.PDF_TICKET(id));
        const ticket = ticketResponse.data?.ticket;
        const revision = String(ticketResponse.data?.revision || '');
        if (!ticket) throw new Error('Could not open this material');

        if (revision) {
          const cached = readCachedPageUris(id, revision);
          if (cached.length) {
            cached.forEach((uri, index) => {
              loaded[index] = uri;
            });
            setPages(cached);
            setStatus('');
          }
        }

        if (!loaded.length) setStatus('Preparing pages...');
        const countResponse = await apiConnector.get(endpoints.PDF_PAGES(id), {
          headers: { 'X-AC-Viewer': ticket, 'Cache-Control': 'no-cache' },
          timeout: 90000,
        });
        const fileRevision = String(countResponse.data?.revision || revision);
        const reported = Number(countResponse.data?.pages);
        const remaining = Number.isFinite(reported) && reported > 0 ? reported : loaded.length;

        if (fileRevision && fileRevision !== revision) {
          const next = readCachedPageUris(id, fileRevision);
          if (next.length) {
            next.forEach((uri, index) => {
              loaded[index] = uri;
            });
            setPages(next);
            setStatus('');
          }
        }

        if (remaining > 0 && loaded.filter(Boolean).length >= remaining) {
          setPageLabel('');
          setStatus('');
          return;
        }

        const take = async (index: number) => {
          const uri = await loadPage(ticket, fileRevision || revision, index);
          if (cancelled) return;
          loaded[index - 1] = uri;
          const shown = loaded.filter(Boolean);
          setPages(shown);
          setStatus('');
          setPageLabel(remaining > 1 ? `${shown.length} / ${remaining}` : `${shown.length} pages`);
        };

        if (remaining > 1) {
          const batch = 3;
          for (let start = 1; start <= remaining; start += batch) {
            if (cancelled) return;
            await Promise.all(
              Array.from({ length: Math.min(batch, remaining - start + 1) }, (_, offset) => {
                const index = start + offset;
                if (loaded[index - 1]) return Promise.resolve();
                return take(index).catch((error: any) => {
                  if (error?.response?.status === 404) return;
                  throw error;
                });
              })
            );
          }
        } else {
          if (!loaded[0]) await take(1);
          let page = loaded.filter(Boolean).length + 1;
          while (!cancelled) {
            try {
              await take(page);
              page += 1;
            } catch (error: any) {
              if (error?.response?.status === 404) break;
              throw error;
            }
          }
        }

        if (cancelled) return;
        if (!loaded.filter(Boolean).length) {
          setPages([endpoints.PDF_PREVIEW(id)]);
        }
        setPageLabel('');
        setStatus('');
      } catch (error: any) {
        if (cancelled) return;
        if (loaded.filter(Boolean).length) {
          setStatus('');
          setPageLabel('');
          return;
        }
        if (error?.response?.status === 404) {
          setPages([endpoints.PDF_PREVIEW(id)]);
          setStatus('');
          return;
        }
        setStatus((await readError(error)) || 'Could not open this material');
      }
    };

    open();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <ScreenBackground>
      <View style={[styles.bar, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backText}>Study material</Text>
        </Pressable>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pageLabel || 'View only'}</Text>
        </View>
      </View>

      {pages.length === 0 ? (
        <View style={styles.center}>
          {status ? <ActivityIndicator color={colors.text} /> : null}
          <Text style={styles.status}>{status}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ZoomablePdfPages pages={pages} width={width} />
          <View pointerEvents="none" style={styles.watermark}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Text key={index} style={styles.mark}>Awakening Classes</Text>
            ))}
          </View>
        </View>
      )}
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backText: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.text,
    },
    pill: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    pillText: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 24,
    },
    status: {
      color: colors.text,
      fontFamily: Fonts.sans,
      textAlign: 'center',
    },
    watermark: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignContent: 'space-around',
      justifyContent: 'space-around',
      padding: 24,
      opacity: 0.18,
    },
    mark: {
      color: colors.text,
      fontFamily: Fonts.medium,
      fontSize: 14,
      transform: [{ rotate: '-18deg' }],
    },
  });
}
