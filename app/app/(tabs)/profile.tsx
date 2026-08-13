import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { Button } from '../../components/ui/Button';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [purchased, setPurchased] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const [enrolledRes, attemptsRes, ranksRes] = await Promise.all([
        apiConnector.get(endpoints.GET_ENROLLED_MOCK_TESTS).catch(() => null),
        apiConnector.get(endpoints.GET_USER_ATTEMPTS).catch(() => null),
        apiConnector
          .get(endpoints.GET_RANKINGS, { params: { page: 1, limit: 5 } })
          .catch(() => null),
      ]);

      if (enrolledRes?.data?.success) {
        setPurchased(enrolledRes.data.data || []);
      }
      if (attemptsRes?.data?.success) {
        setAttempts(attemptsRes.data.attempts || attemptsRes.data.data || []);
      }
      if (ranksRes?.data?.success) {
        setPersonalRank(ranksRes.data.loggedInUserRank?.[0] ?? null);
      }
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
      attempts: String(attempts.length),
      avg:
        scores.length > 0
          ? `${Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)}%`
          : '—',
    };
  }, [attempts, personalRank]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Student';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'A';

  return (
    <ScreenBackground>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 16) + 8, borderBottomColor: colors.border },
        ]}
      >
        <Text style={styles.title}>Profile</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          style={({ pressed }) => [
            styles.settingsBtn,
            { borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="settings-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
            <Image source={{ uri: user.image }} style={[styles.avatar, { borderColor: colors.border }]} />
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

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Purchased mocks</Text>
          {purchased.length > 0 ? (
            <Pressable onPress={() => router.push('/(tabs)/my-tests')} hitSlop={8}>
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
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
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
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 48,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingTop: 24,
      paddingBottom: 24,
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
