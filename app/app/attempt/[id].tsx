import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNativeBottomInset } from '../../lib/safeArea';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { Button } from '../../components/ui/Button';
import { TickRing } from '../../components/ui/TickRing';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';

const BRAND = '#B10207';
const GREEN = '#2F6F4E';
const RED = '#B10207';
const SKIP = '#B86A2A';
const H_PAD = 16;
const PAGE_SIZE = 10;

const formatMultiline = (value?: string) =>
  String(value ?? '').replace(/\\n/g, '\n');

const formatScore = (score: number) => {
  const n = Number(score);
  if (Number.isNaN(n)) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

type ReviewItem = {
  type: 'correct' | 'incorrect' | 'skipped';
  questionIndex?: number;
  questionText?: string;
  userAnswer?: string;
  correctAnswer?: string;
  questionType?: string;
  leftColumn?: string[];
  rightColumn?: string[];
  questionImage?: string;
};

function answerColor(type: ReviewItem['type']): string {
  if (type === 'correct') return GREEN;
  if (type === 'incorrect') return RED;
  return SKIP;
}

function AnswerPane({
  label,
  value,
  color,
  surface,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  surface: string;
  muted: string;
}) {
  return (
    <View style={[paneStyles.pane, { backgroundColor: surface }]}>
      <View style={[paneStyles.stripe, { backgroundColor: color }]} />
      <View style={paneStyles.body}>
        <Text style={[paneStyles.label, { color: muted }]}>{label}</Text>
        <Text style={[paneStyles.value, { color }]}>{formatMultiline(value)}</Text>
      </View>
    </View>
  );
}

const paneStyles = StyleSheet.create({
  pane: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: Radii.md,
  },
  stripe: {
    width: 3,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.medium,
  },
});

