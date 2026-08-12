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
import { BrandLogo } from '../../components/ui/BrandLogo';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { SectionHeading } from '../../components/ui/SectionHeading';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@awakeningclasses';
const RANK_STORY_URL = 'https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x';
const BANNER_ASPECT = 1024 / 535;
const H_PAD = 20;
const BLOCK_GAP = 12;
const SECTION_GAP = 8;

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

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          .slice(0, 4);
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

  const metrics = [
    { label: 'Attempts', value: String(analytics.testsTaken) },
    { label: 'Avg', value: `${analytics.avgScore}%` },
    {
      label: 'Rank',
      value: personalRank?.rank != null ? `#${personalRank.rank}` : '-',
    },
    { label: 'Best', value: `${analytics.bestScore}%` },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
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
            <View style={styles.topBlock}>
              <View style={styles.header}>
                <View style={styles.brandRow}>
                  <BrandLogo size={28} />
                  <Text style={styles.brand}>Awakening Classes</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(tabs)/profile')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  style={({ pressed }) => pressed && { opacity: 0.85 }}
                >
                  <View style={styles.avatar}>
                    {user?.image ? (
                      <Image source={{ uri: user.image }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarLetter}>{user?.firstName?.[0]}</Text>
                    )}
                  </View>
                </Pressable>
              </View>

              <View style={styles.hero}>
                <Text style={styles.greeting} numberOfLines={1}>
                  {greetingForHour(new Date().getHours())}, {user?.firstName || 'there'}
                </Text>
                <Text style={styles.heroSub}>Ready for your next mock test?</Text>
              </View>

              <View style={styles.metrics}>
                {metrics.map((m, i) => (
                  <React.Fragment key={m.label}>
                    {i > 0 ? <View style={styles.metricRule} /> : null}
                    <View style={styles.metric}>
                      <Text
                        style={styles.metricValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {m.value}
                      </Text>
                      <Text style={styles.metricLabel}>{m.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push('/(tabs)/mock-tests')}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    pressed && { opacity: 0.9 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Browse tests"
                >
                  <Text style={styles.primaryActionText}>Browse tests</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primaryButtonText} />
                </Pressable>
                <Pressable
                  onPress={() => openExternal(YOUTUBE_CHANNEL)}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    pressed && { opacity: 0.9 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Watch lectures"
                >
                  <Ionicons name="play-circle-outline" size={18} color={colors.text} />
                  <Text style={styles.secondaryActionText}>Lectures</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeading
                title="Featured"
                rightText="See all"
                onPressRight={() => router.push('/(tabs)/mock-tests')}
              />
              <View style={styles.list}>
                {featuredTests.length > 0 ? (
                  featuredTests.map((test: any) => (
                    <MockTestCard key={test._id} test={test} variant="row" />
                  ))
                ) : (
                  <Text style={styles.empty}>No tests available right now.</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeading
                title="Progress"
                rightText="History"
                onPressRight={() => router.push('/(tabs)/my-tests')}
              />
              <Card padding={14}>
                {analytics.chartData.length > 0 ? (
                  <>
                    <Text style={styles.chartLabel}>Recent scores</Text>
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

            <View style={styles.section}>
              <SectionHeading
                title="Standing"
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

            <View style={styles.section}>
              <SectionHeading title="Spotlight" />
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
      paddingHorizontal: H_PAD,
      gap: BLOCK_GAP,
    },
    topBlock: {
      gap: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 36,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      paddingRight: 12,
      minWidth: 0,
    },
    brand: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      flexShrink: 1,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: colors.surfaceRaised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 36,
      height: 36,
    },
    avatarLetter: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    hero: {
      gap: 2,
    },
    greeting: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    heroSub: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    metrics: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radii.lg,
      paddingVertical: 12,
    },
    metric: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 4,
    },
    metricValue: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
      textAlign: 'center',
      width: '100%',
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textMuted,
      textAlign: 'center',
    },
    metricRule: {
      width: StyleSheet.hairlineWidth,
      height: 28,
      alignSelf: 'center',
      backgroundColor: colors.borderStrong,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    primaryAction: {
      flex: 1.35,
      minHeight: 44,
      borderRadius: Radii.md,
      backgroundColor: colors.text,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryActionText: {
      color: colors.primaryButtonText,
      fontSize: 14,
      fontWeight: '700',
    },
    secondaryAction: {
      flex: 1,
      minHeight: 44,
      borderRadius: Radii.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    secondaryActionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    section: {
      gap: SECTION_GAP,
    },
    list: {
      gap: 8,
    },
    chartLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: 8,
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
      borderRadius: Radii.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
  });
}
