import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isInstructorAccount, useAuthStore } from '../../store/authStore';
import { InstructorTests } from '../../components/admin/InstructorTests';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MeshHero } from '../../components/ui/MeshHero';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TestListSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function MockTestsScreen() {
  const { user } = useAuthStore();
  if (isInstructorAccount(user?.accountType)) {
    return <InstructorTests />;
  }
  return <StudentMockTestsScreen />;
}

function StudentMockTestsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [allTests, setAllTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    try {
      const response = await apiConnector.get(endpoints.GET_ALL_MOCK_TESTS);
      if (response.data?.success) {
        const tests = response.data.data
          .filter((t: any) => t.status !== 'draft')
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setAllTests(tests);
      }
    } catch (error) {
      console.error('Failed to fetch all tests:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTests();
  };

  const filteredTests = allTests.filter((test: any) =>
    test.seriesName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Explore Tests</Text>
          <Text style={styles.subtitle}>Challenge yourself with our latest mock tests</Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={16}
              color="rgba(15,23,42,0.45)"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search series..."
              placeholderTextColor="rgba(15,23,42,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </MeshHero>

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
        <View style={styles.testsList}>
          {isLoading ? (
            <TestListSkeleton count={4} />
          ) : filteredTests.length > 0 ? (
            filteredTests.map((test: any) => <MockTestCard key={test._id} test={test} />)
          ) : (
            <Text style={styles.emptyText}>No mock tests found.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: '#0F172A',
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      color: 'rgba(15,23,42,0.55)',
      marginBottom: 14,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.78)',
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: 'rgba(15,23,42,0.08)',
      paddingHorizontal: 12,
      height: 40,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: '#0F172A',
      fontSize: 15,
    },
    scrollContent: {
      padding: 16,
      paddingTop: 8,
      paddingBottom: 16,
    },
    testsList: {
      gap: 4,
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
      marginTop: 40,
      fontSize: 13,
    },
  });
}
