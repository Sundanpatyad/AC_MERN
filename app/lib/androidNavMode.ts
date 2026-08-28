import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

export type AndroidNavMode = 'gesture' | 'buttons' | 'twoButton' | 'unknown';

type AndroidNavModeNative = {
  getNavigationMode?: () => string;
};

export function getAndroidNavigationMode(): AndroidNavMode {
  if (Platform.OS !== 'android') return 'unknown';

  const native = requireOptionalNativeModule<AndroidNavModeNative>('AndroidNavMode');
  const mode = native?.getNavigationMode?.();
  if (mode === 'gesture' || mode === 'buttons' || mode === 'twoButton') {
    return mode;
  }
  return 'unknown';
}
