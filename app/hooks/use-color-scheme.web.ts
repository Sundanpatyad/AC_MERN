import { useTheme } from '@/providers/AppThemeProvider';

export function useColorScheme() {
  return useTheme().colorScheme;
}
