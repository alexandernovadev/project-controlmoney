import { Stack } from 'expo-router';

export default function ConfigLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0D0D0F' },
        headerTintColor: '#F5F5F7',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Configuración' }} />
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
