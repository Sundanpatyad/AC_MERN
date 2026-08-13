import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Fonts, Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

export type DialogTone = 'default' | 'success' | 'danger';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type DialogAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
};

type AppDialogProps = {
  isVisible: boolean;
  title: string;
  message: string;
  tone?: DialogTone;
  actions: DialogAction[];
  onClose: () => void;
  dismissOnOverlay?: boolean;
};

const OPEN_MS = 240;
const CLOSE_MS = 180;

const TONE_ICON: Record<DialogTone, { name: IoniconName; colorKey: 'text' | 'success' | 'danger' } | null> = {
  default: null,
  success: { name: 'checkmark-circle', colorKey: 'success' },
  danger: { name: 'alert-circle', colorKey: 'danger' },
};

export function AppDialog({
  isVisible,
  title,
  message,
  tone = 'default',
  actions,
  onClose,
  dismissOnOverlay = true,
}: AppDialogProps) {
  const { colors } = useTheme();
  const [mounted, setMounted] = React.useState(isVisible);
  const progress = useSharedValue(0);
  const icon = TONE_ICON[tone];

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
      });
    } else if (mounted) {
      progress.value = withTiming(
        0,
        {
          duration: CLOSE_MS,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }
      );
    }
  }, [isVisible, mounted, progress]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Animated.View
          style={[styles.overlay, { backgroundColor: colors.overlay }, overlayStyle]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissOnOverlay ? onClose : undefined}
            accessibilityLabel="Dismiss dialog"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderStrong,
              shadowColor: colors.primaryShadow,
            },
            cardStyle,
          ]}
        >
          {icon ? (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${colors[icon.colorKey]}18` },
              ]}
            >
              <Ionicons name={icon.name} size={28} color={colors[icon.colorKey]} />
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.actions}>
            {actions.map((action) => (
              <Button
                key={action.label}
                title={action.label}
                onPress={action.onPress}
                variant={action.variant ?? 'primary'}
                style={styles.button}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  actions: {
    width: '100%',
    gap: 6,
  },
  button: {
    width: '100%',
    marginVertical: 0,
  },
});
