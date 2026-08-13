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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../../store/authStore';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { Card } from '../../components/ui/Card';
import { ScoreBarChart } from '../../components/ui/ScoreBarChart';
import { HomeSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { SectionHeading } from '../../components/ui/SectionHeading';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@awakeningclasses';
const RANK_STORY_URL = 'https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x';
const BANNER_ASPECT = 1024 / 535;
const H_PAD = 20;
const BLOCK_GAP = 20;
const SECTION_GAP = 12;

const FILTERS = [
  { id: 'all', label: 'All courses' },
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
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [featuredTests, setFeaturedTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const bannerHeight = Math.round((screenWidth - H_PAD * 2) / BANNER_ASPECT);
  const heroCardWidth = Math.min(320, screenWidth * 0.82);

  const fetchHomeData = useCallback(async () => {
    try {
      const [testsRes, attemptsRes, ranksRes] = await Promise.all([
        apiConnector.get(endpoints.GET_ALL_MOCK_TESTS),
        apiConnector.get(endpoints.GET_USER_ATTEMPTS).catch(() => null),
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

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

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
    const list = [...attempts].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const chartData = list.slice(-6).map((a, i) => ({
      label: `T${i + 1}`,
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
      testsTaken: attempts.length,
      avgScore:
        scores.length > 0
          ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
          : 0,
      bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : 0,
    };
  }, [attempts]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Student';

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            paddingBottom: 48,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchHomeData();
            }}
            tintColor={colors.refreshTint}
          />
        }
      >
        {isLoading ? (
          <HomeSkeleton bannerHeight={bannerHeight} />
        ) : (
          <>
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
                    <Image source={{ uri: user.image }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarLetter}>{user?.firstName?.[0] || 'A'}</Text>
                  )}
                </View>
                <View style={styles.greetingBlock}>
                  <Text style={styles.greetingLine}>Good to see you,</Text>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => router.push('/notifications')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.searchBar}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Find your next course"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                returnKeyType="search"
                accessibilityLabel="Search courses"
              />
              <Pressable
                onPress={() => router.push('/(tabs)/mock-tests')}
                style={({ pressed }) => [
                  styles.searchBtn,
                  pressed && { opacity: 0.88 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Browse all tests"
              >
                <Ionicons name="search" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
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

            <View style={styles.section}>
              <View style={styles.sectionPad}>
                <SectionHeading
                  title="Popular courses"
                  serif
                  rightText="See all"
                  onPressRight={() => router.push('/(tabs)/mock-tests')}
                />
              </View>

              {filteredTests.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={heroCardWidth + 14}
                  contentContainerStyle={styles.carousel}
                >
                  {filteredTests.map((test: any) => (
                    <MockTestCard
                      key={test._id}
                      test={test}
                      variant="hero"
                      heroWidth={heroCardWidth}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.sectionPad}>
                  <Text style={styles.empty}>No courses match your search.</Text>
                </View>
              )}
            </View>

            <View style={[styles.section, styles.sectionPad]}>
              <SectionHeading
                title="Your progress"
                serif
                rightText="History"
                onPressRight={() => router.push('/(tabs)/my-tests')}
              />
              <Card padding={14}>
                {analytics.chartData.length > 0 ? (
                  <>
                    <View style={styles.progressMeta}>
                      <Text style={styles.metaPill}>{analytics.testsTaken} attempts</Text>
                      <Text style={styles.metaPill}>Avg {analytics.avgScore}%</Text>
                      <Text style={styles.metaPill}>Best {analytics.bestScore}%</Text>
                    </View>
                    <ScoreBarChart data={analytics.chartData} height={112} />
                  </>
                ) : (
                  <Pressable
                    onPress={() => router.push('/(tabs)/mock-tests')}
                    style={({ pressed }) => [
                      styles.emptyRow,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <View style={styles.emptyIcon}>
                      <Ionicons name="bar-chart-outline" size={18} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyRowText}>
                      Take a test to unlock your score trend
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </Card>
            </View>

            <View style={[styles.section, styles.sectionPad]}>
              <SectionHeading
                title="Standing"
                serif
                rightText="Leaderboard"
                onPressRight={() => router.push('/(tabs)/rankings')}
              />
              <Pressable
                onPress={() => router.push('/(tabs)/rankings')}
                style={({ pressed }) => pressed && { opacity: 0.92 }}
              >
                <Card padding={12}>
                  <View style={styles.standing}>
                    <View style={styles.standingIcon}>
                      <Ionicons name="trophy-outline" size={18} color={colors.textSecondary} />
                    </View>
                    <View style={styles.standingCopy}>
                      <Text style={styles.standingTitle} numberOfLines={1}>
                        {personalRank?.rank != null
                          ? `Ranked #${personalRank.rank}`
                          : 'No rank yet'}
                      </Text>
                      <Text style={styles.standingSub} numberOfLines={1}>
                        {personalRank?.testName
                          ? `${personalRank.score}${
                              personalRank.totalQuestions
                                ? `/${personalRank.totalQuestions}`
                                : ''
                            } · ${personalRank.testName}`
                          : 'Appear on the board after your first attempt'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>
                </Card>
              </Pressable>
            </View>

            <View style={[styles.section, styles.sectionPad]}>
              <SectionHeading title="Spotlight" serif />
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
                style={({ pressed }) => [
                  styles.lectureRow,
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Watch lectures"
              >
                <Ionicons name="play-circle-outline" size={20} color={colors.text} />
                <Text style={styles.lectureText}>Watch free lectures on YouTube</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    content: {
      gap: BLOCK_GAP,
    },
    sectionPad: {
      paddingHorizontal: H_PAD,
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
      gap: 12,
      minWidth: 0,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: colors.surfaceRaised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 44,
      height: 44,
    },
    avatarLetter: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    greetingBlock: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    greetingLine: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    userName: {
      fontSize: 28,
      lineHeight: 34,
      color: colors.text,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.3,
    },
    bellBtn: {
      width: 42,
      height: 42,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar: {
      marginHorizontal: H_PAD,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceRaised,
      borderRadius: Radii.pill,
      paddingLeft: 18,
      paddingRight: 6,
      paddingVertical: 6,
      gap: 8,
      minHeight: 52,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      paddingVertical: 8,
    },
    searchBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chips: {
      paddingHorizontal: H_PAD,
      gap: 10,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: Radii.pill,
      backgroundColor: colors.surfaceRaised,
    },
    chipActive: {
      backgroundColor: colors.text,
    },
    chipText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    chipTextActive: {
      color: colors.primaryButtonText,
      fontWeight: '600',
    },
    section: {
      gap: SECTION_GAP,
    },
    carousel: {
      paddingHorizontal: H_PAD,
      gap: 14,
    },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: 12,
    },
    progressMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    metaPill: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      backgroundColor: colors.surfaceRaised,
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radii.pill,
    },
    emptyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 2,
    },
    emptyIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyRowText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    standing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    standingIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    standingCopy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    standingTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    standingSub: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    banner: {
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    lectureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 4,
    },
    lectureText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
  });
}
