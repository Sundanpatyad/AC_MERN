import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabScreenBottomPadding } from '../../lib/safeArea';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isInstructorAccount, useAuthStore } from '../../store/authStore';
import { SettingsCard } from '../../components/ui/SettingsShell';
import { ListRow } from '../../components/ui/ListRow';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MeshHero } from '../../components/ui/MeshHero';
import { Button } from '../../components/ui/Button';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { MediaImage } from '../../components/MediaImage';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabScreenBottomPadding();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [purchased, setPurchased] = useState<any[]>([]);
  const [ownedPdfs, setOwnedPdfs] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [averageScoreLabel, setAverageScoreLabel] = useState<string | null>(null);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const [enrolledRes, attemptsRes, ranksRes, pdfRes] = await Promise.all([
        apiConnector.get(endpoints.GET_ENROLLED_MOCK_TESTS).catch(() => null),
        apiConnector
          .get(endpoints.GET_USER_ATTEMPTS, { params: { page: 1, limit: 10 } })
          .catch(() => null),
        apiConnector
          .get(endpoints.GET_RANKINGS, { params: { page: 1, limit: 5 } })
          .catch(() => null),
        apiConnector.get(endpoints.PDF_LIST).catch(() => null),
      ]);

      if (enrolledRes?.data?.success) {
        setPurchased(enrolledRes.data.data || []);
      }
      if (attemptsRes?.data?.success) {
        setAttempts(attemptsRes.data.attempts || attemptsRes.data.data || []);
        setTotalAttempts(
          attemptsRes.data.user?.totalAttempts ??
            attemptsRes.data.pagination?.total ??
            (attemptsRes.data.attempts || []).length
        );
        if (attemptsRes.data.user?.averageScore != null) {
          setAverageScoreLabel(String(attemptsRes.data.user.averageScore));
        }
      }
      if (ranksRes?.data?.success) {
        setPersonalRank(ranksRes.data.loggedInUserRank?.[0] ?? null);
      }
      const pdfs = pdfRes?.data?.data || [];
      setOwnedPdfs(pdfs.filter((item: any) => item.access === 'paid' && item.canView));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const stats = useMemo(() => {
    const scores = attempts
      .map((a) => {
        const max = Number(a.totalQuestions) || Number(a.totalScore) || 0;
        const score = Number(a.score) || 0;
        return max > 0 ? (score / max) * 100 : score;
      })
      .filter((n) => !Number.isNaN(n));

    return {
      rank: personalRank?.rank != null ? `#${personalRank.rank}` : '—',
      attempts: String(totalAttempts),
      avg:
        averageScoreLabel != null
          ? averageScoreLabel
          : scores.length > 0
            ? `${Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)}%`
            : '—',
    };
  }, [attempts, averageScoreLabel, personalRank, totalAttempts]);

  const instructor = isInstructorAccount(user?.accountType);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (instructor ? 'Instructor' : 'Student');
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'A';

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 14 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </MeshHero>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabClearance }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
            }}
            tintColor={colors.refreshTint}
          />
        }
      >
        <View style={styles.identity}>
          {user?.image ? (
            <MediaImage uri={user.image} style={[styles.avatar, { borderColor: colors.border }]} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { borderColor: colors.border }]}>
              <Text style={styles.avatarLetter}>{initials}</Text>
            </View>
          )}
          <View style={styles.identityCopy}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
            <Pressable
              onPress={() => router.push('/edit-profile')}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [pressed && { opacity: 0.65 }]}
            >
              <Text style={styles.editLink}>Edit profile</Text>
            </Pressable>
          </View>
        </View>

        {instructor ? (
          <View style={{ marginBottom: 24 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Admin pages</Text>
            <SettingsCard>
              {[
                { icon: 'grid-outline', label: 'Dashboard', route: '/admin/dashboard' },
                { icon: 'people-outline', label: 'Tester activity', route: '/admin/tester-activity' },
                { icon: 'stats-chart-outline', label: 'Admin Console', route: '/(tabs)' },
                { icon: 'document-text-outline', label: 'My Tests', route: '/(tabs)/mock-tests' },
                { icon: 'add-circle-outline', label: 'Create Mock Test', route: '/admin/create-series' },
                { icon: 'notifications-outline', label: 'Send Notification', route: '/admin/send-notification' },
                { icon: 'folder-open-outline', label: 'Study Materials', route: '/admin/study-materials' },
                { icon: 'book-outline', label: 'Study library', route: '/study-material' },
              ].map((item, index, list) => (
                <ListRow
                  key={item.route}
                  iconName={item.icon}
                  label={item.label}
                  onPress={() => router.push(item.route as any)}
                  style={
                    index === list.length - 1
                      ? { borderBottomWidth: 0 }
                      : {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        }
                  }
                />
              ))}
            </SettingsCard>
          </View>
        ) : (
        <View style={[styles.stats, { borderColor: colors.border }]}>
          <Pressable
            style={styles.stat}
            onPress={() => router.push('/(tabs)/rankings')}
            accessibilityRole="button"
          >
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={styles.statValue}>{stats.rank}</Text>
          </Pressable>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Pressable
            style={styles.stat}
            onPress={() => router.push('/(tabs)/my-tests')}
            accessibilityRole="button"
          >
            <Text style={styles.statLabel}>Attempts</Text>
            <Text style={styles.statValue}>{stats.attempts}</Text>
          </Pressable>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Pressable
            style={styles.stat}
            onPress={() => router.push('/(tabs)/my-tests')}
            accessibilityRole="button"
          >
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{stats.avg}</Text>
          </Pressable>
        </View>
        )}

        {!instructor ? (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Purchased mocks</Text>
              {purchased.length > 0 ? (
                <Pressable onPress={() => router.push('/(tabs)/mock-tests')} hitSlop={8}>
                  <Text style={styles.sectionLink}>See all</Text>
                </Pressable>
              ) : null}
            </View>

            {isLoading ? (
              <Text style={styles.emptyCopy}>Loading…</Text>
            ) : purchased.length > 0 ? (
              <View style={styles.mocksList}>
                {purchased.map((test: any) => (
                  <MockTestCard key={test._id} test={test} variant="row" showStatus />
                ))}
              </View>
            ) : (
              <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <View style={[styles.emptyIcon, { borderColor: colors.border }]}>
                  <Ionicons name="folder-open-outline" size={22} color={colors.text} />
                </View>
                <Text style={styles.emptyTitle}>No purchases yet</Text>
                <Text style={styles.emptyCopy}>
                  Mock series you buy will be listed here for quick access.
                </Text>
                <Button
                  title="Browse mock tests"
                  onPress={() => router.push('/(tabs)/mock-tests')}
                  variant="outline"
                  style={styles.emptyButton}
                />
              </View>
            )}

            <View style={[styles.sectionHead, { marginTop: 28 }]}>
              <Text style={styles.sectionTitle}>Purchased material</Text>
              <Pressable onPress={() => router.push('/study-material')} hitSlop={8}>
                <Text style={styles.sectionLink}>Browse</Text>
              </Pressable>
            </View>
            {ownedPdfs.length > 0 ? (
              <View style={styles.mocksList}>
                {ownedPdfs.map((item) => (
                  <Pressable
                    key={item._id}
                    onPress={() => router.push(`/study-material/${item._id}`)}
                    style={[styles.pdfRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pdfTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.pdfMeta} numberOfLines={1}>{item.category || 'Study material'}</Text>
                    </View>
                    <Text style={styles.sectionLink}>Read</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyCopy}>Paid papers you buy will show up here.</Text>
            )}
          </>
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 22,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.3,
    },
    settingsBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingTop: 24,
      paddingBottom: 16,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surfaceRaised,
      borderWidth: StyleSheet.hairlineWidth,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 22,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    identityCopy: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontSize: 20,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.3,
    },
    email: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      marginTop: 3,
      marginBottom: 8,
    },
    editLink: {
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: colors.text,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      marginBottom: 28,
    },
    stat: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 2,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      marginVertical: 4,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    statValue: {
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.2,
    },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    sectionLink: {
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    mocksList: {
      gap: 10,
    },
    pdfRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pdfTitle: {
      fontSize: 14,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    pdfMeta: {
      marginTop: 2,
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    empty: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 28,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.lg,
    },
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyCopy: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      lineHeight: 20,
      textAlign: 'center',
      marginBottom: 18,
      maxWidth: 260,
    },
    emptyButton: {
      width: '100%',
      marginVertical: 0,
    },
  });
}
