import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SettingsShell } from '../../../components/ui/SettingsShell';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { apiConnector } from '../../../services/api';
import { endpoints } from '../../../constants/api';
import { serializeSeries } from '../../../lib/mockQuestions';
import { showMessage } from '../../../providers/DialogProvider';
import { AppPalette, Fonts, Radii } from '../../../constants/theme';
import { useTheme } from '../../../providers/AppThemeProvider';

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function EditSeriesScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = paramValue(rawId);
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkName, setBulkName] = useState('');
  const [bulkDuration, setBulkDuration] = useState('60');
  const [bulkText, setBulkText] = useState('');
  const [omrName, setOmrName] = useState('');
  const [omrPaper, setOmrPaper] = useState('');
  const [omrKey, setOmrKey] = useState('');
  const [omrSheet, setOmrSheet] = useState('');

  const loadSeries = useCallback(async () => {
    if (!id) return;
    try {
      const response = await apiConnector.get(`${endpoints.GET_MOCK_TEST_SERIES_BY_ID}/${id}`, {
        params: { full: true },
        timeout: 30000,
      });
      if (response.data?.success) setSeries(response.data.data);
    } catch (error) {
      console.error('Failed to load series', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const saveSeries = async (next = series) => {
    if (!id || !next) return false;
    setSaving(true);
    try {
      const response = await apiConnector.put(
        `${endpoints.UPDATE_MOCK_TEST_SERIES}/${id}`,
        serializeSeries(next),
        { timeout: 30000 }
      );
      if (!response.data?.success) throw new Error(response.data?.message || 'Save failed');
      setSeries(response.data.data);
      return true;
    } catch (error: any) {
      await showMessage({
        title: 'Could not save',
        message: error?.response?.data?.message || error?.message || 'Try again.',
        tone: 'danger',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addEmptyTest = async () => {
    const next = {
      ...series,
      mockTests: [
        ...(series.mockTests || []),
        { testName: `Test ${(series.mockTests?.length || 0) + 1}`, duration: 60, negative: 0.25, questions: [], status: 'draft' },
      ],
    };
    const ok = await saveSeries(next);
    if (ok) {
      const index = (next.mockTests?.length || 1) - 1;
      router.push(`/admin/edit-test?seriesId=${id}&testIndex=${index}`);
    }
  };

  const addBulkTest = async () => {
    if (!bulkName.trim() || !bulkText.trim()) {
      await showMessage({ title: 'Missing fields', message: 'Add a test name and pasted questions.' });
      return;
    }
    setSaving(true);
    try {
      const response = await apiConnector.post(endpoints.ADD_MOCKTEST_TO_SERIES, {
        seriesId: id,
        testName: bulkName.trim(),
        testData: bulkText,
        duration: Number(bulkDuration) || 60,
      });
      if (response.data?.updatedSeries) {
        setSeries(response.data.updatedSeries);
      } else {
        await loadSeries();
      }
      setBulkName('');
      setBulkText('');
      await showMessage({ title: 'Test added', message: 'Bulk questions were added to this series.' });
    } catch (error: any) {
      await showMessage({
        title: 'Could not add test',
        message: error?.response?.data?.message || error?.message || 'Check the 6-line MCQ format.',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const addAttachment = async () => {
    if (!omrName.trim()) {
      await showMessage({ title: 'Missing name', message: 'Give this OMR set a name.' });
      return;
    }
    setSaving(true);
    try {
      await apiConnector.post(`${endpoints.ADD_SERIES_ATTACHMENTS}/${id}/attachments`, {
        name: omrName.trim(),
        questionPaper: omrPaper.trim(),
        answerKey: omrKey.trim(),
        omrSheet: omrSheet.trim(),
      });
      setOmrName('');
      setOmrPaper('');
      setOmrKey('');
      setOmrSheet('');
      await loadSeries();
    } catch (error: any) {
      await showMessage({
        title: 'Could not add attachment',
        message: error?.response?.data?.message || error?.message || 'Try again.',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !series) {
    return (
      <SettingsShell title="Edit series">
        <Text style={{ color: colors.textSecondary }}>{loading ? 'Loading…' : 'Series not found.'}</Text>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Edit series" contentStyle={{ paddingTop: 4 }}>
      <ScrollView scrollEnabled={false}>
        <Input label="Series name" value={series.seriesName || ''} onChangeText={(v) => setSeries({ ...series, seriesName: v })} />
        <Input
          label="Description"
          value={series.description || ''}
          onChangeText={(v) => setSeries({ ...series, description: v })}
          multiline
        />
        <Input
          label="Price (₹)"
          value={String(series.price ?? '')}
          onChangeText={(v) => setSeries({ ...series, price: v })}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Status</Text>
        <View style={styles.row}>
          {(['published', 'draft'] as const).map((id) => (
            <Pressable
              key={id}
              onPress={() => setSeries({ ...series, status: id })}
              style={[
                styles.chip,
                {
                  borderColor: series.status === id ? colors.text : colors.border,
                  backgroundColor: series.status === id ? colors.text : 'transparent',
                },
              ]}
            >
              <Text style={{ color: series.status === id ? colors.background : colors.textSecondary, fontSize: 12, fontFamily: Fonts.medium }}>
                {id}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button title="Save series" onPress={() => saveSeries()} isLoading={saving} />

        <Text style={styles.section}>Tests</Text>
        {(series.mockTests || []).map((test: any, index: number) => (
          <Card key={test._id || index} padding={14} style={{ marginBottom: 8 }}>
            <Text style={styles.testName}>{test.testName || `Test ${index + 1}`}</Text>
            <Text style={styles.meta}>
              {test.status || 'draft'} · {test.duration || 0} min · {test.questions?.length || 0} questions
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={() => router.push(`/admin/edit-test?seriesId=${id}&testIndex=${index}`)}>
                <Text style={styles.link}>Edit</Text>
              </Pressable>
              {test._id ? (
                <Pressable onPress={() => router.push(`/take-test/${test._id}?seriesId=${id}`)}>
                  <Text style={styles.link}>Start now</Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
        ))}
        <Button title="Add empty test" onPress={addEmptyTest} variant="outline" disabled={saving} />

        <Text style={styles.section}>Bulk add test</Text>
        <Text style={styles.hint}>Paste MCQs as 6 lines each: question, 4 options, correct answer.</Text>
        <Input label="Test name" value={bulkName} onChangeText={setBulkName} placeholder="Paper 1" />
        <Input label="Duration (min)" value={bulkDuration} onChangeText={setBulkDuration} keyboardType="numeric" />
        <Input
          label="Questions"
          value={bulkText}
          onChangeText={setBulkText}
          placeholder={'What is 2+2?\n1\n2\n3\n4\n4'}
          multiline
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <Button title="Add bulk test" onPress={addBulkTest} variant="secondary" disabled={saving} />

        <Text style={styles.section}>OMR attachments</Text>
        {(series.attachments || []).map((item: any, index: number) => (
          <Card key={item._id || index} padding={14} style={{ marginBottom: 8 }}>
            <Text style={styles.testName}>{item.name || 'Attachment'}</Text>
            <Text style={styles.meta}>{item.questionPaper || 'No paper URL'}</Text>
          </Card>
        ))}
        <Input label="Name" value={omrName} onChangeText={setOmrName} placeholder="OMR Test 1" />
        <Input label="Question paper URL" value={omrPaper} onChangeText={setOmrPaper} autoCapitalize="none" />
        <Input label="Answer key URL" value={omrKey} onChangeText={setOmrKey} autoCapitalize="none" />
        <Input label="OMR sheet URL" value={omrSheet} onChangeText={setOmrSheet} autoCapitalize="none" />
        <Button title="Add attachment" onPress={addAttachment} variant="outline" disabled={saving} />
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
    testName: {
      fontSize: 14,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    meta: {
      marginTop: 4,
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 10,
    },
    link: {
      fontSize: 13,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
  });
}
