import { ThemedView } from '@/components/themed-view';
import { ListItem } from '@/components/ui/list-item';
import { Colors, Spacing } from '@/lib/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ConfigScreen() {
  return (
    <ThemedView style={styles.container}>
      <ListItem
        title="Perfil"
        subtitle="Tu información y sesión"
        compact
        leftIcon={
          <MaterialIcons name="person" size={24} color={Colors.icon} />
        }
        style={styles.listItem}
        onPress={() => router.push('/(home)/(config)/profile')}
      />
      <ListItem
        title="Categorías"
        subtitle="Gastos e ingresos"
        compact
        leftIcon={
          <MaterialIcons name="label" size={24} color={Colors.icon} />
        }
        style={styles.listItem}
        onPress={() => router.push('/(home)/(config)/categories')}
      />
      <ListItem
        title="Métodos de pago"
        subtitle="Efectivo, tarjeta, etc."
        compact
        leftIcon={
          <MaterialIcons name="credit-card" size={24} color={Colors.icon} />
        }
        style={styles.listItem}
        onPress={() => router.push('/(home)/(config)/income-payment-methods')}
      />
      {/* Components Button (Development Only) */}
      {__DEV__ && (
        <ListItem
          title="Componentes"
          subtitle="UI components gallery"
          compact
          leftIcon={
            <MaterialIcons name="widgets" size={24} color={Colors.icon} />
          }
          style={styles.listItem}
          onPress={() => router.push('/(home)/(config)/componentes')}
        />
      )}
      <ListItem
        title="Información del sistema"
        subtitle="Versión, SO y detalles de la app"
        compact
        leftIcon={
          <MaterialIcons name="info" size={24} color={Colors.icon} />
        }
        style={styles.listItem}
        onPress={() => router.push('/(home)/(config)/system-info')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.lg,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});
