import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
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
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ActionModal } from '@/components/ui/action-modal';
import { Colors, FontSizes, Spacing } from '@/lib/theme';

export default function IncomePaymentMethodsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState<IncomePaymentMethod[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<IncomePaymentMethod | null>(null);
  const [menuTarget, setMenuTarget] = useState<IncomePaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = (item: IncomePaymentMethod) => setDeleteTarget(item);

  const confirmDelete = async () => {
    if (!user?.uid || !deleteTarget) return;
    setDeleting(true);
    await deleteIncomePaymentMethod(user.uid, deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const showMenu = (item: IncomePaymentMethod) => setMenuTarget(item);

  return (
    <>
    <ConfirmModal
      visible={!!deleteTarget}
      title="Eliminar método"
      message={`¿Eliminar "${deleteTarget?.label}"?`}
      confirmLabel="Eliminar"
      destructive
      loading={deleting}
      onConfirm={confirmDelete}
      onCancel={() => setDeleteTarget(null)}
    />
    <ActionModal
      visible={!!menuTarget}
      title={menuTarget?.label ?? ''}
      subtitle={menuTarget?.type === 'cash' ? 'Efectivo' : 'Digital'}
      onClose={() => setMenuTarget(null)}
      actions={[
        {
          label: 'Editar',
          icon: 'edit',
          onPress: () => handleEdit(menuTarget!.id),
        },
        {
          label: 'Eliminar',
          icon: 'delete-outline',
          destructive: true,
          onPress: () => handleDelete(menuTarget!),
        },
      ]}
    />
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
    </>
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
