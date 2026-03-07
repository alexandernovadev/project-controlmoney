import { Colors, FontSizes } from '@/lib/theme';
import { Stack } from 'expo-router';

export default function IncomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontSize: FontSizes.h1, fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Income' }} />
      <Stack.Screen
        name="form"
        options={{ title: 'Add income', presentation: 'modal' }}
      />
    </Stack>
  );
}
