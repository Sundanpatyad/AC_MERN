import { Stack } from 'expo-router';
import { useTheme } from '../../providers/AppThemeProvider';

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
