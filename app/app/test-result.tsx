import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { AppPalette } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';

/** Turn literal `\n` sequences into real line breaks for display. */
const formatMultiline = (value?: string) =>
  String(value ?? '').replace(/\\n/g, '\n');

export default function TestResultScreen() {
  const { attemptData } = useLocalSearchParams();
  const router = useRouter();
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

  const { score, totalQuestions, correctAnswers, incorrectAnswerDetails, incorrectAnswers, testName } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.testName} numberOfLines={1}>{testName}</Text>
        <Text style={styles.headerSubtitle}>Test Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.totalText}>/ {totalQuestions}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{correctAnswers.length}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </View>
              <Text style={styles.statValue}>{incorrectAnswers}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.glow }]}>
                <Ionicons name="help-circle" size={24} color={colors.textMuted} />
              </View>
              <Text style={styles.statValue}>
                {totalQuestions - (correctAnswers.length + incorrectAnswers)}
              </Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>
        </View>

        <Button
          title="See Global Rankings"
          onPress={() => router.replace('/(tabs)/rankings')}
          style={styles.rankingButton}
          textStyle={{ fontWeight: 'bold' }}
        />

        <Text style={styles.sectionTitle}>Question Review</Text>

        <View style={styles.reviewList}>
          {[
            ...correctAnswers.map((a: any) => ({ ...a, type: 'correct' })),
            ...incorrectAnswerDetails.map((a: any) => ({ ...a, type: 'incorrect' })),
          ].map((item, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.questionNum}>Question {index + 1}</Text>
                <Ionicons
                  name={item.type === 'correct' ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={item.type === 'correct' ? '#10b981' : '#ef4444'}
                />
              </View>

              <Text style={styles.questionText}>{formatMultiline(item.questionText)}</Text>
              {item.questionImage ? (
                <Image
                  source={{ uri: item.questionImage }}
                  style={styles.questionImage}
                  resizeMode="contain"
                />
              ) : null}

              {item.questionType === 'MATCH' &&
                item.leftColumn &&
                item.rightColumn && (
                  <View style={styles.matchContainer}>
                    <View style={styles.matchColumn}>
                      <View style={[styles.matchHeader, { borderBottomColor: 'rgba(59, 130, 246, 0.2)' }]}>
                        <Text
                          style={[
                            styles.matchHeaderText,
                            { color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                          ]}
                        >
                          COL A
                        </Text>
                      </View>
                      {item.leftColumn.map((colItem: string, idx: number) => (
                        <View key={`left-${idx}`} style={styles.matchItem}>
                          <View style={[styles.matchBadge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <Text style={[styles.matchBadgeText, { color: '#3b82f6' }]}>
                              {String.fromCharCode(97 + idx)}
                            </Text>
                          </View>
                          <Text style={styles.matchItemText}>
                            {formatMultiline(colItem.replace(/^[a-z]\)\s*/, ''))}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.matchColumn}>
                      <View style={[styles.matchHeader, { borderBottomColor: 'rgba(245, 158, 11, 0.2)' }]}>
                        <Text
                          style={[
                            styles.matchHeaderText,
                            { color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)' },
                          ]}
                        >
                          COL B
                        </Text>
                      </View>
                      {item.rightColumn.map((colItem: string, idx: number) => (
                        <View key={`right-${idx}`} style={styles.matchItem}>
                          <View style={[styles.matchBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                            <Text style={[styles.matchBadgeText, { color: '#f59e0b' }]}>{idx + 1}</Text>
                          </View>
                          <Text style={styles.matchItemText}>
                            {formatMultiline(colItem.replace(/^\d+\)\s*/, ''))}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              <View style={styles.answerSection}>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Your Answer: </Text>
                  <Text
                    style={[
                      styles.answerValue,
                      { color: item.type === 'correct' ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {formatMultiline(item.userAnswer)}
                  </Text>
                </View>

                {item.type === 'incorrect' ? (
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Correct Answer: </Text>
                    <Text style={[styles.answerValue, { color: '#10b981' }]}>
                      {formatMultiline(item.correctAnswer)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <Button
          title="Back to Home"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
          style={styles.homeButton}
        />
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
      padding: 20,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: colors.backgroundElevated,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    testName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    headerSubtitle: {
      fontSize: 12,
      color: '#3b82f6',
      fontWeight: '600',
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    scoreCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    scoreCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 6,
      borderColor: '#3b82f6',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    scoreText: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    totalText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    rankingButton: {
      backgroundColor: '#f59e0b',
      borderColor: '#f59e0b',
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    reviewList: {
      gap: 16,
    },
    reviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    questionNum: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    questionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    answerSection: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: 10,
      padding: 10,
      gap: 6,
    },
    answerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    answerLabel: {
      fontSize: 11,
      color: colors.textMuted,
      minWidth: 80,
    },
    answerValue: {
      fontSize: 12,
      fontWeight: '600',
      flex: 1,
    },
    questionImage: {
      width: '100%',
      height: 150,
      borderRadius: 8,
      marginBottom: 12,
    },
    matchContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    matchColumn: {
      flex: 1,
      gap: 6,
    },
    matchHeader: {
      paddingBottom: 2,
      borderBottomWidth: 1,
      marginBottom: 2,
      alignSelf: 'flex-start',
    },
    matchHeaderText: {
      fontSize: 9,
      fontWeight: '700',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    matchItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      backgroundColor: colors.backgroundElevated,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    matchBadge: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    matchBadgeText: {
      fontSize: 9,
      fontWeight: '700',
    },
    matchItemText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 14,
    },
    homeButton: {
      marginTop: 32,
    },
    errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginBottom: 20,
    },
  });
}
