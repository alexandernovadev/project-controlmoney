import { Stack } from 'expo-router';
import { Colors, FontSizes, FontWeights } from '@/lib/theme';

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontSize: FontSizes.h1, fontWeight: FontWeights.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Expenses' }} />
      <Stack.Screen
        name="form"
        options={{ title: 'Add expense', presentation: 'modal' }}
      />
    </Stack>
  );
}
