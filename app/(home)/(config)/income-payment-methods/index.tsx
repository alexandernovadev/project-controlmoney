import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, FlatList, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import {
  subscribeIncomePaymentMethods,
  deleteIncomePaymentMethod,
} from '@/lib/firebase/income-payment-methods';
import type { IncomePaymentMethod } from '@/lib/models';
import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { Colors, FontSizes, Spacing } from '@/lib/theme';

export default function IncomePaymentMethodsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState<IncomePaymentMethod[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeIncomePaymentMethods(user.uid, setMethods);
  }, [user?.uid]);

  const filtered = search.trim()
    ? methods.filter(
        (m) =>
          m.label.toLowerCase().includes(search.toLowerCase()) ||
          m.value.toLowerCase().includes(search.toLowerCase())
      )
    : methods;

  const handleAdd = () =>
    router.push('/(home)/(config)/income-payment-methods/form');
  const handleEdit = (id: string) =>
    router.push({
      pathname: '/(home)/(config)/income-payment-methods/form',
      params: { id },
    });
  const handleDelete = (item: IncomePaymentMethod) => {
    Alert.alert(
      'Eliminar método',
      `¿Eliminar "${item.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            await deleteIncomePaymentMethod(user.uid, item.id);
          },
        },
      ]
    );
  };

  const showMenu = (item: IncomePaymentMethod) => {
    Alert.alert('Método de pago', item.label, [
      { text: 'Editar', onPress: () => handleEdit(item.id) },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => handleDelete(item),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <ListPageLayout
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar métodos..."
      onFilterPress={() => {}}
      onAddPress={handleAdd}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: insets.bottom + 80,
          gap: Spacing.sm,
        }}
        renderItem={({ item }) => (
          <Card
            onPress={() => handleEdit(item.id)}
            onLongPress={() => showMenu(item)}
            padding="sm"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: Colors.accent,
            }}
          >
            <View style={styles.row}>
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.type === 'cash' ? 'Efectivo' : 'Digital'}
                  {item.value ? ` · ${item.value}` : ''}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textSecondary}
              />
            </View>
          </Card>
        )}
      />
    </ListPageLayout>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
};
