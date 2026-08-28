import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { floatingTabBarContainerHeight } from '@/constants/layout';
import { getAndroidNavigationMode } from '@/lib/androidNavMode';
import { supportsNativeLiquidGlassTabs } from '@/lib/platform';

/** Standard Android 3-button / 2-button navigation bar height (dp). */
export const ANDROID_NAV_BAR = 48;

/**
 * Bottom safe inset.
 *
 * Gesture navigation: use the OS inset as-is (no extra 48dp).
 * 3-button / 2-button: edge-to-edge often reports 0, so reserve 48dp
 * so footers clear Back / Home / Recents.
 */
export function useNativeBottomInset(): number {
  const bottom = useSafeAreaInsets().bottom;
  if (Platform.OS !== 'android') return bottom;

  const mode = getAndroidNavigationMode();
  if (mode === 'gesture') return bottom;
  if (mode === 'buttons' || mode === 'twoButton') {
    return Math.max(bottom, ANDROID_NAV_BAR);
  }

  // Native module not linked yet: gesture reports a real inset; 3-button
  // + edge-to-edge often reports 0.
  if (bottom > 0) return bottom;
  return ANDROID_NAV_BAR;
}

export function useAppInsets() {
  const insets = useSafeAreaInsets();
  return {
    ...insets,
    bottom: useNativeBottomInset(),
  };
}

/** Space tab screens need so lists clear the floating pill and system nav. */
export function useTabScreenBottomPadding(): number {
  const bottom = useNativeBottomInset();
  if (supportsNativeLiquidGlassTabs()) return bottom + 16;
  return floatingTabBarContainerHeight(bottom) + 12;
}
