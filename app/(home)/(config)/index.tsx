import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ListItem } from '@/components/ui/list-item';
import { Colors, Spacing } from '@/lib/theme';

export default function ConfigScreen() {
  return (
    <ThemedView style={styles.container}>
      <ListItem
        title="Categorías"
        subtitle="Gastos e ingresos"
        onPress={() => router.push('/(home)/(config)/categories')}
        rightIcon={null}
      />
      <ListItem
        title="Métodos de pago"
        subtitle="Efectivo, tarjeta, etc."
        onPress={() => router.push('/(home)/(config)/income-payment-methods')}
        rightIcon={null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
