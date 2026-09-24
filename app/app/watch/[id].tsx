import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Share,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { useMiniPlayer } from '../../components/MiniPlayer';
import { YoutubeVideo, YoutubeVideoCard, formatVideoDate } from '../../components/YoutubeVideoCard';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { AppPalette, Fonts } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { useNativeBottomInset } from '../../lib/safeArea';
import { showMessage } from '../../providers/DialogProvider';
import {
  postVideoComment,
  readYoutubeEngagement,
  readYoutubeEngagementIfAllowed,
  setChannelSubscribed,
  setVideoLiked,
  YoutubeActionError,
} from '../../services/youtubeActions';

type CommentItem = { id: string; author: string; text: string };

const CHANNEL_ID = 'UCbCecAHnHvT1TZW6cwmCQug';
const CHANNEL_AVATAR =
  'https://yt3.ggpht.com/QXlMeCq6qyRC9VoXLPKt8E28jCgtHrmgJ3CwMBzW0b6FNHQay0d6_wp0FCrrvJ2fvYVT5l9WMRk=s800-c-k-c0x00ffffff-no-rj';

export default function WatchScreen() {
  const router = useRouter();
  const { setVideo, dismissIfExpanded } = useMiniPlayer();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = useNativeBottomInset();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id: string; title?: string; publishedAt?: string }>();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [related, setRelated] = useState<YoutubeVideo[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [channelId, setChannelId] = useState(CHANNEL_ID);
  const [channelAvatar, setChannelAvatar] = useState(CHANNEL_AVATAR);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [busy, setBusy] = useState<'like' | 'subscribe' | 'comment' | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [draft, setDraft] = useState('');

  const videoId = String(params.id || '');
  const title = typeof params.title === 'string' ? params.title : '';

  useEffect(() => {
    if (!videoId) return;
    setVideo({
      id: videoId,
      title,
      publishedAt: typeof params.publishedAt === 'string' ? params.publishedAt : '',
    });
    return () => dismissIfExpanded();
  }, [videoId, title, params.publishedAt, setVideo, dismissIfExpanded]);
  const dateLabel = formatVideoDate(typeof params.publishedAt === 'string' ? params.publishedAt : null);
  const playerHeight = Math.round(width * (9 / 16));

  const shareUrl = videoId ? `https://youtu.be/${videoId}` : '';

  const shareVideo = useCallback(
    async (payload?: { title?: string; text?: string; url?: string }) => {
      const message = [payload?.text || title, payload?.url || shareUrl].filter(Boolean).join('\n');
      if (!message) return;
      try {
        await Share.share({
          title: payload?.title || title || 'Awakening Classes',
          message,
        });
      } catch {
        // user dismissed the sheet
      }
    },
    [shareUrl, title]
  );

  const openVideo = useCallback(
    (video: YoutubeVideo) => {
      router.push({
        pathname: '/watch/[id]',
        params: {
          id: video.id,
          title: video.title,
          publishedAt: video.publishedAt || '',
        },
      });
    },
    [router]
  );

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setRelatedLoading(true);

    apiConnector
      .get(endpoints.YOUTUBE_VIDEOS, { params: { limit: 8 } })
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const videos: YoutubeVideo[] = res.data.videos || [];
        setChannelId(String(res.data.channelId || CHANNEL_ID));
        if (res.data.channelAvatar) setChannelAvatar(String(res.data.channelAvatar));
        setRelated(videos.filter((video) => video.id !== videoId));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (!videoId || !channelId) return;
    let cancelled = false;
    readYoutubeEngagementIfAllowed(videoId, channelId)
      .then((status) => {
        if (cancelled || !status) return;
        setLiked(status.liked);
        setSubscribed(status.subscribed);
        setSubscriptionId(status.subscriptionId);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [videoId, channelId]);

  const reportActionError = (error: unknown) => {
    if (error instanceof YoutubeActionError && error.cancelled) return;
    const message = error instanceof Error ? error.message : 'Could not update YouTube';
    showMessage({ title: 'YouTube', message, tone: 'danger' });
  };

  const refreshEngagement = useCallback(async () => {
    if (!videoId) return;
    const status = await readYoutubeEngagement(videoId, channelId);
    setLiked(status.liked);
    setSubscribed(status.subscribed);
    setSubscriptionId(status.subscriptionId);
  }, [channelId, videoId]);

  const toggleLike = async () => {
    if (!videoId || busy) return;
    setBusy('like');
    try {
      await setVideoLiked(videoId, !liked);
      setLiked((current) => !current);
      await refreshEngagement().catch(() => undefined);
    } catch (error) {
      reportActionError(error);
    } finally {
      setBusy(null);
    }
  };

  const toggleSubscribe = async () => {
    if (!channelId || busy) return;
    setBusy('subscribe');
    try {
      const nextId = await setChannelSubscribed(channelId, subscribed ? subscriptionId : null);
      setSubscribed(!subscribed);
      setSubscriptionId(nextId);
    } catch (error) {
      reportActionError(error);
    } finally {
      setBusy(null);
    }
  };

  const loadComments = useCallback(async () => {
    if (!videoId) return;
    setCommentsLoading(true);
    try {
      const response = await apiConnector.get(endpoints.YOUTUBE_VIDEO(videoId));
      const next = response.data?.comments || [];
      setComments(
        next.map((item: CommentItem) => ({
          id: item.id,
          author: item.author,
          text: item.text,
        }))
      );
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [videoId]);

  const openComments = () => {
    setCommentsOpen((open) => !open);
    if (!commentsOpen && comments.length === 0) loadComments();
  };

  const sendComment = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy('comment');
    try {
      const created = await postVideoComment(videoId, text);
      setComments((current) => [created, ...current]);
      setDraft('');
    } catch (error) {
      reportActionError(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenBackground>
      <View style={[styles.playerWrap, { height: playerHeight, marginTop: insets.top }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomInset + 28 }}
        style={styles.feed}
      >
        <View style={styles.copy}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.meta}>{dateLabel || 'Awakening Classes'}</Text>

          <View style={styles.channelRow}>
            <Image source={{ uri: channelAvatar }} style={styles.avatar} />
            <View style={styles.channelCopy}>
              <Text style={styles.channelName} numberOfLines={1}>Awakening Classes</Text>
            </View>
            <Pressable
              onPress={toggleSubscribe}
              disabled={busy === 'subscribe'}
              accessibilityRole="button"
              accessibilityLabel={subscribed ? 'Unsubscribe' : 'Subscribe'}
              style={[styles.subscribe, subscribed && styles.subscribeOn]}
            >
              <Text style={[styles.subscribeText, subscribed && { color: colors.text }]}>
                {busy === 'subscribe' ? '…' : subscribed ? 'Subscribed' : 'Subscribe'}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actions}
          >
            <Pressable
              onPress={toggleLike}
              disabled={busy === 'like'}
              accessibilityRole="button"
              accessibilityLabel={liked ? 'Unlike video' : 'Like video'}
              style={[styles.action, liked && styles.actionOn]}
            >
              <Ionicons name={liked ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={colors.text} />
              <Text style={styles.actionText}>{busy === 'like' ? '…' : 'Like'}</Text>
            </Pressable>
            <Pressable
              onPress={openComments}
              accessibilityRole="button"
              accessibilityLabel="Comment"
              style={[styles.action, commentsOpen && styles.actionOn]}
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
              <Text style={styles.actionText}>Comment</Text>
            </Pressable>
            <Pressable
              onPress={() => shareVideo()}
              accessibilityRole="button"
              accessibilityLabel="Share video"
              style={styles.action}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.text} />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>
          </ScrollView>
          {commentsOpen ? (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.composer}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Write a comment"
                  placeholderTextColor={colors.textMuted}
                  style={styles.commentInput}
                  multiline
                />
                <Pressable
                  onPress={sendComment}
                  disabled={!draft.trim() || busy === 'comment'}
                  style={[styles.postBtn, (!draft.trim() || busy === 'comment') && { opacity: 0.5 }]}
                >
                  <Text style={styles.postText}>{busy === 'comment' ? '…' : 'Post'}</Text>
                </Pressable>
              </View>
              {commentsLoading ? (
                <ActivityIndicator color={colors.text} style={styles.loader} />
              ) : comments.length === 0 ? (
                <Text style={styles.empty}>No comments yet.</Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.comment}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))
              )}
            </KeyboardAvoidingView>
          ) : null}
        </View>

        <View style={styles.section}>
          {relatedLoading ? (
            <ActivityIndicator color={colors.text} style={styles.loader} />
          ) : related.length === 0 ? (
            <Text style={styles.empty}>No other videos yet.</Text>
          ) : (
            <View style={styles.relatedList}>
              {related.map((video) => (
                <YoutubeVideoCard key={video.id} video={video} onPress={() => openVideo(video)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    backBtn: {
      position: 'absolute',
      top: 8,
      left: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    playerWrap: {
      width: '100%',
      backgroundColor: '#000000',
      zIndex: 2,
    },
    feed: {
      flex: 1,
    },
    copy: {
      paddingHorizontal: 16,
      paddingTop: 14,
      gap: 8,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      lineHeight: 22,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.3,
    },
    meta: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.sans,
    },
    channelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceRaised,
    },
    channelCopy: {
      flex: 1,
      minWidth: 0,
    },
    channelName: {
      color: colors.text,
      fontFamily: Fonts.semiBold,
      fontSize: 14,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingRight: 8,
      marginTop: 4,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 36,
      paddingHorizontal: 12,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    actionOn: {
      backgroundColor: colors.surfaceRaised,
    },
    subscribe: {
      height: 34,
      paddingHorizontal: 14,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.text,
    },
    subscribeOn: {
      backgroundColor: colors.surfaceRaised,
    },
    subscribeText: {
      color: colors.primaryButtonText,
      fontSize: 13,
      lineHeight: 16,
      fontFamily: Fonts.semiBold,
    },
    actionText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 16,
      fontFamily: Fonts.semiBold,
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginTop: 4,
    },
    commentInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 96,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: Fonts.sans,
      fontSize: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    postBtn: {
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.text,
    },
    postText: {
      color: colors.primaryButtonText,
      fontFamily: Fonts.semiBold,
      fontSize: 13,
    },
    comment: {
      gap: 2,
      paddingTop: 10,
    },
    commentAuthor: {
      color: colors.text,
      fontFamily: Fonts.semiBold,
      fontSize: 13,
    },
    commentText: {
      color: colors.textSecondary,
      fontFamily: Fonts.sans,
      fontSize: 13,
      lineHeight: 18,
    },
    section: {
      paddingTop: 18,
      gap: 14,
    },
    relatedList: {
      gap: 18,
      paddingHorizontal: 16,
    },
    loader: {
      paddingVertical: 12,
    },
    empty: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: Fonts.sans,
    },
  });
}
