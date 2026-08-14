import { Platform } from 'react-native';

/** iOS 26+ system liquid-glass tab bar via NativeTabs. */
export function supportsNativeLiquidGlassTabs(): boolean {
  return Platform.OS === 'ios' && Number(Platform.Version) >= 26;
}
