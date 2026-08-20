import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNativeBottomInset } from '../lib/safeArea';
import { AppPalette, Fonts, Radii } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';
import { Button } from '../components/ui/Button';
import { TickRing } from '../components/ui/TickRing';
import { SectionHeading } from '../components/ui/SectionHeading';

const BRAND = '#B10207';
const GREEN = '#2F6F4E';
const RED = '#B10207';
const SKIP = '#B86A2A';
const H_PAD = 16;

const formatMultiline = (value?: string) =>
  String(value ?? '').replace(/\\n/g, '\n');

type ReviewItem = {
  type: 'correct' | 'incorrect';
  questionText?: string;
  userAnswer?: string;
  correctAnswer?: string;
  questionType?: string;
  leftColumn?: string[];
  rightColumn?: string[];
  questionImage?: string;
};

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
    color: '#8A8778',
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
  index,
  colors,
  styles,
}: {
  item: ReviewItem;
  index: number;
  colors: AppPalette;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewIndex}>{String(index + 1).padStart(2, '0')}</Text>
      <Text style={styles.questionText}>{formatMultiline(item.questionText)}</Text>
      {item.questionImage ? (
        <Image source={{ uri: item.questionImage }} style={styles.questionImage} resizeMode="contain" />
      ) : null}

      {item.questionType === 'MATCH' && item.leftColumn && item.rightColumn && (
        <View style={styles.matchContainer}>
          <View style={styles.matchColumn}>
            <Text style={styles.matchHead}>Column A</Text>
            {item.leftColumn.map((colItem, idx) => (
              <Text key={`l-${idx}`} style={styles.matchItemText}>
                {String.fromCharCode(97 + idx)}. {formatMultiline(colItem.replace(/^[a-z]\)\s*/, ''))}
              </Text>
            ))}
          </View>
          <View style={styles.matchColumn}>
            <Text style={styles.matchHead}>Column B</Text>
            {item.rightColumn.map((colItem, idx) => (
              <Text key={`r-${idx}`} style={styles.matchItemText}>
                {idx + 1}. {formatMultiline(colItem.replace(/^\d+\)\s*/, ''))}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.answers}>
        <AnswerPane
          label="Your answer"
          value={item.userAnswer || 'Not answered'}
          color={item.type === 'correct' ? GREEN : RED}
          surface={colors.surface}
          muted={colors.textMuted}
        />
        {item.type === 'incorrect' ? (
          <AnswerPane
            label="Correct answer"
            value={item.correctAnswer || ''}
            color={GREEN}
            surface={colors.surface}
            muted={colors.textMuted}
          />
        ) : null}
      </View>
    </View>
  );
}

export default function TestResultScreen() {
  const { attemptData } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useNativeBottomInset();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const data = attemptData ? JSON.parse(attemptData as string) : null;

  if (!data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Result data not found.</Text>
        <Button title="Go Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  const {
    score,
    totalQuestions,
    correctAnswers = [],
    incorrectAnswerDetails = [],
    incorrectAnswers = 0,
    testName,
  } = data;

  const correctItems: ReviewItem[] = Array.isArray(correctAnswers)
    ? correctAnswers.map((a: any) => ({ ...a, type: 'correct' as const }))
    : [];
  const incorrectItems: ReviewItem[] = Array.isArray(incorrectAnswerDetails)
    ? incorrectAnswerDetails.map((a: any) => ({ ...a, type: 'incorrect' as const }))
    : [];

  const correctCount = correctItems.length;
  const incorrectCount = Number(incorrectAnswers) || incorrectItems.length;
  const skippedCount = Math.max(0, totalQuestions - (correctCount + incorrectCount));
  const pct = totalQuestions > 0 ? Math.round((Math.max(0, Number(score)) / totalQuestions) * 100) : 0;

  const bars = [
    { label: 'Correct', value: correctCount, color: GREEN },
    { label: 'Incorrect', value: incorrectCount, color: RED },
    { label: 'Skipped', value: skippedCount, color: SKIP },
  ];
  const barMax = Math.max(totalQuestions, 1);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Results</Text>
          <Text style={styles.testName} numberOfLines={1}>
            {testName}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset + 36 }}
        showsVerticalScrollIndicator={false}
      >
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
                            { height: h, backgroundColor: bar.value > 0 ? bar.color : colors.border },
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
            {score} of {totalQuestions} questions
          </Text>
        </View>

        {correctItems.length > 0 ? (
          <View style={styles.sectionPad}>
            <SectionHeading
              title="Correct"
              subtitle={`${correctItems.length} ${correctItems.length === 1 ? 'question' : 'questions'}`}
              compact
            />
            {correctItems.map((item, index) => (
              <ReviewBlock key={`c-${index}`} item={item} index={index} colors={colors} styles={styles} />
            ))}
          </View>
        ) : null}

        {incorrectItems.length > 0 ? (
          <View style={styles.sectionPad}>
            <SectionHeading
              title="Incorrect"
              subtitle={`${incorrectItems.length} ${incorrectItems.length === 1 ? 'question' : 'questions'}`}
              compact
            />
            {incorrectItems.map((item, index) => (
              <ReviewBlock key={`i-${index}`} item={item} index={index} colors={colors} styles={styles} />
            ))}
          </View>
        ) : null}

        {correctItems.length === 0 && incorrectItems.length === 0 ? (
          <Text style={styles.emptyReview}>No answers to review.</Text>
        ) : null}

        <View style={styles.footer}>
          <Button title="Back to home" onPress={() => router.replace('/(tabs)')} />
          <Pressable
            onPress={() => router.replace('/(tabs)/rankings')}
            style={({ pressed }) => [styles.rankLink, pressed && { opacity: 0.55 }]}
          >
            <Text style={styles.rankLinkText}>View global rankings</Text>
          </Pressable>
        </View>
      </ScrollView>
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
      gap: 10,
    },
    reviewIndex: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      letterSpacing: 1.2,
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
    },
    footer: {
      paddingHorizontal: H_PAD,
      paddingTop: 28,
      gap: 8,
    },
    rankLink: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    rankLinkText: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: colors.textSecondary,
    },
    errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginBottom: 20,
    },
  });
}
