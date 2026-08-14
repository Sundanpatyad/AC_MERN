import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SettingsShell } from '../../components/ui/SettingsShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { emptyMcq, normalizeOption, parseBulkQuestions, serializeSeries } from '../../lib/mockQuestions';
import { showMessage } from '../../providers/DialogProvider';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function EditTestScreen() {
  const params = useLocalSearchParams();
  const seriesId = paramValue(params.seriesId);
  const testIndex = Number(paramValue(params.testIndex) || 0);
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkType, setBulkType] = useState<'mcq' | 'match'>('mcq');

  const loadSeries = useCallback(async () => {
    if (!seriesId) return;
    try {
      const response = await apiConnector.get(`${endpoints.GET_MOCK_TEST_SERIES_BY_ID}/${seriesId}`, {
        params: { full: true },
        timeout: 30000,
      });
      if (response.data?.success) setSeries(response.data.data);
    } catch (error) {
      console.error('Failed to load test', error);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const test = series?.mockTests?.[testIndex];

  const updateTest = (patch: any) => {
    const mockTests = [...(series.mockTests || [])];
    mockTests[testIndex] = { ...mockTests[testIndex], ...patch };
    setSeries({ ...series, mockTests });
  };

  const updateQuestion = (questionIndex: number, patch: any) => {
    const questions = [...(test.questions || [])];
    questions[questionIndex] = { ...questions[questionIndex], ...patch };
    updateTest({ questions });
  };

  const save = async () => {
    if (!seriesId || !series) return;
    setSaving(true);
    try {
      const response = await apiConnector.put(
        `${endpoints.UPDATE_MOCK_TEST_SERIES}/${seriesId}`,
        serializeSeries(series),
        { timeout: 30000 }
      );
      if (!response.data?.success) throw new Error(response.data?.message || 'Save failed');
      setSeries(response.data.data);
      await showMessage({ title: 'Saved', message: 'This test was updated.' });
    } catch (error: any) {
      await showMessage({
        title: 'Could not save',
        message: error?.response?.data?.message || error?.message || 'Try again.',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const importBulk = () => {
    const parsed = parseBulkQuestions(bulkText, bulkType);
    if (!parsed.length) {
      showMessage({ title: 'No questions found', message: 'Check the 6-line MCQ or 14-line match format.' });
      return;
    }
    updateTest({ questions: [...(test.questions || []), ...parsed] });
    setBulkText('');
    showMessage({ title: 'Imported', message: `${parsed.length} questions added. Save to keep them.` });
  };

  if (loading || !test) {
    return (
      <SettingsShell title="Edit test">
        <Text style={{ color: colors.textSecondary }}>{loading ? 'Loading…' : 'Test not found.'}</Text>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title={test.testName || 'Edit test'} contentStyle={{ paddingTop: 4 }}>
      <ScrollView scrollEnabled={false}>
        <Input label="Test name" value={test.testName || ''} onChangeText={(v) => updateTest({ testName: v })} />
        <Input
          label="Duration (min)"
          value={String(test.duration ?? '')}
          onChangeText={(v) => updateTest({ duration: v })}
          keyboardType="numeric"
        />
        <Input
          label="Negative marking"
          value={String(test.negative ?? '')}
          onChangeText={(v) => updateTest({ negative: v })}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Status</Text>
        <View style={styles.row}>
          {(['published', 'draft'] as const).map((id) => (
            <Pressable
              key={id}
              onPress={() => updateTest({ status: id })}
              style={[
                styles.chip,
                {
                  borderColor: test.status === id ? colors.text : colors.border,
                  backgroundColor: test.status === id ? colors.text : 'transparent',
                },
              ]}
            >
              <Text style={{ color: test.status === id ? colors.background : colors.textSecondary, fontSize: 12, fontFamily: Fonts.medium }}>
                {id}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Questions ({test.questions?.length || 0})</Text>
        {(test.questions || []).map((question: any, index: number) => {
          const options = (question.options || []).map(normalizeOption);
          const optionValue = (option: any) => option.text || option.image || '';
          const selectedValue = question.correctAnswer || '';
          return (
            <Card key={`${index}-${question.text}`} padding={14} style={{ marginBottom: 10 }}>
              <Text style={styles.qIndex}>Q{index + 1} · {question.questionType || 'MCQ'}</Text>
              <Input
                label="Question"
                value={question.text || ''}
                onChangeText={(v) => updateQuestion(index, { text: v })}
                multiline
              />
              {options.slice(0, question.questionType === 'MATCH' ? options.length : 4).map((option: any, optionIndex: number) => (
                <Input
                  key={optionIndex}
                  label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                  value={typeof option === 'string' ? option : option.text}
                  onChangeText={(v) => {
                    const next = options.map((item: any, i: number) =>
                      i === optionIndex ? { ...normalizeOption(item), text: v } : item
                    );
                    const previous = optionValue(option);
                    updateQuestion(index, {
                      options: next,
                      correctAnswer: selectedValue === previous ? v : selectedValue,
                    });
                  }}
                />
              ))}

              <Text style={styles.label}>Correct answer</Text>
              <View style={styles.answerList}>
                {options.length === 0 ? (
                  <Text style={styles.hint}>Add option text first, then select the correct one.</Text>
                ) : (
                  options.map((option: any, optionIndex: number) => {
                    const value = optionValue(option);
                    const label =
                      option.text ||
                      (option.image ? `Image option ${String.fromCharCode(65 + optionIndex)}` : `Option ${String.fromCharCode(65 + optionIndex)}`);
                    const selected = Boolean(value) && selectedValue === value;
                    return (
                      <Pressable
                        key={`${optionIndex}-${value}`}
                        onPress={() => {
                          if (!value) return;
                          updateQuestion(index, { correctAnswer: value });
                        }}
                        style={[
                          styles.answerRow,
                          {
                            borderColor: selected ? colors.text : colors.border,
                            backgroundColor: selected ? colors.surfaceRaised : colors.surface,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.radio,
                            {
                              borderColor: selected ? colors.text : colors.borderStrong,
                              backgroundColor: selected ? colors.text : 'transparent',
                            },
                          ]}
                        >
                          {selected ? <View style={[styles.radioDot, { backgroundColor: colors.background }]} /> : null}
                        </View>
                        <Text style={[styles.answerLetter, { color: colors.text }]}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Text>
                        <Text style={[styles.answerText, { color: value ? colors.text : colors.textMuted }]} numberOfLines={2}>
                          {label || 'Type this option first'}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <Pressable
                onPress={() => {
                  const questions = [...(test.questions || [])];
                  questions.splice(index, 1);
                  updateTest({ questions });
                }}
              >
                <Text style={styles.delete}>Remove question</Text>
              </Pressable>
            </Card>
          );
        })}
        <Button title="Add MCQ" onPress={() => updateTest({ questions: [...(test.questions || []), emptyMcq()] })} variant="outline" />

        <Text style={styles.section}>Bulk import</Text>
        <View style={styles.row}>
          {(['mcq', 'match'] as const).map((id) => (
            <Pressable
              key={id}
              onPress={() => setBulkType(id)}
              style={[
                styles.chip,
                {
                  borderColor: bulkType === id ? colors.text : colors.border,
                  backgroundColor: bulkType === id ? colors.text : 'transparent',
                },
              ]}
            >
              <Text style={{ color: bulkType === id ? colors.background : colors.textSecondary, fontSize: 12, fontFamily: Fonts.medium }}>
                {id.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>
          {bulkType === 'mcq'
            ? '6 lines per question: text, 4 options, correct answer.'
            : '14 lines per match question: text, 4 left, 4 right, 5 mappings.'}
        </Text>
        <Input
          label="Paste questions"
          value={bulkText}
          onChangeText={setBulkText}
          multiline
          style={{ minHeight: 140, textAlignVertical: 'top' }}
        />
        <Button title="Import questions" onPress={importBulk} variant="secondary" />
        <Button title="Save test" onPress={save} isLoading={saving} />
        {test._id ? (
          <Button
            title="Start now"
            onPress={() => router.push(`/take-test/${test._id}?seriesId=${seriesId}`)}
            variant="outline"
          />
        ) : null}
      </ScrollView>
    </SettingsShell>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    label: {
      marginTop: 10,
      marginBottom: 8,
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      minHeight: 34,
      paddingHorizontal: 12,
      borderRadius: Radii.pill,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      marginTop: 22,
      marginBottom: 10,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    hint: {
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      marginBottom: 10,
      lineHeight: 18,
    },
    qIndex: {
      fontSize: 12,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      marginBottom: 6,
    },
    delete: {
      marginTop: 8,
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: colors.danger,
    },
    answerList: {
      gap: 8,
      marginBottom: 8,
    },
    answerRow: {
      minHeight: 48,
      borderWidth: 1,
      borderRadius: Radii.md,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    answerLetter: {
      fontSize: 13,
      fontFamily: Fonts.semiBold,
      width: 16,
    },
    answerText: {
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.sans,
    },
  });
}
