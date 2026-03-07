import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import {
  subscribeIncomePaymentMethods,
  deleteIncomePaymentMethod,
} from '@/lib/firebase/income-payment-methods';
import type { IncomePaymentMethod } from '@/lib/models';
import { ListPageLayout } from '@/components/layout/list-page-layout';
import { ListItem } from '@/components/ui/list-item';
import { Divider } from '@/components/ui/divider';

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <ListItem
            title={item.label}
            subtitle={item.type === 'cash' ? 'Efectivo' : 'Digital'}
            onPress={() => handleEdit(item.id)}
            onLongPress={() => showMenu(item)}
          />
        )}
      />
    </ListPageLayout>
  );
}
