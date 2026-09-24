import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { MeshHero } from '../components/ui/MeshHero';
import { YoutubeVideo, YoutubeVideoCard } from '../components/YoutubeVideoCard';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';
import { AppPalette, Fonts, Radii } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';
import { useNativeBottomInset } from '../lib/safeArea';

const PAGE_SIZE = 8;

export default function AllCoursesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = useNativeBottomInset();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadVideos = useCallback(async (pageToken?: string) => {
    const appending = Boolean(pageToken);
    if (appending) setLoadingMore(true);
    else setError('');

    try {
      const res = await apiConnector.get(endpoints.YOUTUBE_VIDEOS, {
        params: {
          limit: PAGE_SIZE,
          ...(query ? { q: query } : {}),
          ...(pageToken ? { pageToken } : {}),
        },
      });

      if (!res.data?.success) {
        if (!appending) setVideos([]);
        setError(res.data?.message || 'Could not load courses');
        return;
      }

      const incoming: YoutubeVideo[] = res.data.videos || [];
      setVideos((prev) => (appending ? [...prev, ...incoming] : incoming));
      setNextPageToken(res.data.nextPageToken || null);
      setError('');
    } catch (err: any) {
      if (!appending) setVideos([]);
      setError(err?.response?.data?.message || 'Could not load courses');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    setLoading(true);
    loadVideos();
  }, [loadVideos]);

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 14 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            All courses
          </Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search videos"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search videos"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </MeshHero>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset + 24 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadVideos();
            }}
            tintColor={colors.refreshTint}
          />
        }
        onEndReached={() => {
          if (nextPageToken && !loadingMore && !loading) loadVideos(nextPageToken);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.text} style={styles.loader} />
          ) : (
            <Text style={styles.empty}>
              {error || (query ? 'No videos match your search.' : 'No courses yet.')}
            </Text>
          )
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.text} style={styles.loader} /> : null
        }
        renderItem={({ item }) => (
          <YoutubeVideoCard
            video={item}
            onPress={() =>
              router.push({
                pathname: '/watch/[id]',
                params: {
                  id: item.id,
                  title: item.title,
                  publishedAt: item.publishedAt || '',
                },
              })
            }
          />
        )}
      />
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: colors.text,
      fontSize: 17,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.2,
    },
    searchBar: {
      marginHorizontal: 16,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radii.pill,
      borderWidth: 1,
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
      fontFamily: Fonts.sans,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 8,
      flexGrow: 1,
    },
    separator: {
      height: 18,
    },
    loader: {
      paddingVertical: 20,
    },
    empty: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 24,
    },
  });
}
