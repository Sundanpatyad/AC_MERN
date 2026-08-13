import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { ConfirmationSheet } from '../../components/ui/ConfirmationSheet';
import { DetailSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

/** Normalise an option that may be a plain string (legacy) or {text, image} object — same as web. */
const normaliseOption = (opt: any): { text: string; image: string } => {
  if (typeof opt === 'string') return { text: opt, image: '' };
  return { text: opt?.text || '', image: opt?.image || '' };
};

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hasSeriesAccess(series: any, userId?: string) {
  if (!series) return false;
  if (Number(series.price) === 0) return true;
  if (series.isEnrolled) return true;
  if (!userId || !Array.isArray(series.studentsEnrolled)) return false;
  return series.studentsEnrolled.some(
    (entry: any) => String(entry?._id || entry) === String(userId)
  );
}

export default function TakeTestScreen() {
  const { id: rawId, seriesId: rawSeriesId } = useLocalSearchParams();
  const id = paramValue(rawId);
  const seriesIdParam = paramValue(rawSeriesId);
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { answers, setAnswer, clearAnswer, timeRemaining, setTimeRemaining, startTest, resetTest, isTestActive } = useTestStore();

  const [testData, setTestData] = useState<any>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmSheetVisible, setIsConfirmSheetVisible] = useState(false);
  const navScrollViewRef = React.useRef<ScrollView>(null);

  // Helper to shuffle array
  const shuffle = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchTest = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      let seriesId = seriesIdParam;

      if (!seriesId) {
        const listRes = await apiConnector.get(endpoints.GET_ALL_MOCK_TESTS);
        const series = (listRes.data?.data || []).find((item: any) =>
          item.mockTests?.some((t: any) => String(t._id) === String(id))
        );
        seriesId = series?._id;
      }

      if (!seriesId) {
        router.back();
        return;
      }

      const response = await apiConnector.get(
        `${endpoints.GET_MOCK_TEST_SERIES_BY_ID}/${seriesId}`,
        { params: { full: true }, timeout: 30000 }
      );

      if (!response.data?.success) {
        router.back();
        return;
      }

      const parentSeries = response.data.data;
      const foundNested = parentSeries?.mockTests?.find(
        (t: any) => String(t._id) === String(id)
      );

      if (!foundNested || !parentSeries) {
        router.back();
        return;
      }

      if (!hasSeriesAccess(parentSeries, user?._id)) {
        resetTest();
        router.replace(`/mock-test/${parentSeries._id}`);
        return;
      }

      const foundTest = { ...foundNested, seriesId: parentSeries._id };
      const questions = Array.isArray(foundTest.questions) ? foundTest.questions : [];

      const questionsWithOriginalData = questions.map((q: any) => {
        const rawOptions = Array.isArray(q.options) ? q.options : [];
        const optionsToProcess =
          q.questionType === 'MATCH' ? rawOptions.slice(0, 4) : rawOptions;
        const optionsWithOriginalIndex = optionsToProcess.map((opt: any, idx: number) => ({
          content: opt,
          originalIndex: idx,
        }));
        const shuffledOptions = shuffle(optionsWithOriginalIndex);
        return {
          ...q,
          shuffledOptions,
        };
      });

      const randomizedQuestions = shuffle(questionsWithOriginalData);
      setTestData(foundTest);
      setShuffledQuestions(randomizedQuestions);

      if (!isTestActive && foundTest.duration) {
        startTest(foundTest.duration);
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, seriesIdParam, user?._id, isTestActive, resetTest, router, startTest]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Auto-scroll logic for question navigation dots
  useEffect(() => {
    if (navScrollViewRef.current) {
      const dotWidth = 32; // 26 width + 6 margin
      navScrollViewRef.current.scrollTo({
        x: Math.max(0, (currentQuestionIndex * dotWidth) - 100),
        animated: true
      });
    }
  }, [currentQuestionIndex]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTestActive && testData) {
      handleSubmitTest();
    }
    return () => clearInterval(timer);
  }, [timeRemaining, isTestActive, testData]);

  const handleOptionSelect = (originalIndex: number) => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion._id];

    if (currentAnswer?.selectedOption === originalIndex) {
      // Toggle off if already selected
      clearAnswer(currentQuestion._id);
    } else {
      // Select new option
      setAnswer(currentQuestion._id, {
        questionId: currentQuestion._id,
        selectedOption: originalIndex,
        timeTaken: 0 
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Calculate results
      let score = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      const correctAnswers: any[] = [];
      const incorrectAnswerDetails: any[] = [];
      const negativeMarkValue = testData.negative || 0;
      
      shuffledQuestions.forEach((q: any) => {
        const answer = answers[q._id];
        const selectedOptionIndex = answer?.selectedOption;
        
        // Extract correct answer safely for MATCH
        let trueCorrectAnswer = q.correctAnswer;
        if (q.questionType === 'MATCH' && (!trueCorrectAnswer || String(trueCorrectAnswer).trim() === '') && q.options && q.options.length >= 5) {
            trueCorrectAnswer = q.options[4];
        }
        
        // Determine if correct
        let isCorrect = false;
        let userSelectedText = "Not Answered";

        if (selectedOptionIndex !== undefined && selectedOptionIndex !== null) {
          const option = q.options[selectedOptionIndex];
          userSelectedText = typeof option === 'string' ? option : option.text;

          // Compare index or text
          if (selectedOptionIndex.toString() === String(trueCorrectAnswer).trim() || 
              String(userSelectedText).trim() === String(trueCorrectAnswer).trim()) {
            isCorrect = true;
          }
        }

        const detail = {
          questionText: q.text,
          userAnswer: userSelectedText,
          correctAnswer: trueCorrectAnswer,
          questionType: q.questionType,
          leftColumn: q.leftColumn,
          rightColumn: q.rightColumn,
          questionImage: q.questionImage
        };

        if (isCorrect) {
          score += 1;
          correctCount += 1;
          correctAnswers.push(detail);
        } else {
          if (selectedOptionIndex !== undefined) {
            score -= negativeMarkValue; // Apply negative marking
            incorrectCount += 1;
            incorrectAnswerDetails.push(detail);
          }
        }
      });

      const testDetailsDurationInSeconds = testData.duration * 60;
      const attemptData = {
        mockId: testData.seriesId,
        testName: testData.testName,
        score,
        totalQuestions: testData.questions.length,
        timeTaken: testDetailsDurationInSeconds - timeRemaining,
        correctAnswers,
        incorrectAnswers: incorrectCount,
        incorrectAnswerDetails
      };

      const response = await apiConnector.post(endpoints.CREATE_ATTEMPT_DETAILS, attemptData);
      
      if (response.data?.success) {
        resetTest();
        router.replace({
          pathname: '/test-result',
          params: { attemptData: JSON.stringify(attemptData) }
        });
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: 60 }]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (!testData || !shuffledQuestions?.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: colors.text }}>No questions available for this test.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion._id];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.testName} numberOfLines={1} ellipsizeMode="tail">
            {testData.testName}
          </Text>
          <Text style={styles.questionCount} numberOfLines={1}>
            Q {currentQuestionIndex + 1} / {shuffledQuestions.length}
            {testData.negative > 0 && ` • Neg: -${testData.negative}`}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={18} color={colors.warning} />
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      <ConfirmationSheet
        isVisible={isConfirmSheetVisible}
        onClose={() => setIsConfirmSheetVisible(false)}
        onConfirm={handleSubmitTest}
        title="Submit Test"
        message="Are you sure you want to submit your test? You won't be able to change your answers after this."
        confirmText="Yes, Submit"
        cancelText="Keep Solving"
        confirmVariant="primary"
      />

      {/* Question List Dots */}
      <View style={styles.questionNav}>
        <ScrollView 
          ref={navScrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          {shuffledQuestions.map((q: any, idx: number) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = idx === currentQuestionIndex;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dot,
                  isAnswered && styles.dotAnswered,
                  isCurrent && styles.dotCurrent,
                ]}
                onPress={() => setCurrentQuestionIndex(idx)}
              >
                <Text style={[
                  styles.dotText,
                  isAnswered && styles.dotTextActive,
                  isCurrent && styles.dotTextCurrent,
                ]}>{idx + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question */}
        <View style={styles.questionContainer}>
          {!!currentQuestion.text && (
            <Text style={styles.questionText}>
              {String(currentQuestion.text).replace(/\\n/g, '\n')}
            </Text>
          )}
          {currentQuestion.questionImage && (
            <Image 
              source={{ uri: currentQuestion.questionImage }} 
              style={styles.questionImage} 
              resizeMode="contain"
            />
          )}
          
          {/* MATCH COLUMNS */}
          {currentQuestion.questionType === 'MATCH' && 
           currentQuestion.leftColumn && 
           currentQuestion.rightColumn && (
            <View style={styles.matchContainer}>
              <View style={styles.matchColumn}>
                <View style={[styles.matchHeader, { borderBottomColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Text style={[styles.matchHeaderText, { color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>COL A</Text>
                </View>
                {currentQuestion.leftColumn.map((item: string, idx: number) => (
                  <View key={`left-${idx}`} style={styles.matchItem}>
                    <View style={[styles.matchBadge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                      <Text style={[styles.matchBadgeText, { color: '#3b82f6' }]}>{String.fromCharCode(97 + idx)}</Text>
                    </View>
                    <Text style={styles.matchItemText}>{item.replace(/^[a-z]\)\s*/, '')}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.matchColumn}>
                <View style={[styles.matchHeader, { borderBottomColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Text style={[styles.matchHeaderText, { color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>COL B</Text>
                </View>
                {currentQuestion.rightColumn.map((item: string, idx: number) => (
                  <View key={`right-${idx}`} style={styles.matchItem}>
                    <View style={[styles.matchBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                      <Text style={[styles.matchBadgeText, { color: '#f59e0b' }]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.matchItemText}>{item.replace(/^\d+\)\s*/, '')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.shuffledOptions.map((optionData: any, idx: number) => {
            const { content, originalIndex } = optionData;
            const isSelected = currentAnswer?.selectedOption === originalIndex;
            const { text: optionText, image: optionImage } = normaliseOption(content);
            const label = String.fromCharCode(65 + idx);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
                onPress={() => handleOptionSelect(originalIndex)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                  {isSelected && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {label}
                </Text>
                <View style={styles.optionTextContainer}>
                  {!!optionImage && (
                    <Image 
                      source={{ uri: optionImage }} 
                      style={styles.optionImage} 
                      resizeMode="contain"
                    />
                  )}
                  {!!optionText && (
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {optionText}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Navigation — compact, matches web TestFooter proportions */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentQuestionIndex === 0}
          activeOpacity={0.7}
          style={[
            styles.footerBtn,
            styles.footerBtnSide,
            currentQuestionIndex === 0 && styles.footerBtnDisabled,
          ]}
        >
          <Text
            style={[
              styles.footerBtnText,
              currentQuestionIndex === 0 && styles.footerBtnTextDisabled,
            ]}
          >
            Prev
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex < shuffledQuestions.length - 1 && (
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={[styles.footerBtn, styles.footerBtnSide, styles.footerBtnSkip]}
          >
            <Text style={[styles.footerBtnText, styles.footerBtnTextMuted]}>Skip</Text>
          </TouchableOpacity>
        )}

        {currentQuestionIndex === shuffledQuestions.length - 1 ? (
          <TouchableOpacity
            onPress={() => setIsConfirmSheetVisible(true)}
            disabled={isSubmitting}
            activeOpacity={0.7}
            style={[styles.footerBtn, styles.footerBtnPrimary, styles.footerBtnSubmit]}
          >
            <Text style={styles.footerBtnTextSubmit}>
              {isSubmitting ? '...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            style={[styles.footerBtn, styles.footerBtnPrimary]}
          >
            <Text style={styles.footerBtnTextPrimary}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: AppPalette, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 56,
      backgroundColor: colors.backgroundElevated,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    headerTextWrap: {
      flex: 1,
      minWidth: 0,
      maxWidth: 250,
    },
    testName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    questionCount: {
      fontSize: 11,
      color: colors.textMuted,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
      flexShrink: 0,
    },
    timerText: {
      color: colors.warning,
      fontWeight: '700',
      fontSize: 12,
      fontVariant: ['tabular-nums'],
    },
    questionNav: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dot: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: colors.surfaceRaised,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 6,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    dotAnswered: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
    },
    dotCurrent: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    dotText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
    },
    dotTextActive: {
      color: isDark ? '#fff' : '#111',
    },
    dotTextCurrent: {
      color: isDark ? '#000' : '#fff',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 24,
    },
    questionContainer: {
      marginBottom: 20,
    },
    questionText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    questionImage: {
      width: '100%',
      height: 200,
      borderRadius: Radii.md,
      marginTop: 8,
    },
    optionsContainer: {
      gap: 10,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: colors.surface,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionCardSelected: {
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    optionRadio: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.textMuted,
      marginRight: 8,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionRadioSelected: {
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
    },
    optionRadioDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: '#fff',
    },
    optionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      marginRight: 8,
      marginTop: 1,
      width: 12,
    },
    optionLabelSelected: {
      color: '#60a5fa',
    },
    optionTextContainer: {
      flex: 1,
      minWidth: 0,
    },
    optionText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    optionTextSelected: {
      color: colors.text,
    },
    optionImage: {
      width: '100%',
      height: 120,
      borderRadius: 4,
      marginBottom: 8,
    },
    matchContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    matchColumn: {
      flex: 1,
      gap: 8,
    },
    matchHeader: {
      paddingBottom: 4,
      borderBottomWidth: 1,
      marginBottom: 4,
      alignSelf: 'flex-start',
    },
    matchHeaderText: {
      fontSize: 10,
      fontWeight: '700',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    matchItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    matchBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    matchBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    matchItemText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 20,
      backgroundColor: colors.backgroundElevated,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerBtn: {
      height: 28,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    footerBtnSide: {
      flex: 1,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    footerBtnSkip: {
      backgroundColor: 'transparent',
      borderColor: colors.borderStrong,
    },
    footerBtnPrimary: {
      flex: 1.4,
      backgroundColor: colors.accent,
      borderWidth: 0,
    },
    footerBtnSubmit: {
      backgroundColor: colors.success,
    },
    footerBtnDisabled: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      opacity: 0.6,
    },
    footerBtnText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },
    footerBtnTextMuted: {
      color: colors.textMuted,
    },
    footerBtnTextDisabled: {
      color: colors.textMuted,
    },
    footerBtnTextPrimary: {
      color: colors.primaryButtonText,
      fontSize: 11,
      fontWeight: '700',
    },
    footerBtnTextSubmit: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
  });
}
