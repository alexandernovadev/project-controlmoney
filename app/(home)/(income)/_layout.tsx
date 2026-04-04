import { Colors, FontSizes, FontWeights } from '@/lib/theme';
import { Stack } from 'expo-router';

export default function IncomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontSize: FontSizes.h1, fontWeight: FontWeights.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Income' }} />
      <Stack.Screen
        name="form"
        options={{ title: 'Add income', presentation: 'modal' }}
      />
      <Stack.Screen
        name="view"
        options={{ title: '' }}
      />
    </Stack>
  );
}
