import { Colors, FontSizes } from '@/lib/theme';
import { Stack } from 'expo-router';

export default function ConfigLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontSize: FontSizes.h1, fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Configuración', animation: 'fade' }} />
      <Stack.Screen
        name="categories/index"
        options={{ title: 'Categorías' }}
      />
      <Stack.Screen
        name="categories/form"
        options={{ title: 'Categoría', presentation: 'modal' }}
      />
      <Stack.Screen
        name="income-payment-methods/index"
        options={{ title: 'Métodos de pago' }}
      />
      <Stack.Screen
        name="income-payment-methods/form"
        options={{ title: 'Método de pago', presentation: 'modal' }}
      />
    </Stack>
  );
}
