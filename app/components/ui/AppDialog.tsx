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
import {
  FLOATING_TAB_BAR_HEIGHT,
  TAB_BAR_END_PAD,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_INDICATOR_SIZE,
  TAB_BAR_ITEM_GAP,
  floatingTabBarWidth,
} from '@/constants/layout';
import { Radii, Type } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

export type DialogTone = 'default' | 'success' | 'danger';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type DialogAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  destructive?: boolean;
  icon?: IoniconName;
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

const OPEN_MS = 220;
const CLOSE_MS = 160;

const TONE_ICON: Record<
  DialogTone,
  { name: IoniconName; colorKey: 'text' | 'success' | 'danger' } | null
> = {
  default: null,
  success: { name: 'checkmark-circle', colorKey: 'success' },
  danger: { name: 'alert-circle', colorKey: 'danger' },
};

function resolveActionIcon(
  action: DialogAction,
  isConfirmAction: boolean
): IoniconName {
  if (action.icon) return action.icon;

  const label = action.label.toLowerCase();
  if (label.includes('log out') || label.includes('logout')) return 'log-out-outline';
  if (label.includes('delete')) return 'trash-outline';
  if (label.includes('submit')) return 'checkmark';
  if (label.includes('ok') || label.includes('got it')) return 'checkmark';
  if (
    label.includes('cancel') ||
    label.includes('keep') ||
    label.includes('close') ||
    label.includes('no')
  ) {
    return 'close';
  }

  return isConfirmAction || action.variant === 'primary' ? 'checkmark' : 'close';
}

function DialogButton({
  action,
  tone,
  isConfirmAction,
}: {
  action: DialogAction;
  tone: DialogTone;
  isConfirmAction: boolean;
}) {
  const { colors } = useTheme();
  const isDanger = (tone === 'danger' && isConfirmAction) || action.destructive;
  const filled = isConfirmAction || action.variant === 'primary';
  const iconName = resolveActionIcon(action, isConfirmAction);

  const backgroundColor = filled
    ? isDanger
      ? colors.danger
      : colors.tabBarIndicator
    : 'transparent';

  const iconColor = filled
    ? isDanger
      ? '#FFFFFF'
      : colors.tabBarIconActive
    : colors.tabBarIconInactive;

  return (
    <Pressable
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Ionicons name={iconName} size={TAB_BAR_ICON_SIZE} color={iconColor} />
    </Pressable>
  );
}

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
  const isConfirm = actions.length > 1;

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
    opacity: progress.value * 0.92,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
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
            },
            cardStyle,
          ]}
        >
          {icon ? (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${colors[icon.colorKey]}14` },
              ]}
            >
              <Ionicons name={icon.name} size={22} color={colors[icon.colorKey]} />
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View
            style={[
              styles.actionsPill,
              {
                width: floatingTabBarWidth(actions.length),
                backgroundColor: colors.tabBarPill,
                borderColor: colors.tabBarPillBorder,
                borderWidth: colors.tabBarPillBorder === 'transparent' ? 0 : 1,
              },
            ]}
          >
            {actions.map((action, index) => (
              <DialogButton
                key={action.label}
                action={action}
                tone={tone}
                isConfirmAction={!isConfirm || index === actions.length - 1}
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
    paddingHorizontal: 36,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 288,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: 'stretch',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    ...Type.title,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    ...Type.bodySmall,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  actionsPill: {
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: FLOATING_TAB_BAR_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: TAB_BAR_END_PAD,
    gap: TAB_BAR_ITEM_GAP,
  },
  actionButton: {
    width: TAB_BAR_INDICATOR_SIZE,
    height: TAB_BAR_INDICATOR_SIZE,
    borderRadius: TAB_BAR_INDICATOR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
