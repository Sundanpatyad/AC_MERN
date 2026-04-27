import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { ConfirmationSheet } from '../../components/ui/ConfirmationSheet';

export default function TakeTestScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
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
    try {
      const response = await apiConnector.get(endpoints.GET_ALL_MOCK_TESTS);
      if (response.data?.success) {
        let foundTest = null;
        for (const series of response.data.data) {
          const test = series.mockTests?.find((t: any) => t._id === id);
          if (test) {
            foundTest = { ...test, seriesId: series._id };
            break;
          }
        }
        
        if (foundTest) {
          // Shuffling logic
          const questionsWithOriginalData = foundTest.questions.map((q: any) => {
            // Shuffle options but keep track of their original content
            const optionsToProcess = q.questionType === 'MATCH' ? q.options.slice(0, 4) : q.options;
            const optionsWithOriginalIndex = optionsToProcess.map((opt: any, idx: number) => ({
              content: opt,
              originalIndex: idx
            }));
            const shuffledOptions = shuffle(optionsWithOriginalIndex);
            return {
              ...q,
              shuffledOptions
            };
          });

          const randomizedQuestions = shuffle(questionsWithOriginalData);
          setTestData(foundTest);
          setShuffledQuestions(randomizedQuestions);

          if (!isTestActive) {
            startTest(foundTest.duration);
          }
        } else {
          Toast.show({ type: 'error', text1: 'Test not found' });
          router.back();
        }
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
      Toast.show({ type: 'error', text1: 'Failed to load test' });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Auto-scroll logic for question navigation dots
  useEffect(() => {
    if (navScrollViewRef.current) {
      const dotWidth = 40; // 32 width + 8 margin
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
        Toast.show({ type: 'success', text1: 'Test Submitted Successfully' });
        router.replace({
          pathname: '/test-result',
          params: { attemptData: JSON.stringify(attemptData) }
        });
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      Toast.show({ type: 'error', text1: error.message || 'Failed to submit test' });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: '#fff' }}>Loading Test...</Text>
      </View>
    );
  }

  if (!testData || !shuffledQuestions?.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: '#fff' }}>No questions available for this test.</Text>
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
        <View style={{ flex: 1 }}>
          <Text style={styles.testName} numberOfLines={1}>{testData.testName}</Text>
          <Text style={styles.questionCount}>
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            {testData.negative > 0 && ` • Neg: -${testData.negative}`}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#f59e0b" />
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
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
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
            const optionText = typeof content === 'string' ? content : content.text;
            const optionImage = typeof content === 'object' ? content.image : null;

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
                onPress={() => handleOptionSelect(originalIndex)}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]} />
                  <View style={styles.optionTextContainer}>
                    {optionText && <Text style={styles.optionText}>{optionText}</Text>}
                    {optionImage && (
                      <Image 
                        source={{ uri: optionImage }} 
                        style={styles.optionImage} 
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Button 
          title="Prev" 
          onPress={handlePrev} 
          disabled={currentQuestionIndex === 0}
          variant="outline"
          style={styles.navButton}
        />

        {currentQuestionIndex < shuffledQuestions.length - 1 && (
          <Button 
            title="Skip" 
            onPress={handleSkip} 
            variant="outline"
            style={styles.navButton}
          />
        )}
        
        {currentQuestionIndex === shuffledQuestions.length - 1 ? (
          <Button 
            title="Submit" 
            onPress={() => setIsConfirmSheetVisible(true)}
            isLoading={isSubmitting}
            style={[styles.navButton, { backgroundColor: '#10b981', borderColor: '#10b981' }]}
            textStyle={{ color: '#fff' }}
          />
        ) : (
          <Button 
            title="Next" 
            onPress={handleNext}
            style={styles.navButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  testName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  questionCount: {
    fontSize: 11,
    color: '#666',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  timerText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  questionNav: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  dotAnswered: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  dotCurrent: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  dotText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
  },
  dotTextActive: {
    color: '#fff',
  },
  dotTextCurrent: {
    color: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  optionCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  optionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
  },
  optionRadioSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  optionImage: {
    width: '100%',
    height: 150,
    borderRadius: 4,
    marginTop: 8,
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
    backgroundColor: '#0f0f0f',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
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
    color: '#ccc',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 0,
  },
});