function ReviewBlock({
  item,
  displayIndex,
  colors,
  styles,
}: {
  item: ReviewItem;
  displayIndex: number;
  colors: AppPalette;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHead}>
        <Text style={styles.reviewIndex}>{String(displayIndex).padStart(2, '0')}</Text>
        <Text
          style={[
            styles.badge,
            {
              color: answerColor(item.type),
            },
          ]}
        >
          {item.type === 'correct'
            ? 'Attempted · Correct'
            : item.type === 'incorrect'
              ? 'Attempted · Incorrect'
              : 'Not Attempted'}
        </Text>
      </View>
      <Text style={styles.questionText}>{formatMultiline(item.questionText)}</Text>
      {item.questionImage ? (
        <Image source={{ uri: item.questionImage }} style={styles.questionImage} resizeMode="contain" />
      ) : null}

      {item.questionType === 'MATCH' && item.leftColumn && item.rightColumn ? (
        <View style={styles.matchContainer}>
          <View style={styles.matchColumn}>
            <Text style={styles.matchHead}>Column A</Text>
            {item.leftColumn.map((colItem, idx) => (
              <Text key={`l-${idx}`} style={styles.matchItemText}>
                {String.fromCharCode(97 + idx)}. {formatMultiline(String(colItem).replace(/^[a-z]\)\s*/i, ''))}
              </Text>
            ))}
          </View>
          <View style={styles.matchColumn}>
            <Text style={styles.matchHead}>Column B</Text>
            {item.rightColumn.map((colItem, idx) => (
              <Text key={`r-${idx}`} style={styles.matchItemText}>
                {idx + 1}. {formatMultiline(String(colItem).replace(/^\d+\)\s*/, ''))}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.answers}>
        <AnswerPane
          label="Your answer"
          value={item.type === 'skipped' ? 'Not Attempted' : (item.userAnswer || 'Not answered')}
          color={answerColor(item.type)}
          surface={colors.surface}
          muted={colors.textMuted}
        />
        <AnswerPane
          label="Correct answer"
          value={item.correctAnswer || (item.type === 'correct' ? item.userAnswer : '') || '—'}
          color={GREEN}
          surface={colors.surface}
          muted={colors.textMuted}
        />
      </View>
    </View>
  );
}

export default function AttemptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useNativeBottomInset();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [attempt, setAttempt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await apiConnector.get(`${endpoints.GET_ATTEMPT_BY_ID}/${id}`);
        if (!cancelled && response.data?.success) {
          setAttempt(response.data.attempt);
        } else if (!cancelled) {
          setAttempt(null);
        }
      } catch (error) {
        console.error('Failed to load attempt:', error);
        if (!cancelled) setAttempt(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const allItems: ReviewItem[] = useMemo(() => {
    if (!attempt) return [];
    if (Array.isArray(attempt.allQuestionsReview) && attempt.allQuestionsReview.length > 0) {
      return [...attempt.allQuestionsReview]
        .map((a: any) => ({ ...a, type: a.type || 'skipped' }))
        .sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
    }
    return [
      ...(attempt.correctAnswers || []).map((a: any) => ({ ...a, type: a.type || 'correct' })),
      ...(attempt.incorrectAnswerDetails || []).map((a: any) => ({
        ...a,
        type: a.type || 'incorrect',
      })),
      ...(attempt.skippedAnswerDetails || []).map((a: any) => ({
        ...a,
        type: a.type || 'skipped',
      })),
    ].sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
  }, [attempt]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [allItems.length, attempt?._id]);

  const correctCount =
    attempt?.correctCount ?? allItems.filter((item) => item.type === 'correct').length;
  const incorrectCount =
    Number(attempt?.incorrectAnswers) ||
    allItems.filter((item) => item.type === 'incorrect').length;
  const skippedCount =
    Number(attempt?.skippedAnswers) ||
    allItems.filter((item) => item.type === 'skipped').length;

  const score = Number(attempt?.score) || 0;
  const totalQuestions = Number(attempt?.totalQuestions) || 0;
  const pct = totalQuestions > 0 ? Math.round((Math.max(0, score) / totalQuestions) * 100) : 0;

  const visibleItems = useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount]
  );
  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    requestAnimationFrame(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allItems.length));
      setLoadingMore(false);
    });
  }, [allItems.length, hasMore, loadingMore]);

  const bars = useMemo(
    () => [
      { label: 'Correct', value: correctCount, color: GREEN },
      { label: 'Incorrect', value: incorrectCount, color: RED },
      { label: 'Skipped', value: skippedCount, color: SKIP },
    ],
    [correctCount, incorrectCount, skippedCount]
  );
  const barMax = Math.max(totalQuestions, 1);

  const renderItem: ListRenderItem<ReviewItem> = useCallback(
    ({ item, index }) => (
      <ReviewBlock
        item={item}
        displayIndex={(item.questionIndex ?? index) + 1}
        colors={colors}
        styles={styles}
      />
    ),
    [colors, styles]
  );

  const keyExtractor = useCallback(
    (item: ReviewItem, index: number) => `q-${item.questionIndex ?? index}`,
    []
  );

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.sectionPad}>
          <SectionHeading title="Score" compact />
          <View style={styles.glance}>
            <TickRing progress={pct / 100} color={BRAND} trackColor={colors.border}>
              <Text style={styles.ringValue}>{pct}</Text>
              <Text style={styles.ringUnit}>%</Text>
            </TickRing>

            <View style={styles.chartCol}>
              <Text style={styles.chartLabel}>Breakdown</Text>
              <View style={styles.bars}>
                {bars.map((bar) => {
                  const h = bar.value > 0 ? Math.max(8, (bar.value / barMax) * 64) : 6;
                  return (
                    <View key={bar.label} style={styles.barSlot}>
                      <View style={[styles.barTrack, { backgroundColor: colors.surfaceRaised }]}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: h,
                              backgroundColor: bar.value > 0 ? bar.color : colors.border,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.barLabels}>
                {bars.map((bar) => (
                  <View key={bar.label} style={styles.barLabelCol}>
                    <Text style={styles.barValue}>{bar.value}</Text>
                    <Text style={styles.barName}>{bar.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.scoreMeta}>
            {formatScore(score)} of {totalQuestions} questions
          </Text>
        </View>

        {allItems.length > 0 ? (
          <View style={[styles.sectionPad, styles.listHeadingPad]}>
            <SectionHeading
              title="All questions"
              subtitle={`${correctCount} correct · ${incorrectCount} incorrect · ${skippedCount} skipped`}
              compact
            />
          </View>
        ) : (
          <Text style={styles.emptyReview}>
            Detailed answers were not saved for this older attempt. New attempts will show full
            review here.
          </Text>
        )}
      </>
    ),
    [
      allItems.length,
      barMax,
      bars,
      colors.border,
      colors.surfaceRaised,
      correctCount,
      incorrectCount,
      pct,
      score,
      skippedCount,
      styles,
      totalQuestions,
    ]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.text} />
        <Text style={styles.loadingText}>Loading attempt…</Text>
      </View>
    );
  }

  if (!attempt) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Attempt not found.</Text>
        <Button title="Back to attempts" onPress={() => router.replace('/(tabs)/my-tests')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Back to attempts"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Attempt review</Text>
          <Text style={styles.testName} numberOfLines={1}>
            {attempt.testName}
          </Text>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          <View style={styles.listFooter}>
            {hasMore ? (
              <View style={styles.loadMoreRow}>
                {loadingMore ? <ActivityIndicator color={colors.textMuted} /> : null}
                <Text style={styles.loadMoreText}>
                  {loadingMore ? 'Loading more…' : 'Scroll for more questions'}
                </Text>
              </View>
            ) : null}
            <View style={styles.footer}>
              <Button title="All attempts" onPress={() => router.replace('/(tabs)/my-tests')} />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={9}
        removeClippedSubviews
      />
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 12,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 12,
      gap: 4,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCopy: {
      flex: 1,
      paddingRight: 36,
    },
    headerTitle: {
      fontSize: 17,
      lineHeight: 22,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.3,
    },
    testName: {
      marginTop: 1,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
    },
    sectionPad: {
      paddingHorizontal: H_PAD,
      paddingTop: 20,
    },
    listHeadingPad: {
      paddingBottom: 4,
    },
    listFooter: {
      paddingTop: 4,
    },
    loadMoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
    },
    loadMoreText: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
    },
    glance: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: Radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    ringValue: {
      fontSize: 22,
      lineHeight: 26,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    ringUnit: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      marginTop: 1,
    },
    chartCol: {
      flex: 1,
      minWidth: 0,
      gap: 8,
    },
    chartLabel: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      letterSpacing: 0.2,
    },
    bars: {
      height: 68,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    barSlot: {
      flex: 1,
      height: 68,
      justifyContent: 'flex-end',
    },
    barTrack: {
      height: 68,
      borderRadius: 6,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    barFill: {
      width: '100%',
      borderRadius: 6,
    },
    barLabels: {
      flexDirection: 'row',
      gap: 8,
    },
    barLabelCol: {
      flex: 1,
    },
    barValue: {
      fontSize: 13,
      lineHeight: 16,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    barName: {
      fontSize: 10,
      lineHeight: 13,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      marginTop: 1,
    },
    scoreMeta: {
      marginTop: 10,
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    reviewItem: {
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: H_PAD,
      gap: 10,
    },
    reviewHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reviewIndex: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      letterSpacing: 1.2,
    },
    badge: {
      fontSize: 11,
      fontFamily: Fonts.semiBold,
      letterSpacing: 0.3,
    },
    questionText: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Fonts.sans,
      color: colors.text,
    },
    answers: {
      gap: 8,
      paddingTop: 2,
    },
    questionImage: {
      width: '100%',
      height: 140,
      borderRadius: Radii.md,
      backgroundColor: colors.surface,
    },
    matchContainer: {
      flexDirection: 'row',
      gap: 16,
      padding: 12,
      borderRadius: Radii.md,
      backgroundColor: colors.surface,
    },
    matchColumn: {
      flex: 1,
      gap: 4,
    },
    matchHead: {
      fontSize: 11,
      fontFamily: Fonts.semiBold,
      color: colors.textMuted,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    matchItemText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.sans,
    },
    emptyReview: {
      paddingHorizontal: H_PAD,
      paddingVertical: 20,
      fontSize: 15,
      fontFamily: Fonts.sans,
      color: colors.textMuted,
      lineHeight: 22,
    },
    footer: {
      paddingHorizontal: H_PAD,
      paddingTop: 28,
      gap: 8,
    },
    errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginBottom: 8,
    },
  });
}
