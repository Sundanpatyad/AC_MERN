import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
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
const BANNER_H_PAD = 16;

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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width: screenWidth } = useWindowDimensions();
  const [featuredTests, setFeaturedTests] = useState([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [topRanks, setTopRanks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const bannerWidth = screenWidth - BANNER_H_PAD * 2;
  const bannerHeight = bannerWidth / BANNER_ASPECT;

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
        setTopRanks((ranksRes.data.data || []).slice(0, 5));
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

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.brandRow}>
              <BrandLogo size={28} />
              <Text style={styles.brand}>Awakening Classes</Text>
            </View>
            <Text style={styles.greeting} numberOfLines={1}>
              Hello, {user?.firstName}!
            </Text>
            <Text style={styles.subtitle}>Ready to practice today?</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.85 }]}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.firstName?.[0]}</Text>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => openExternal(RANK_STORY_URL)}
          style={({ pressed }) => [
            styles.heroBanner,
            {
              width: bannerWidth,
              height: bannerHeight,
              opacity: pressed ? 0.94 : 1,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/rank1-banner.png')}
            style={{ width: bannerWidth, height: bannerHeight }}
            resizeMode="cover"
          />
        </Pressable>

        <TouchableOpacity
          style={styles.lecturesRow}
          activeOpacity={0.85}
          onPress={() => openExternal(YOUTUBE_CHANNEL)}
        >
          <Ionicons name="logo-youtube" size={20} color={colors.textSecondary} />
          <Text style={styles.lecturesRowText}>Watch lectures on YouTube</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <SectionHeading
          title="Featured Tests"
          rightText="See All"
          onPressRight={() => router.push('/(tabs)/mock-tests')}
          style={styles.sectionHeader}
        />

        <View style={styles.testsList}>
          {featuredTests.length > 0 ? (
            featuredTests.map((test: any) => <MockTestCard key={test._id} test={test} />)
          ) : (
            <Text style={styles.emptyText}>No tests available right now.</Text>
          )}
        </View>

        <SectionHeading
          title="Your Rank"
          rightText="Leaderboard"
          onPressRight={() => router.push('/(tabs)/rankings')}
          style={styles.sectionHeader}
        />

        <Card style={styles.rankCard}>
          <View style={styles.rankHero}>
            <View style={styles.rankIcon}>
              <Ionicons name="trophy" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rankHeroText}>
              <Text style={styles.rankLabel}>Current rank</Text>
              <Text style={styles.rankValue}>
                {personalRank?.rank != null ? `#${personalRank.rank}` : '—'}
              </Text>
            </View>
            <View style={styles.rankMeta}>
              <Text style={styles.rankMetaScore}>
                {personalRank?.score != null
                  ? `${personalRank.score}${
                      personalRank.totalQuestions ? ` / ${personalRank.totalQuestions}` : ''
                    }`
                  : 'No score yet'}
              </Text>
              <Text style={styles.rankMetaTest} numberOfLines={1}>
                {personalRank?.testName || 'Take a mock to get ranked'}
              </Text>
            </View>
          </View>

          {topRanks.length > 0 && (
            <View style={styles.topList}>
              {topRanks.slice(0, 3).map((item, index) => (
                <View key={`${item.userId}-${index}`} style={styles.topRow}>
                  <Text style={styles.topRank}>#{item.rank || index + 1}</Text>
                  <Text style={styles.topName} numberOfLines={1}>
                    {item.userName}
                  </Text>
                  <Text style={styles.topScore}>{item.score}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Analytics + graph */}
        <SectionHeading
          title="Analytics"
          rightText="My Tests"
          onPressRight={() => router.push('/(tabs)/my-tests')}
          style={styles.sectionHeader}
        />

        <Card style={styles.analyticsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{analytics.testsTaken}</Text>
              <Text style={styles.statPillLabel}>Attempts</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{analytics.avgScore}%</Text>
              <Text style={styles.statPillLabel}>Avg score</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{analytics.bestScore}%</Text>
              <Text style={styles.statPillLabel}>Best</Text>
            </View>
          </View>

          <Text style={styles.chartTitle}>Recent scores</Text>
          <ScoreBarChart data={analytics.chartData} height={150} />
        </Card>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    scrollContent: {
      paddingTop: 64,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    headerText: {
      flex: 1,
      paddingRight: 12,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    brand: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    greeting: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceRaised,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderStrong,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    heroBanner: {
      alignSelf: 'center',
      backgroundColor: colors.surfaceRaised,
      overflow: 'hidden',
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lecturesRow: {
      marginTop: 12,
      marginHorizontal: 20,
      marginBottom: 8,
      height: 48,
      borderRadius: Radii.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    lecturesRowText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    sectionHeader: {
      marginTop: 20,
      marginBottom: 12,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    seeAll: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    rankCard: {
      marginHorizontal: 20,
      padding: 16,
      overflow: 'hidden',
    },
    rankHero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rankIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceRaised,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    rankHeroText: {
      flex: 1,
    },
    rankLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2,
    },
    rankValue: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    rankMeta: {
      alignItems: 'flex-end',
      maxWidth: '40%',
    },
    rankMetaScore: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    rankMetaTest: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
      textAlign: 'right',
    },
    topList: {
      marginTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 12,
      gap: 10,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    topRank: {
      width: 36,
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    topName: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    topScore: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    analyticsCard: {
      marginHorizontal: 20,
      padding: 16,
      overflow: 'hidden',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 18,
    },
    statPill: {
      flex: 1,
      backgroundColor: colors.surfaceRaised,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    statPillValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 2,
    },
    statPillLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    chartTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    testsList: {
      gap: 4,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    loadingText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 20,
      fontSize: 13,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 20,
      fontSize: 13,
    },
  });
}
