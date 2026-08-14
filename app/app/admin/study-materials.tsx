import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { SettingsShell } from '../../components/ui/SettingsShell';
import { Card } from '../../components/ui/Card';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { AppPalette, Fonts } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function StudyMaterialsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [exams, setExams] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [examsRes, materialsRes] = await Promise.all([
        apiConnector.get(endpoints.GET_EXAMS).catch(() => null),
        apiConnector.get(endpoints.GET_STUDY_MATERIALS).catch(() => null),
      ]);
      setExams(examsRes?.data?.data || examsRes?.data || []);
      setMaterials(materialsRes?.data?.data || materialsRes?.data || []);
    } catch (error) {
      console.error('Study materials failed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SettingsShell title="Study Materials">
      <ScrollView
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={colors.refreshTint}
          />
        }
      >
        <Text style={styles.section}>Exams</Text>
        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : exams.length === 0 ? (
          <Text style={styles.empty}>No exams yet.</Text>
        ) : (
          exams.map((exam) => (
            <Card key={exam._id} padding={14} style={{ marginBottom: 8 }}>
              <Text style={styles.title}>{exam.examName || exam.name}</Text>
            </Card>
          ))
        )}

        <Text style={[styles.section, { marginTop: 20 }]}>PDFs</Text>
        {materials.length === 0 ? (
          <Text style={styles.empty}>No study materials yet.</Text>
        ) : (
          materials.map((item) => (
            <Card key={item._id} padding={14} style={{ marginBottom: 8 }}>
              <Text style={styles.title}>{item.title || item.name}</Text>
              {item.examName || item.exam?.examName ? (
                <Text style={styles.meta}>{item.examName || item.exam?.examName}</Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </SettingsShell>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    section: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 10,
    },
    title: {
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
    empty: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      marginBottom: 8,
    },
  });
}
