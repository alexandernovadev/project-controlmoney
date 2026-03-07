import { Stack } from 'expo-router';
import { Colors, FontSizes } from '@/lib/theme';

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontSize: FontSizes.h3, fontWeight: '600' },
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
