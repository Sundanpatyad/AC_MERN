import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';

import { useAuthStore } from '../../store/authStore';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { Button } from '../../components/ui/Button';
import { DetailSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function MockTestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [testDetails, setTestDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDetails = useCallback(async () => {
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

  const isEnrolled = testDetails?.studentsEnrolled?.includes(user?._id);

  const handleStartTest = (testId: string) => {
    router.push(`/take-test/${testId}`);
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (testDetails.price === 0) {
      setIsProcessing(true);
      try {
        const response = await apiConnector.post(`${endpoints.ENROLL_MOCK_TEST}/${id}`);
        if (response.data?.success) {
          fetchDetails();
        }
      } catch {
        // enrollment failed
      } finally {
        setIsProcessing(false);
      }
    } else {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const orderResponse = await apiConnector.post(endpoints.CAPTURE_MOCK_PAYMENT, {
        itemId: id,
      });

      if (!orderResponse.data?.success) {
        throw new Error(orderResponse.data?.message || 'Failed to create order');
      }

      const orderData = orderResponse.data.data;
      const razorpayKey = orderData.key;
      const orderId = orderData.orderId || orderData.id;
      const amount = orderData.amount;

      if (!razorpayKey || !orderId || amount == null) {
        throw new Error('Invalid payment order from server');
      }

      const options = {
        description: `Purchase ${testDetails.seriesName}`,
        image: 'https://ac-62i9.onrender.com/assets/Logo/rzp_logo.png',
        currency: orderData.currency || 'INR',
        key: razorpayKey,
        amount,
        name: 'Awakening Classes',
        order_id: orderId,
        prefill: {
          email: user?.email || '',
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          contact: user?.additionalDetails?.contactNumber || '',
        },
        theme: { color: isDark ? '#000000' : '#111111' },
      };

      if (!RazorpayCheckout || !RazorpayCheckout.open) {
        console.error(
          'Razorpay module is not available. Ensure you are running on a Development Build and not Expo Go.'
        );
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
              fetchDetails();
            }
          } catch {
            // verification failed; payment may still have gone through
          }
        })
        .catch((error: any) => {
          console.log('[Razorpay Error]', error);
        });
    } catch (error: any) {
      console.error('Payment Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: 60 }]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (!testDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: colors.text }}>Test not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {testDetails.thumbnail ? (
            <Image source={{ uri: testDetails.thumbnail }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="book" size={60} color={colors.textMuted} />
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{testDetails.seriesName}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={20} color="#3b82f6" />
              <Text style={styles.metaText}>{testDetails.mockTests?.length || 0} Tests</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={20} color="#10b981" />
              <Text style={styles.metaText}>
                {testDetails.studentsEnrolled?.length || 0} Enrolled
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={20} color="#f59e0b" />
              <Text style={styles.metaText}>
                {testDetails.price === 0 ? 'Free' : `₹${testDetails.price}`}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{testDetails.description}</Text>

          <Text style={styles.sectionTitle}>Tests in this Series</Text>
          <View style={styles.testList}>
            {testDetails.mockTests?.map((test: any, index: number) => (
              <View key={test._id || index} style={styles.testItem}>
                <View style={styles.testItemInfo}>
                  <Text style={styles.testItemTitle}>{test.testName}</Text>
                  <Text style={styles.testItemMeta}>
                    {test.duration} mins • {test.questions?.length || 0} questions
                  </Text>
                </View>

                {isEnrolled || testDetails.price === 0 ? (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartTest(test._id)}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        {isEnrolled || testDetails.price === 0 ? (
          <Button
            title="Start Learning"
            onPress={() => handleStartTest(testDetails.mockTests?.[0]?._id)}
            disabled={!testDetails.mockTests?.length}
            style={styles.actionButton}
          />
        ) : (
          <View style={styles.buyContainer}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>₹{testDetails.price}</Text>
            </View>
            <Button
              title="Buy Now"
              onPress={handleEnroll}
              isLoading={isProcessing}
              style={[styles.actionButton, { flex: 1, marginLeft: 20 }]}
            />
          </View>
        )}
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
    scrollContent: {
      paddingBottom: 100,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: colors.surfaceRaised,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    metaInfo: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    description: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
    },
    testList: {
      gap: 12,
    },
    testItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    testItemInfo: {
      flex: 1,
    },
    testItemTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    testItemMeta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    startButton: {
      backgroundColor: '#3b82f6',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: Radii.pill,
    },
    startButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    actionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      marginVertical: 0,
    },
    buyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceLabel: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    priceValue: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
  });
}
