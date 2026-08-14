import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Native safe-area bottom inset from the OS (no app-side fallback). */
export function useNativeBottomInset(): number {
  return useSafeAreaInsets().bottom;
}
