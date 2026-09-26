import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Linking,
  useWindowDimensions,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { isInstructorAccount, useAuthStore } from '../../store/authStore';
import { AdminConsole } from '../../components/admin/AdminConsole';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { YoutubeVideo, YoutubeVideoCard } from '../../components/YoutubeVideoCard';
import { MeshHero } from '../../components/ui/MeshHero';
import { HomeSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ProgressGlance } from '../../components/ui/ProgressGlance';
import { useTabScreenBottomPadding } from '../../lib/safeArea';
import { MediaImage } from '../../components/MediaImage';
import { itemKey } from '../../utils/itemKey';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@awakeningclasses';
const RANK_STORY_URL = 'https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x';
const BANNER_ASPECT = 1024 / 535;
const H_PAD = 16;
const SECTION = 20;
const STACK = 8;

const FILTERS = [
  { id: 'all', label: 'All tests' },
  { id: 'free', label: 'Free' },
  { id: 'premium', label: 'Premium' },
  { id: 'new', label: 'New arrivals' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

async function openExternal(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  if (isInstructorAccount(user?.accountType)) {
    return <AdminConsole />;
  }
  return <StudentHomeScreen />;
}

function StudentHomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [featuredTests, setFeaturedTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState('');

  const bannerHeight = Math.round((screenWidth - H_PAD * 2) / BANNER_ASPECT);
  const heroCardWidth = Math.min(260, screenWidth * 0.72);
  const cardGap = 12;
  const tabClearance = useTabScreenBottomPadding();

  const fetchHomeData = useCallback(async () => {
    try {
      const [testsRes, attemptsRes, ranksRes] = await Promise.all([
        apiConnector.get(endpoints.GET_ALL_MOCK_TESTS),
        apiConnector
          .get(endpoints.GET_USER_ATTEMPTS, { params: { page: 1, limit: 6 } })
          .catch(() => null),
        apiConnector
          .get(endpoints.GET_RANKINGS, { params: { page: 1, limit: 5 } })
          .catch(() => null),
      ]);

      if (testsRes.data?.success) {
        const tests = testsRes.data.data
          .filter((t: any) => t.status !== 'draft')
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10);
        setFeaturedTests(tests);
      }

      if (attemptsRes?.data?.success) {
        setAttempts(attemptsRes.data.attempts || attemptsRes.data.data || []);
        setTotalAttempts(
          attemptsRes.data.user?.totalAttempts ??
            attemptsRes.data.pagination?.total ??
            (attemptsRes.data.attempts || []).length
        );
      }

      if (ranksRes?.data?.success) {
        setPersonalRank(ranksRes.data.loggedInUserRank?.[0] ?? null);
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    setVideosError('');
    try {
      const res = await apiConnector.get(endpoints.YOUTUBE_VIDEOS, {
        params: { limit: 8 },
      });

      if (!res.data?.success) {
        setVideos([]);
        setVideosError(res.data?.message || 'Could not load videos');
        return;
      }

      setVideos(res.data.videos || []);
      setVideosError('');
    } catch (error: any) {
      setVideos([]);
      setVideosError(error?.response?.data?.message || 'Could not load videos');
    } finally {
      setVideosLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
    loadVideos();
  }, [fetchHomeData, loadVideos]);

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return featuredTests.filter((t) => {
      const matchesQuery =
        !q ||
        String(t.seriesName || '')
          .toLowerCase()
          .includes(q) ||
        String(t.description || '')
          .toLowerCase()
          .includes(q);

      if (!matchesQuery) return false;

      if (activeFilter === 'free') return Number(t.price) === 0;
      if (activeFilter === 'premium') return Number(t.price) > 0;
      if (activeFilter === 'new') {
        const created = new Date(t.createdAt).getTime();
        return Date.now() - created < 1000 * 60 * 60 * 24 * 60;
      }
      return true;
    });
  }, [featuredTests, query, activeFilter]);

  const analytics = useMemo(() => {
    // API returns newest first — reverse for chronological chart
    const list = [...attempts].reverse();
    const chartData = list.map((a) => ({
      value: Number(a.score) || 0,
      max: Number(a.totalQuestions) || Number(a.totalScore) || 100,
    }));
    const scores = list
      .map((a) => {
        const max = Number(a.totalQuestions) || Number(a.totalScore) || 0;
        const score = Number(a.score) || 0;
        return max > 0 ? (score / max) * 100 : score;
      })
      .filter((n) => !Number.isNaN(n));

    return {
      chartData,
      testsTaken: totalAttempts,
      avgScore:
        scores.length > 0
          ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
          : 0,
    };
  }, [attempts, totalAttempts]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Student';

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabClearance },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchHomeData();
              loadVideos();
            }}
            tintColor={colors.refreshTint}
          />
        }
      >
        {isLoading ? (
          <View style={{ paddingTop: Math.max(insets.top, 8) + 6, paddingHorizontal: H_PAD }}>
            <HomeSkeleton bannerHeight={bannerHeight} />
          </View>
        ) : (
          <>
            <MeshHero
              fadeTo={colors.background}
              style={{
                paddingTop: Math.max(insets.top, 8) + 6,
                paddingBottom: 12,
              }}
            >
              <View style={styles.header}>
                <Pressable
                  onPress={() => router.push('/(tabs)/profile')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  style={({ pressed }) => [styles.headerLeft, pressed && { opacity: 0.88 }]}
                >
                  <View style={styles.avatar}>
                    {user?.image ? (
                      <MediaImage uri={user.image} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarLetter}>{user?.firstName?.[0] || 'A'}</Text>
                    )}
                  </View>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/notifications')}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name="notifications-outline" size={22} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={colors.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search mock tests"
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  returnKeyType="search"
                  accessibilityLabel="Search mock tests"
                />
              </View>

              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chips}
              >
                {FILTERS.map((filter) => {
                  const active = activeFilter === filter.id;
                  return (
                    <Pressable
                      key={filter.id}
                      onPress={() => setActiveFilter(filter.id)}
                      style={({ pressed }) => [
                        styles.chip,
                        active && styles.chipActive,
                        pressed && { opacity: 0.9 },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </MeshHero>

            <View style={styles.section}>
              <View style={styles.sectionPad}>
                <SectionHeading
                  title="Mock tests"
                  compact
                  rightText="See all"
                  onPressRight={() => router.push('/(tabs)/mock-tests')}
                />
              </View>
              {filteredTests.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={heroCardWidth + cardGap}
                  snapToAlignment="start"
                  contentContainerStyle={styles.carousel}
                >
                  {filteredTests.map((test: any, index: number) => (
                    <MockTestCard
                      key={itemKey(test._id, index)}
                      test={test}
                      variant="hero"
                      heroWidth={heroCardWidth}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.sectionPad}>
                  <Text style={styles.empty}>No mock tests match your search.</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionPad}>
                <SectionHeading
                  title="Videos"
                  compact
                  rightText="See all"
                  onPressRight={() => router.push('/courses')}
                />
              </View>
              {videosLoading && videos.length === 0 ? (
                <View style={styles.sectionPad}>
                  <Text style={styles.empty}>Loading videos...</Text>
                </View>
              ) : videosError && videos.length === 0 ? (
                <View style={styles.sectionPad}>
                  <Text style={styles.empty}>{videosError}</Text>
                </View>
              ) : videos.length === 0 ? (
                <View style={styles.sectionPad}>
                  <Text style={styles.empty}>No videos yet.</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={heroCardWidth + cardGap}
                  snapToAlignment="start"
                  contentContainerStyle={styles.carousel}
                >
                  {videos.map((video) => (
                    <YoutubeVideoCard
                      key={video.id}
                      video={video}
                      variant="hero"
                      heroWidth={heroCardWidth}
                      onPress={() =>
                        router.push({
                          pathname: '/watch/[id]',
                          params: {
                            id: video.id,
                            title: video.title,
                            publishedAt: video.publishedAt || '',
                          },
                        })
                      }
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={[styles.section, styles.sectionPad]}>
              <SectionHeading
                title="Study material"
                compact
                rightText="Open"
                onPressRight={() => router.push('/study-material')}
              />
              <Pressable
                onPress={() => router.push('/study-material')}
                style={({ pressed }) => [
                  styles.studyCard,
                  { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.92 : 1 },
                ]}
              >
                <Ionicons name="document-text-outline" size={20} color={colors.text} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studyTitle}>Read papers in the app</Text>
                  <Text style={styles.studyCopy}>Free and paid material. Purchases stay on your profile.</Text>
                </View>
              </Pressable>
            </View>

            <View style={[styles.section, styles.sectionPad]}>
              <SectionHeading
                title="Progress"
                compact
                rightText="History"
                onPressRight={() => router.push('/(tabs)/my-tests')}
              />
              <ProgressGlance
                avgScore={analytics.avgScore}
                testsTaken={analytics.testsTaken}
                rank={personalRank?.rank ?? null}
                chartData={analytics.chartData}
              />
            </View>

            <View style={[styles.section, styles.sectionPad]}>
              <SectionHeading title="Spotlight" compact />
              <Pressable
                onPress={() => openExternal(RANK_STORY_URL)}
                style={({ pressed }) => [
                  styles.banner,
                  { height: bannerHeight, opacity: pressed ? 0.94 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open spotlight"
              >
                <Image
                  source={require('../../assets/images/rank1-banner.png')}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </Pressable>
              <Pressable
                onPress={() => openExternal(YOUTUBE_CHANNEL)}
                style={({ pressed }) => [styles.lectureRow, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel="Watch lectures"
              >
                <View style={styles.lectureIcon}>
                  <Ionicons name="logo-youtube" size={18} color={colors.text} />
                </View>
                <Text style={styles.lectureText}>Free lectures on YouTube</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
    },
    header: {
      paddingHorizontal: H_PAD,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 36,
      height: 36,
    },
    avatarLetter: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    userName: {
      flex: 1,
      fontSize: 17,
      lineHeight: 22,
      color: colors.text,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.3,
    },
    bellBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar: {
      marginHorizontal: H_PAD,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 12,
      gap: 8,
      height: 40,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      paddingVertical: 0,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    chipsScroll: {
      flexGrow: 0,
      marginTop: 10,
    },
    chips: {
      paddingHorizontal: H_PAD,
      gap: 8,
      alignItems: 'center',
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      backgroundColor: colors.surfaceRaised,
      flexShrink: 0,
    },
    chipActive: {
      backgroundColor: colors.text,
    },
    chipText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.medium,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    chipTextActive: {
      color: colors.primaryButtonText,
      fontFamily: Fonts.semiBold,
    },
    studyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.lg,
      padding: 14,
    },
    studyTitle: {
      fontSize: 14,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    studyCopy: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    section: {
      paddingTop: SECTION,
      gap: STACK,
    },
    sectionPad: {
      paddingHorizontal: H_PAD,
    },
    carousel: {
      paddingHorizontal: H_PAD,
      gap: 12,
    },
    empty: {
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: 8,
    },
    banner: {
      width: '100%',
      borderRadius: Radii.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    lectureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: Radii.md,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    lectureIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceRaised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lectureText: {
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.text,
    },
  });
}
