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
} from 'react-native';
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
import { BrandLogo } from '../../components/ui/BrandLogo';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { SectionHeading } from '../../components/ui/SectionHeading';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@awakeningclasses';
const RANK_STORY_URL = 'https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x';
const BANNER_ASPECT = 1024 / 535;
const H_PAD = 20;

async function openExternal(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width: screenWidth } = useWindowDimensions();
  const [featuredTests, setFeaturedTests] = useState([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const contentWidth = screenWidth - H_PAD * 2;
  const bannerHeight = Math.round(contentWidth / BANNER_ASPECT);

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
          .slice(0, 5);
        setFeaturedTests(tests);
      }

      if (attemptsRes?.data?.success) {
        setAttempts(attemptsRes.data.attempts || attemptsRes.data.data || []);
      }

      if (ranksRes?.data?.success) {
        if (ranksRes.data.loggedInUserRank?.length) {
          setPersonalRank(ranksRes.data.loggedInUserRank[0]);
        } else {
          setPersonalRank(null);
        }
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const analytics = useMemo(() => {
    const list = [...attempts].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const recent = list.slice(-6);
    const chartData = recent.map((a, i) => ({
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

    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
        : 0;
    const best = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;

    return {
      chartData,
      testsTaken: attempts.length,
      avgScore: avg,
      bestScore: best,
    };
  }, [attempts]);

  const greeting = `${greetingForHour(new Date().getHours())}, ${user?.firstName || 'there'}`;

  const quickActions: QuickAction[] = [
    {
      key: 'tests',
      label: 'Browse tests',
      icon: 'library-outline',
      onPress: () => router.push('/(tabs)/mock-tests'),
    },
    {
      key: 'mine',
      label: 'My tests',
      icon: 'document-text-outline',
      onPress: () => router.push('/(tabs)/my-tests'),
    },
    {
      key: 'rank',
      label: 'Rankings',
      icon: 'trophy-outline',
      onPress: () => router.push('/(tabs)/rankings'),
    },
    {
      key: 'lectures',
      label: 'Lectures',
      icon: 'play-circle-outline',
      onPress: () => openExternal(YOUTUBE_CHANNEL),
    },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.refreshTint}
          />
        }
      >
        {isLoading ? (
          <HomeSkeleton bannerHeight={bannerHeight} />
        ) : (
          <>
            <View style={styles.appBar}>
              <View style={styles.brandRow}>
                <BrandLogo size={26} />
                <Text style={styles.brand}>Awakening Classes</Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                hitSlop={8}
                style={({ pressed }) => [styles.avatarHit, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.avatar}>
                  {user?.image ? (
                    <Image source={{ uri: user.image }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{user?.firstName?.[0]}</Text>
                  )}
                </View>
              </Pressable>
            </View>

            <View style={styles.welcome}>
              <Text style={styles.greeting} numberOfLines={1}>
                {greeting}
              </Text>
              <Text style={styles.subtitle}>Pick up where you left off</Text>
            </View>

            <Card style={styles.snapshotCard} padding={14}>
              <View style={styles.snapshotRow}>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{analytics.testsTaken}</Text>
                  <Text style={styles.snapshotLabel}>Attempts</Text>
                </View>
                <View style={styles.snapshotDivider} />
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{analytics.avgScore}%</Text>
                  <Text style={styles.snapshotLabel}>Avg score</Text>
                </View>
                <View style={styles.snapshotDivider} />
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>
                    {personalRank?.rank != null ? `#${personalRank.rank}` : '—'}
                  </Text>
                  <Text style={styles.snapshotLabel}>Rank</Text>
                </View>
                <View style={styles.snapshotDivider} />
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{analytics.bestScore}%</Text>
                  <Text style={styles.snapshotLabel}>Best</Text>
                </View>
              </View>
            </Card>

            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.key}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.quickActionWrap,
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <View style={styles.quickAction}>
                    <View style={styles.quickIcon}>
                      <Ionicons name={action.icon} size={18} color={colors.text} />
                    </View>
                    <Text style={styles.quickLabel} numberOfLines={1}>
                      {action.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <SectionHeading
              title="Featured tests"
              rightText="See all"
              onPressRight={() => router.push('/(tabs)/mock-tests')}
              style={styles.sectionHeader}
            />
            <View style={styles.testsList}>
              {featuredTests.length > 0 ? (
                featuredTests.map((test: any) => (
                  <MockTestCard key={test._id} test={test} />
                ))
              ) : (
                <Text style={styles.emptyText}>No tests available right now.</Text>
              )}
            </View>

            <SectionHeading
              title="Your progress"
              rightText="History"
              onPressRight={() => router.push('/(tabs)/my-tests')}
              style={styles.sectionHeader}
            />
            <Card style={styles.progressCard} padding={16}>
              {analytics.chartData.length > 0 ? (
                <>
                  <Text style={styles.chartTitle}>Recent scores</Text>
                  <ScoreBarChart data={analytics.chartData} height={132} />
                </>
              ) : (
                <View style={styles.emptyProgress}>
                  <Ionicons name="bar-chart-outline" size={22} color={colors.textMuted} />
                  <Text style={styles.emptyProgressText}>
                    Complete a mock test to see your score trend here.
                  </Text>
                </View>
              )}
            </Card>

            <SectionHeading
              title="Standing"
              rightText="Leaderboard"
              onPressRight={() => router.push('/(tabs)/rankings')}
              style={styles.sectionHeader}
            />
            <Pressable
              onPress={() => router.push('/(tabs)/rankings')}
              style={({ pressed }) => [pressed && { opacity: 0.92 }]}
            >
              <Card style={styles.standingCard} padding={14}>
                <View style={styles.standingRow}>
                  <View style={styles.standingIcon}>
                    <Ionicons name="trophy-outline" size={18} color={colors.textSecondary} />
                  </View>
                  <View style={styles.standingCopy}>
                    <Text style={styles.standingTitle}>
                      {personalRank?.rank != null
                        ? `You're ranked #${personalRank.rank}`
                        : 'No rank yet'}
                    </Text>
                    <Text style={styles.standingSub} numberOfLines={1}>
                      {personalRank?.testName
                        ? `${personalRank.score}${
                            personalRank.totalQuestions
                              ? ` / ${personalRank.totalQuestions}`
                              : ''
                          } · ${personalRank.testName}`
                        : 'Take a mock test to appear on the leaderboard'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </Card>
            </Pressable>

            <SectionHeading title="Spotlight" style={styles.sectionHeader} />
            <Pressable
              onPress={() => openExternal(RANK_STORY_URL)}
              style={({ pressed }) => [
                styles.heroBanner,
                {
                  width: contentWidth,
                  height: bannerHeight,
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <Image
                source={require('../../assets/images/rank1-banner.png')}
                style={{ width: contentWidth, height: bannerHeight }}
                resizeMode="cover"
              />
            </Pressable>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    scrollContent: {
      paddingTop: 58,
      paddingBottom: 40,
    },
    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: H_PAD,
      marginBottom: 18,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      paddingRight: 12,
    },
    brand: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    avatarHit: {
      padding: 2,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: colors.surfaceRaised,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderStrong,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 32,
      height: 32,
      borderRadius: 999,
    },
    avatarText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    welcome: {
      paddingHorizontal: H_PAD,
      marginBottom: 16,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    snapshotCard: {
      marginHorizontal: H_PAD,
      marginBottom: 14,
    },
    snapshotRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    snapshotItem: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    snapshotValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    snapshotLabel: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    snapshotDivider: {
      width: StyleSheet.hairlineWidth,
      height: 28,
      backgroundColor: colors.borderStrong,
    },
    quickGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: H_PAD - 4,
      marginBottom: 4,
    },
    quickActionWrap: {
      width: '50%',
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radii.md,
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    quickIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    sectionHeader: {
      marginTop: 18,
      marginBottom: 12,
      paddingHorizontal: H_PAD,
    },
    testsList: {
      gap: 4,
      paddingHorizontal: H_PAD,
    },
    progressCard: {
      marginHorizontal: H_PAD,
    },
    chartTitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    emptyProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    emptyProgressText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    standingCard: {
      marginHorizontal: H_PAD,
    },
    standingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    standingIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    standingCopy: {
      flex: 1,
      minWidth: 0,
    },
    standingTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    standingSub: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    heroBanner: {
      alignSelf: 'center',
      backgroundColor: colors.surfaceRaised,
      overflow: 'hidden',
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
      fontSize: 13,
    },
  });
}
