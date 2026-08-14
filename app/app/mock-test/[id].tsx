import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';

import { isInstructorAccount, useAuthStore } from '../../store/authStore';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { Button } from '../../components/ui/Button';
import { DetailSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { showMessage } from '../../providers/DialogProvider';

function stripHtml(value?: string) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeIndianMobile(value?: string | number | null) {
  if (value == null || value === '') return undefined;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return undefined;
}

async function pollNativePaymentStatus(orderId: string) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    try {
      const res = await apiConnector.get(`${endpoints.PAYMENT_STATUS}/${orderId}`, {
        timeout: 15000,
      });
      if (res.data?.data?.status === 'paid') return true;
    } catch (error) {
      console.warn('[Payment Poll]', error);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return false;
}

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hasAccess(testDetails: any, userId?: string, accountType?: string) {
  if (!testDetails) return false;
  if (isInstructorAccount(accountType)) return true;
  if (Number(testDetails.price) === 0) return true;
  if (testDetails.isEnrolled) return true;
  if (!userId || !Array.isArray(testDetails.studentsEnrolled)) return false;
  return testDetails.studentsEnrolled.some(
    (entry: any) => String(entry?._id || entry) === String(userId)
  );
}

export default function MockTestDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = paramValue(rawId);
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [testDetails, setTestDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const heroHeight = Math.round(screenHeight * 0.42);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      const response = await apiConnector.get(`${endpoints.GET_MOCK_TEST_SERIES_BY_ID}/${id}`);
      if (response.data?.success) {
        setTestDetails(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch test details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const instructor = isInstructorAccount(user?.accountType);
  const canAccess = hasAccess(testDetails, user?._id, user?.accountType);

  const totalQuestions = useMemo(() => {
    if (!testDetails?.mockTests?.length) return 0;
    return testDetails.mockTests.reduce(
      (sum: number, t: any) => sum + (t.questions?.length || t.totalQuestions || 0),
      0
    );
  }, [testDetails]);

  const avgDuration = useMemo(() => {
    const tests = testDetails?.mockTests || [];
    if (!tests.length) return 0;
    const total = tests.reduce((sum: number, t: any) => sum + (Number(t.duration) || 0), 0);
    return Math.round(total / tests.length);
  }, [testDetails]);

  const priceLabel =
    testDetails?.price === 0 ? 'Free' : `₹${testDetails?.price ?? 0}`;

  const handleStartTest = (testId: string) => {
    router.push(`/take-test/${testId}?seriesId=${id}`);
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (isInstructorAccount(user.accountType)) {
      const firstId = testDetails?.mockTests?.[0]?._id;
      if (firstId) handleStartTest(firstId);
      return;
    }

    if (Number(testDetails.price) === 0) {
      setIsProcessing(true);
      try {
        const response = await apiConnector.post(`${endpoints.ENROLL_MOCK_TEST}/${id}`);
        if (response.data?.success) {
          fetchDetails();
        } else {
          showMessage({
            title: 'Enrollment failed',
            message: response.data?.message || 'Could not enroll in this test.',
            tone: 'danger',
          });
        }
      } catch (error: any) {
        showMessage({
          title: 'Enrollment failed',
          message:
            error.response?.data?.message || error.message || 'Could not enroll in this test.',
          tone: 'danger',
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    if (!id) {
      showMessage({
        title: 'Payment failed',
        message: 'Missing mock test id.',
        tone: 'danger',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const orderResponse = await apiConnector.post(endpoints.CAPTURE_MOCK_PAYMENT, {
        itemId: [String(id)],
      });

      if (!orderResponse.data?.success) {
        throw new Error(orderResponse.data?.message || 'Failed to create order');
      }

      const orderData = orderResponse.data.data;
      if (orderData?.alreadyPaid || orderResponse.data?.code === 'ALREADY_PAID') {
        showMessage({
          title: 'Payment successful',
          message: orderResponse.data?.message || 'You now have access to this mock test.',
          tone: 'success',
        });
        fetchDetails();
        return;
      }

      const razorpayKey = orderData.key;
      const orderId = orderData.orderId || orderData.id;
      const amount = orderData.amount;

      if (!razorpayKey || !orderId || amount == null) {
        throw new Error('Invalid payment order from server');
      }

      const contact = normalizeIndianMobile(
        (user as any)?.mobileNumber || (user as any)?.additionalDetails?.contactNumber
      );

      const options: Record<string, any> = {
        description: `Purchase ${testDetails.seriesName}`,
        image: 'https://awakeningclasses.in/logo.png',
        currency: orderData.currency || 'INR',
        key: razorpayKey,
        amount,
        name: 'Awakening Classes',
        order_id: orderId,
        retry: { enabled: true, max_count: 3 },
        prefill: {
          email: user?.email || '',
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        },
        theme: { color: isDark ? '#111111' : '#111111' },
      };
      if (contact) {
        options.prefill.contact = contact;
      }

      if (!RazorpayCheckout || !RazorpayCheckout.open) {
        showMessage({
          title: 'Payment unavailable',
          message: 'Razorpay is not available in Expo Go. Use a development build to pay.',
          tone: 'danger',
        });
        setIsProcessing(false);
        return;
      }

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            const verifyRes = await apiConnector.post(endpoints.VERIFY_MOCK_PAYMENT, {
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
            });
            if (verifyRes.data?.success) {
              showMessage({
                title: 'Payment successful',
                message: 'You now have access to this mock test.',
                tone: 'success',
              });
              fetchDetails();
            } else {
              const recovered = await pollNativePaymentStatus(orderId);
              showMessage({
                title: recovered ? 'Payment successful' : 'Verification pending',
                message: recovered
                  ? 'You now have access to this mock test.'
                  : verifyRes.data?.message ||
                    'Payment received. Contact support if access is missing.',
                tone: recovered ? 'success' : undefined,
              });
              if (recovered) fetchDetails();
            }
          } catch (verifyError: any) {
            const recovered = await pollNativePaymentStatus(orderId);
            showMessage({
              title: recovered ? 'Payment successful' : 'Verification pending',
              message: recovered
                ? 'You now have access to this mock test.'
                : verifyError.response?.data?.message ||
                  'Payment received. Contact support if access is missing.',
              tone: recovered ? 'success' : undefined,
            });
            if (recovered) fetchDetails();
          }
        })
        .catch(async (error: any) => {
          console.log('[Razorpay Error]', {
            description: error?.description,
            code: error?.code,
            details: error?.details || error?.error,
          });
          showMessage({
            title: 'Checking payment',
            message: 'If you completed the payment in your UPI app, access will unlock shortly.',
          });
          const recovered = await pollNativePaymentStatus(orderId);
          if (recovered) {
            showMessage({
              title: 'Payment successful',
              message: 'You now have access to this mock test.',
              tone: 'success',
            });
            fetchDetails();
            return;
          }
          const description = error?.description || error?.error?.description;
          if (description && description !== 'undefined') {
            showMessage({
              title: 'Payment not completed',
              message: String(description),
            });
          }
        });
    } catch (error: any) {
      const payload = error.response?.data;
      const message =
        payload?.message || error.message || 'Could not start payment. Please try again.';
      console.error('Payment Error:', message, payload || error);

      if (payload?.code === 'ALREADY_ENROLLED' || /already/i.test(String(message))) {
        showMessage({
          title: 'Already purchased',
          message: 'You already have access to this mock test.',
        });
        fetchDetails();
        return;
      }

      showMessage({
        title: 'Payment failed',
        message: String(message),
        tone: 'danger',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (!testDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFound}>Test not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const attrCards = [
    {
      label: 'Tests',
      value: String(testDetails.mockTests?.length || 0),
    },
    {
      label: 'Avg duration',
      value: avgDuration > 0 ? `${avgDuration} mins` : '—',
    },
    {
      label: 'Questions',
      value: totalQuestions > 0 ? String(totalQuestions) : '—',
    },
    {
      label: 'Access',
      value: canAccess ? 'Unlocked' : 'Premium',
    },
  ];

  const ctaTitle = instructor || canAccess || Number(testDetails.price) === 0
    ? 'Start now'
    : 'Buy now';

  const onCtaPress = () => {
    if (canAccess) {
      const firstId = testDetails.mockTests?.[0]?._id;
      if (firstId) handleStartTest(firstId);
      return;
    }
    handleEnroll();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          {testDetails.thumbnail ? (
            <Image
              source={{ uri: testDetails.thumbnail }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: colors.surfaceRaised }]}>
              <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            </View>
          )}

          <LinearGradient
            colors={[
              'rgba(0,0,0,0.72)',
              'rgba(0,0,0,0.35)',
              'rgba(0,0,0,0.08)',
              'transparent',
            ]}
            locations={[0, 0.28, 0.55, 0.78]}
            style={styles.heroFadeTop}
            pointerEvents="none"
          />

          <View style={[styles.heroTop, { paddingTop: insets.top + 8 }]}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color="#111" />
            </Pressable>

            <Text style={styles.heroTitle} numberOfLines={1}>
              Mock series
            </Text>

            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color="#111" />
            </Pressable>
          </View>
        </View>

        <View style={[styles.sheet, { marginTop: -36 }]}>
          <Text style={styles.title}>{testDetails.seriesName}</Text>
          <Text style={styles.priceLine}>
            {testDetails.price === 0 ? 'Free access' : `${priceLabel} one-time`}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attrRow}
          >
            {attrCards.map((card) => (
              <View key={card.label} style={styles.attrCard}>
                <Text style={styles.attrLabel}>{card.label}</Text>
                <Text style={styles.attrValue} numberOfLines={1}>
                  {card.value}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.description}>
            {stripHtml(testDetails.description) ||
              'Focused mock tests to help you prepare with real exam patterns and clear performance feedback.'}
          </Text>

          {instructor ? (
            <Button
              title="Edit series"
              onPress={() => router.push(`/admin/edit-series/${id}`)}
              variant="outline"
              style={{ marginBottom: 16 }}
            />
          ) : null}

          <Text style={styles.sectionTitle}>Tests in this series</Text>
          <View style={styles.testList}>
            {testDetails.mockTests?.map((test: any, index: number) => (
              <View key={test._id || index} style={styles.testItem}>
                <View style={styles.testItemInfo}>
                  <Text style={styles.testItemTitle} numberOfLines={2}>
                    {test.testName}
                  </Text>
                  <Text style={styles.testItemMeta}>
                    {test.duration} mins · {test.questions?.length || 0} questions
                  </Text>
                </View>

                {canAccess ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.startButton,
                      pressed && { opacity: 0.9 },
                    ]}
                    onPress={() => handleStartTest(test._id)}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </Pressable>
                ) : (
                  <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          title={isProcessing ? 'Please wait…' : ctaTitle}
          onPress={onCtaPress}
          isLoading={isProcessing}
          disabled={canAccess && !testDetails.mockTests?.length}
          style={styles.ctaButton}
          textStyle={styles.ctaButtonText}
        />
      </View>
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
    },
    notFound: {
      color: colors.text,
      fontFamily: Fonts.medium,
      fontSize: 15,
    },
    scrollContent: {
      flexGrow: 1,
    },
    hero: {
      width: '100%',
      backgroundColor: colors.surfaceRaised,
      overflow: 'hidden',
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    heroPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroFadeTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '58%',
    },
    heroTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      flex: 1,
      textAlign: 'center',
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      marginHorizontal: 10,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 28,
      paddingHorizontal: 22,
      paddingBottom: 24,
      minHeight: 420,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      lineHeight: 34,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.4,
      marginBottom: 8,
    },
    priceLine: {
      color: colors.text,
      fontSize: 15,
      fontFamily: Fonts.medium,
      marginBottom: 18,
    },
    attrRow: {
      gap: 10,
      paddingBottom: 4,
      marginBottom: 18,
    },
    attrCard: {
      minWidth: 132,
      backgroundColor: colors.surfaceRaised,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 12,
      justifyContent: 'center',
      gap: 4,
    },
    attrLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: Fonts.sans,
    },
    attrValue: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: Fonts.sans,
      marginBottom: 28,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      marginBottom: 12,
    },
    testList: {
      gap: 10,
    },
    testItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 12,
    },
    testItemInfo: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    testItemTitle: {
      color: colors.text,
      fontSize: 15,
      fontFamily: Fonts.semiBold,
    },
    testItemMeta: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: Fonts.sans,
    },
    startButton: {
      backgroundColor: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: Radii.pill,
    },
    startButtonText: {
      color: colors.primaryButtonText,
      fontSize: 12,
      fontFamily: Fonts.semiBold,
    },
    ctaBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.background,
    },
    ctaButton: {
      marginVertical: 0,
      borderRadius: Radii.pill,
      minHeight: 54,
      overflow: 'hidden',
    },
    ctaButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
    },
  });
}
