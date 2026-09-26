import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { useAuthStore } from '../../store/authStore';
import { showMessage } from '../../providers/DialogProvider';
import { itemKey } from '../../utils/itemKey';
import { MediaImage } from '../../components/MediaImage';

const PAGE_SIZE = 8;

export type StudyPdf = {
  _id: string;
  title: string;
  description: string;
  category: string;
  access: 'free' | 'paid';
  price: number;
  canView: boolean;
  soldAsSet?: boolean;
};

export type StudyExam = {
  _id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  access: 'free' | 'paid';
  price: number;
  pdfCount: number;
  owned: boolean;
};

type CategoryChip = { name: string; count: number };

function FileMark({ colors, large = false }: { colors: AppPalette; large?: boolean }) {
  return (
    <View
      style={[
        fileStyles.sheet,
        large && fileStyles.sheetLarge,
        { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
      ]}
    >
      <View style={[fileStyles.fold, { backgroundColor: colors.background }]} />
      <Ionicons name="document-text" size={large ? 26 : 20} color={colors.text} />
      <Text style={[fileStyles.label, { color: colors.textSecondary }]}>PDF</Text>
    </View>
  );
}

const fileStyles = StyleSheet.create({
  sheet: {
    width: 46,
    height: 56,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  sheetLarge: {
    width: 56,
    height: 68,
  },
  fold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderBottomLeftRadius: 6,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.6,
    fontFamily: Fonts.semiBold,
  },
});

export async function purchaseStudyPdf(item: StudyPdf, user: { email?: string; firstName?: string; lastName?: string } | null) {
  const orderResponse = await apiConnector.post(endpoints.PDF_ORDER(item._id));
  const order = orderResponse.data;
  if (!order?.orderId || !order?.key) {
    throw new Error(order?.message || 'Could not start payment');
  }
  if (!RazorpayCheckout?.open) {
    throw new Error('Razorpay is not available in Expo Go. Use a development build to pay.');
  }
  const payment = await RazorpayCheckout.open({
    description: item.title,
    image: 'https://awakeningclasses.in/logo.png',
    currency: order.currency || 'INR',
    key: order.key,
    amount: order.amount,
    name: 'Awakening Classes',
    order_id: order.orderId,
    prefill: {
      email: user?.email || '',
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    },
    theme: { color: '#111111' },
  });
  await apiConnector.post(endpoints.PDF_VERIFY(item._id), {
    razorpay_order_id: payment.razorpay_order_id,
    razorpay_payment_id: payment.razorpay_payment_id,
    razorpay_signature: payment.razorpay_signature,
  });
}

export async function purchaseStudyExam(item: StudyExam, user: { email?: string; firstName?: string; lastName?: string } | null) {
  const orderResponse = await apiConnector.post(endpoints.PDF_EXAM_ORDER(item._id));
  const order = orderResponse.data;
  if (!order?.orderId || !order?.key) {
    throw new Error(order?.message || 'Could not start payment');
  }
  if (!RazorpayCheckout?.open) {
    throw new Error('Razorpay is not available in Expo Go. Use a development build to pay.');
  }
  const payment = await RazorpayCheckout.open({
    description: item.name,
    image: 'https://awakeningclasses.in/logo.png',
    currency: order.currency || 'INR',
    key: order.key,
    amount: order.amount,
    name: 'Awakening Classes',
    order_id: order.orderId,
    prefill: {
      email: user?.email || '',
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    },
    theme: { color: '#111111' },
  });
  await apiConnector.post(endpoints.PDF_EXAM_VERIFY(item._id), {
    razorpay_order_id: payment.razorpay_order_id,
    razorpay_payment_id: payment.razorpay_payment_id,
    razorpay_signature: payment.razorpay_signature,
  });
}

export default function StudyLibraryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [materials, setMaterials] = useState<StudyPdf[]>([]);
  const [exams, setExams] = useState<StudyExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<StudyExam | null>(null);
  const [categories, setCategories] = useState<CategoryChip[]>([]);
  const [selected, setSelected] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        if (!selectedExam) {
          const params: Record<string, string> = {};
          if (query) params.q = query;
          if (selected !== 'all') params.category = selected;
          const response = await apiConnector.get(endpoints.PDF_EXAMS, { params });
          setExams(response.data?.data || []);
          setMaterials([]);
          setCategories(response.data?.categories || []);
          setHasMore(false);
          setPage(1);
          return;
        }
        const params: Record<string, string> = {
          page: String(nextPage),
          limit: String(PAGE_SIZE),
          exam: selectedExam._id,
        };
        if (query) params.q = query;
        const response = await apiConnector.get(endpoints.PDF_LIST, { params });
        const next = response.data?.data || [];
        setMaterials((current) => (append ? [...current, ...next] : next));
        setHasMore(Boolean(response.data?.hasMore));
        setPage(nextPage);
      } catch {
        if (!append) showMessage({ title: 'Could not load', message: "Couldn't load study material", tone: 'danger' });
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [query, selected, selectedExam]
  );

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const buyExam = async (exam: StudyExam) => {
    try {
      setBuyingId(exam._id);
      await purchaseStudyExam(exam, user);
      showMessage({ title: 'Unlocked', message: 'Every PDF in this exam is now available.', tone: 'success' });
      setSelectedExam({ ...exam, owned: true });
    } catch (error: any) {
      const cancelled = error?.code === 0 || error?.code === 2;
      if (!cancelled) {
        showMessage({
          title: 'Payment',
          message: error?.response?.data?.message || error?.description || error?.message || 'Could not complete payment',
          tone: 'danger',
        });
      }
    } finally {
      setBuyingId(null);
    }
  };

  const openMaterial = async (item: StudyPdf) => {
    if (item.soldAsSet && !item.canView && selectedExam) {
      await buyExam(selectedExam);
      return;
    }
    if (item.canView) {
      router.push(`/study-material/${item._id}`);
      return;
    }
    try {
      setBuyingId(item._id);
      await purchaseStudyPdf(item, user);
      showMessage({ title: 'Unlocked', message: 'You can read this material now.', tone: 'success' });
      router.push(`/study-material/${item._id}`);
    } catch (error: any) {
      const cancelled = error?.code === 0 || error?.code === 2;
      if (!cancelled) {
        showMessage({
          title: 'Payment',
          message: error?.response?.data?.message || error?.description || error?.message || 'Could not complete payment',
          tone: 'danger',
        });
      }
    } finally {
      setBuyingId(null);
    }
  };

  const totalPapers = selectedExam
    ? selectedExam.pdfCount
    : categories.reduce((sum, item) => sum + item.count, 0);
  const chips = [
    { name: 'all', label: 'All', count: totalPapers },
    ...categories.map((item) => ({ name: item.name, label: item.name, count: item.count })),
  ];

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => (selectedExam ? setSelectedExam(null) : router.back())}
            hitSlop={8}
            accessibilityLabel="Go back"
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{selectedExam ? selectedExam.name : 'Study material'}</Text>
            <Text style={styles.headerSub}>
              {selectedExam
                ? selectedExam.access === 'paid'
                  ? selectedExam.owned
                    ? 'Unlocked — every PDF is included'
                    : `₹${selectedExam.price} unlocks every PDF`
                  : 'Each PDF is priced on its own'
                : totalPapers > 0
                  ? `${totalPapers} exams`
                  : 'Pick an exam folder'}
            </Text>
          </View>
          <View style={[styles.viewSwitch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(['list', 'grid'] as const).map((mode) => {
              const active = view === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setView(mode)}
                  accessibilityLabel={mode === 'list' ? 'List view' : 'Grid view'}
                  style={[styles.viewBtn, active && { backgroundColor: colors.text }]}
                >
                  <Ionicons
                    name={mode === 'list' ? 'list' : 'grid'}
                    size={16}
                    color={active ? colors.primaryButtonText : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={selectedExam ? 'Search papers' : 'Search exams'}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel={selectedExam ? 'Search papers' : 'Search exams'}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          horizontal
          data={chips}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const active = selected === item.name;
            return (
              <Pressable
                onPress={() => {
                  setSelectedExam(null);
                  setSelected(item.name);
                }}
                style={[styles.chip, active ? styles.chipActive : { backgroundColor: colors.surfaceRaised }]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={[styles.chipCount, active && styles.chipCountActive]}>{item.count}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        key={`${view}-${selectedExam?._id || 'exams'}`}
        data={selectedExam ? materials : exams}
        keyExtractor={(item, index) => itemKey(item._id, index)}
        numColumns={view === 'grid' ? 2 : 1}
        columnWrapperStyle={view === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 28 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.refreshTint}
            onRefresh={() => {
              setRefreshing(true);
              loadPage(1, false);
            }}
          />
        }
        onEndReached={() => {
          if (hasMore && !loading && !loadingMore) loadPage(page + 1, true);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="documents-outline" size={28} color={colors.textMuted} />
              <Text style={styles.empty}>{selectedExam ? 'No papers found' : 'No exams found'}</Text>
            </View>
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.text} style={{ marginVertical: 16 }} /> : null}
        ListHeaderComponent={
          selectedExam && selectedExam.access === 'paid' && !selectedExam.owned ? (
            <Pressable
              onPress={() => buyExam(selectedExam)}
              disabled={buyingId === selectedExam._id}
              style={[styles.buyBanner, { backgroundColor: colors.text }]}
            >
              <Text style={[styles.buyBannerText, { color: colors.primaryButtonText }]}>
                {buyingId === selectedExam._id ? 'Opening payment…' : `Buy exam ₹${selectedExam.price}`}
              </Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => {
          if (!selectedExam) {
            const exam = item as StudyExam;
            const locked = exam.access === 'paid' && !exam.owned;
            const grid = view === 'grid';
            return (
              <Pressable
                onPress={() => setSelectedExam(exam)}
                style={({ pressed }) => [
                  grid ? styles.gridCard : styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.94 : 1 },
                ]}
              >
                <View
                  style={[
                    fileStyles.sheet,
                    grid && fileStyles.sheetLarge,
                    { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
                  ]}
                >
                  {exam.thumbnail ? (
                    <MediaImage uri={exam.thumbnail} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                  ) : (
                    <Ionicons name="folder" size={grid ? 26 : 20} color={colors.text} />
                  )}
                </View>
                <View style={grid ? styles.gridBody : styles.cardBody}>
                  <Text style={grid ? styles.gridTitle : styles.title} numberOfLines={grid ? 2 : 1}>
                    {exam.name}
                  </Text>
                  <Text style={styles.category} numberOfLines={1}>
                    {exam.pdfCount} PDF{exam.pdfCount === 1 ? '' : 's'}
                  </Text>
                </View>
                <View style={grid ? styles.gridSide : styles.side}>
                  <View style={styles.statusSlot}>
                    {locked ? (
                      <View style={[styles.pricePill, { backgroundColor: colors.text }]}>
                        <Text style={[styles.price, { color: colors.primaryButtonText }]}>₹{exam.price}</Text>
                      </View>
                    ) : (
                      <Text style={styles.status}>{exam.access === 'paid' ? 'Unlocked' : 'Open'}</Text>
                    )}
                  </View>
                  <View style={[styles.action, { backgroundColor: colors.text }]}>
                    <Ionicons name="folder-open-outline" size={13} color={colors.primaryButtonText} />
                    <Text style={[styles.actionText, { color: colors.primaryButtonText }]} numberOfLines={1}>
                      Open
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }
          const pdf = item as StudyPdf;
          const locked = !pdf.canView;
          const status = locked ? (pdf.soldAsSet ? 'Included' : `₹${pdf.price}`) : pdf.access === 'paid' ? 'Unlocked' : 'Free';
          const action = buyingId === pdf._id ? '…' : locked ? (pdf.soldAsSet ? 'Buy exam' : 'Buy') : 'Read';
          const grid = view === 'grid';
          const category = pdf.category || 'General';
          return (
            <Pressable
              onPress={() => openMaterial(pdf)}
              disabled={buyingId === pdf._id}
              style={({ pressed }) => [
                grid ? styles.gridCard : styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.94 : 1 },
              ]}
            >
              <FileMark colors={colors} large={grid} />
              <View style={grid ? styles.gridBody : styles.cardBody}>
                <Text style={grid ? styles.gridTitle : styles.title} numberOfLines={grid ? 2 : 1}>
                  {pdf.title}
                </Text>
                {!grid && pdf.description ? (
                  <Text style={styles.description} numberOfLines={1}>{pdf.description}</Text>
                ) : null}
                <Text style={styles.category} numberOfLines={1}>{category}</Text>
              </View>
              <View style={grid ? styles.gridSide : styles.side}>
                <View style={styles.statusSlot}>
                  {locked && !pdf.soldAsSet ? (
                    <View style={[styles.pricePill, { backgroundColor: colors.text }]}>
                      <Text style={[styles.price, { color: colors.primaryButtonText }]}>₹{pdf.price}</Text>
                    </View>
                  ) : (
                    <Text style={styles.status}>{status}</Text>
                  )}
                </View>
                <View
                  style={[
                    styles.action,
                    { backgroundColor: colors.text },
                    buyingId === pdf._id && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name={locked ? 'lock-closed' : 'book-outline'}
                    size={13}
                    color={colors.primaryButtonText}
                  />
                  <Text style={[styles.actionText, { color: colors.primaryButtonText }]} numberOfLines={1}>
                    {action}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCopy: {
      flex: 1,
      gap: 2,
    },
    viewSwitch: {
      flexDirection: 'row',
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.pill,
      padding: 3,
      gap: 2,
    },
    viewBtn: {
      width: 32,
      height: 28,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.4,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    buyBanner: {
      alignSelf: 'stretch',
      borderRadius: Radii.pill,
      paddingVertical: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    buyBannerText: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: Fonts.semiBold,
    },
    headerSub: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 44,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.pill,
      paddingHorizontal: 14,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: Fonts.sans,
      fontSize: 15,
      paddingVertical: 0,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    chips: {
      gap: 8,
      paddingRight: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: Radii.pill,
      paddingLeft: 12,
      paddingRight: 8,
      paddingVertical: 7,
    },
    chipActive: {
      backgroundColor: colors.text,
    },
    chipText: {
      color: colors.text,
      fontFamily: Fonts.medium,
      fontSize: 13,
      maxWidth: 140,
    },
    chipTextActive: {
      color: colors.primaryButtonText,
    },
    chipCount: {
      minWidth: 18,
      textAlign: 'center',
      color: colors.textMuted,
      fontFamily: Fonts.semiBold,
      fontSize: 11,
    },
    chipCountActive: {
      color: colors.primaryButtonText,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 14,
      flexGrow: 1,
    },
    gridRow: {
      alignItems: 'stretch',
      gap: 12,
      marginBottom: 12,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.lg,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 10,
      minHeight: 84,
    },
    gridCard: {
      flex: 1,
      flexBasis: '47%',
      maxWidth: '48%',
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.lg,
      padding: 14,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: 2,
    },
    side: {
      flexShrink: 0,
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 6,
    },
    gridSide: {
      alignSelf: 'stretch',
      marginTop: 12,
      gap: 8,
    },
    statusSlot: {
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gridBody: {
      flex: 1,
      marginTop: 12,
      justifyContent: 'flex-start',
      gap: 8,
    },
    title: {
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.2,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    gridTitle: {
      height: 40,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.2,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    description: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    category: {
      flex: 1,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    status: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    pricePill: {
      borderRadius: Radii.pill,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    price: {
      fontSize: 13,
      lineHeight: 16,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.2,
      ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
    },
    action: {
      minWidth: 78,
      height: 34,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end',
      gap: 6,
      borderRadius: Radii.pill,
      paddingHorizontal: 14,
    },
    actionWide: {
      alignSelf: 'stretch',
    },
    actionText: {
      fontSize: 13,
      lineHeight: 16,
      fontFamily: Fonts.semiBold,
      flexShrink: 0,
      ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
    },
    emptyWrap: {
      alignItems: 'center',
      gap: 8,
      marginTop: 48,
    },
    empty: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontFamily: Fonts.sans,
      fontSize: 14,
    },
  });
}
