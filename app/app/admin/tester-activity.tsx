import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SettingsShell, SettingsCard } from '../../components/ui/SettingsShell';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

type UsageUser = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  loginCount: number;
  openCount: number;
  totalDurationMs: number;
};

type UsageDay = {
  date: string;
  uniqueUsers: number;
  uniqueLogins: number;
  loginEvents: number;
  openEvents: number;
  totalDurationMs: number;
  users: UsageUser[];
};

type UsagePayload = {
  timezone?: string;
  today?: string;
  year?: number;
  month?: number;
  from?: string;
  to?: string;
  days: UsageDay[];
};

function formatDuration(ms: number) {
  const total = Math.max(0, Math.round((ms || 0) / 1000));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes < 60) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function parseIstDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00+05:30`);
}

function weekday(dateKey: string) {
  return parseIstDate(dateKey).toLocaleDateString('en-IN', { weekday: 'short' });
}

function fullDateLabel(dateKey: string, todayKey: string) {
  const pretty = parseIstDate(dateKey).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return dateKey === todayKey ? `Today · ${pretty}` : pretty;
}

function monthTitle(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function currentIstMonth() {
  const key = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
  const [year, month] = key.split('-').map(Number);
  return { year, month };
}

function shiftMonth(year: number, month: number, delta: number) {
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
}

function monthValue(year: number, month: number) {
  return year * 12 + month;
}

export default function TesterActivityScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const now = useMemo(() => currentIstMonth(), []);
  const [view, setView] = useState(now);
  const [data, setData] = useState<UsagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [studentsOnly, setStudentsOnly] = useState(true);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const month = `${view.year}-${String(view.month).padStart(2, '0')}`;
      const response = await apiConnector.get(endpoints.ADMIN_APP_USAGE, {
        params: { month, studentsOnly },
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to load');
      }
      const payload = response.data.data as UsagePayload;
      setData(payload);
      const today = payload.today || '';
      const inThisMonth = payload.days?.some((day) => day.date === today);
      setSelectedDate((current) => {
        if (current && payload.days?.some((day) => day.date === current)) return current;
        if (inThisMonth) return today;
        return payload.days?.[0]?.date || null;
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not load tester activity.');
    } finally {
      setLoading(false);
    }
  }, [studentsOnly, view.year, view.month]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const todayKey = data?.today || '';
  const canGoNext = monthValue(view.year, view.month) < monthValue(now.year, now.month);
  const selectedDay = useMemo(
    () => (data?.days || []).find((day) => day.date === selectedDate) || null,
    [data, selectedDate]
  );

  const goMonth = (delta: number) => {
    const next = shiftMonth(view.year, view.month, delta);
    if (delta > 0 && monthValue(next.year, next.month) > monthValue(now.year, now.month)) return;
    setSelectedDate(null);
    setLoading(true);
    setView(next);
  };

  return (
    <SettingsShell title="Tester activity" contentStyle={{ paddingTop: 4 }}>
      <Text style={styles.hint}>
        Pura month dekho. Month change karke date choose karo — default is month mein aaj select hota hai.
      </Text>

      <View style={styles.row}>
        <Chip
          label="Students"
          active={studentsOnly}
          onPress={() => setStudentsOnly(true)}
          colors={colors}
        />
        <Chip
          label="Everyone"
          active={!studentsOnly}
          onPress={() => setStudentsOnly(false)}
          colors={colors}
        />
      </View>

      <View style={styles.monthNav}>
        <Pressable onPress={() => goMonth(-1)} hitSlop={10} style={styles.monthBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.monthTitle}>{monthTitle(view.year, view.month)}</Text>
        <Pressable
          onPress={() => goMonth(1)}
          hitSlop={10}
          disabled={!canGoNext}
          style={[styles.monthBtn, !canGoNext && { opacity: 0.35 }]}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.text} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStrip}
          >
            {(data?.days || []).map((day) => {
              const active = day.date === selectedDate;
              const future = !!todayKey && day.date > todayKey;
              return (
                <Pressable
                  key={day.date}
                  onPress={() => setSelectedDate(day.date)}
                  style={({ pressed }) => [
                    styles.dateChip,
                    {
                      backgroundColor: active ? colors.text : colors.surface,
                      borderColor: active ? colors.text : colors.border,
                      opacity: future && !active ? 0.45 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.dateWeek, { color: active ? colors.background : colors.textMuted }]}>
                    {day.date === todayKey ? 'Today' : weekday(day.date)}
                  </Text>
                  <Text style={[styles.dateNum, { color: active ? colors.background : colors.text }]}>
                    {parseIstDate(day.date).getDate()}
                  </Text>
                  <Text style={[styles.dateCount, { color: active ? colors.background : colors.textMuted }]}>
                    {day.uniqueUsers}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.dayHeading}>
            {selectedDate ? fullDateLabel(selectedDate, todayKey) : 'Select a date'}
          </Text>
          <Text style={styles.dayMeta}>
            {selectedDay
              ? `${selectedDay.uniqueUsers} testers · ${selectedDay.uniqueLogins} login · ${selectedDay.openEvents} open · ${formatDuration(selectedDay.totalDurationMs)}`
              : 'No activity loaded.'}
          </Text>

          <SettingsCard>
            {!selectedDay || selectedDay.users.length === 0 ? (
              <Text style={styles.empty}>Is date par kisi ne login ya app open nahi kiya.</Text>
            ) : (
              selectedDay.users.map((user, index, list) => (
                <View
                  key={String(user.userId)}
                  style={[
                    styles.userRow,
                    index < list.length - 1
                      ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
                      : null,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Student'}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.userStat}>
                      {user.loginCount ? `Login ${user.loginCount}` : 'Open only'}
                    </Text>
                    <Text style={styles.userEmail}>
                      {user.openCount} open · {formatDuration(user.totalDurationMs)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </SettingsCard>
        </>
      )}
    </SettingsShell>
  );
}

function Chip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: AppPalette;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 34,
        paddingHorizontal: 12,
        borderRadius: Radii.pill,
        borderWidth: 1,
        borderColor: active ? colors.text : colors.border,
        backgroundColor: active ? colors.text : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: Fonts.medium,
          color: active ? colors.background : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    hint: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    monthBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthTitle: {
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    error: {
      marginTop: 16,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.danger,
    },
    dateStrip: {
      gap: 8,
      paddingBottom: 4,
    },
    dateChip: {
      width: 72,
      borderRadius: 16,
      borderWidth: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    dateWeek: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      textTransform: 'uppercase',
    },
    dateNum: {
      marginTop: 6,
      fontSize: 20,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.4,
    },
    dateCount: {
      marginTop: 6,
      fontSize: 11,
      fontFamily: Fonts.sans,
    },
    dayHeading: {
      marginTop: 18,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    dayMeta: {
      marginTop: 4,
      marginBottom: 14,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
    },
    empty: {
      paddingVertical: 18,
      paddingHorizontal: 4,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    userName: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.text,
    },
    userEmail: {
      marginTop: 2,
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
    },
    userStat: {
      fontSize: 12,
      fontFamily: Fonts.medium,
      color: colors.text,
    },
  });
}
