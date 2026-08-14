import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MeshHero } from '../../components/ui/MeshHero';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { formatINR } from '../../lib/admin';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

const PAGE_SIZE = 20;

export default function PurchasersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{
    seriesId?: string;
    testName?: string;
    price?: string;
    enrollments?: string;
    revenue?: string;
  }>();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(Number(params.enrollments || 0));
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(
    async (nextPage: number, search: string, append: boolean) => {
      if (!params.seriesId) {
        setLoading(false);
        return;
      }
      if (!append) setLoading(true);
      try {
        const response = await apiConnector.get(
          `${endpoints.ADMIN_MOCK_PURCHASERS}/${params.seriesId}`,
          {
            params: {
              page: nextPage,
              limit: PAGE_SIZE,
              search: search || undefined,
            },
            timeout: 20000,
          }
        );
        const rows = response.data?.data ?? [];
        const pagination = response.data?.pagination ?? {};
        setUsers((prev) => (append ? [...prev, ...rows] : rows));
        setTotal(pagination.total ?? rows.length);
        setHasMore(Boolean(pagination.hasNextPage));
        setPage(nextPage);
      } catch (error) {
        console.error('Failed to load purchasers', error);
      } finally {
        setLoading(false);
      }
    },
    [params.seriesId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPage(1, query.trim(), false);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPage, query]);

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 14 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {params.testName || 'Purchasers'}
          </Text>
          <View style={styles.backBtn} />
        </View>
      </MeshHero>

      <View style={styles.stats}>
        <Stat label="Price" value={formatINR(Number(params.price || 0))} colors={colors} />
        <Stat label="Purchases" value={Number(total).toLocaleString('en-IN')} colors={colors} />
        <Stat label="Revenue" value={formatINR(Number(params.revenue || 0))} colors={colors} />
      </View>

      <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, email, or mobile"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item, index) => String(item.userId || item._id || item.email || index)}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (hasMore && !loading) fetchPage(page + 1, query.trim(), true);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.text} style={{ marginTop: 24 }} />
          ) : (
            <Text style={styles.empty}>No purchasers match that search.</Text>
          )
        }
        ListFooterComponent={
          loading && users.length > 0 ? (
            <ActivityIndicator color={colors.text} style={{ marginVertical: 16 }} />
          ) : null
        }
        renderItem={({ item, index }) => (
          <Card padding={14}>
            <Text style={styles.index}>#{index + 1}</Text>
            <Text style={styles.name}>
              {`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || '—'}
            </Text>
            <Text style={styles.meta}>{item.email || '—'}</Text>
            <Text style={styles.meta}>{item.mobileNumber || '—'}</Text>
          </Card>
        )}
      />
    </ScreenBackground>
  );
}

function Stat({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: AppPalette;
}) {
  return (
    <Card padding={12} style={{ flex: 1 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: Fonts.medium }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 14, fontFamily: Fonts.semiBold, marginTop: 4 }}>
        {value}
      </Text>
    </Card>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.72)',
      borderWidth: 1,
      borderColor: 'rgba(15,23,42,0.08)',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: '#0F172A',
      marginHorizontal: 8,
    },
    stats: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    search: {
      height: 44,
      borderWidth: 1,
      borderRadius: Radii.pill,
      paddingHorizontal: 14,
      justifyContent: 'center',
      marginHorizontal: 20,
      marginBottom: 12,
    },
    searchInput: {
      fontSize: 14,
      fontFamily: Fonts.sans,
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 8,
    },
    index: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    name: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginTop: 2,
    },
    meta: {
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      marginTop: 2,
    },
    empty: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 13,
      paddingVertical: 24,
    },
  });
}
