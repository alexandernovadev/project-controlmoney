import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ActionModal } from '@/components/ui/action-modal';
import { useAuth } from '@/context/auth';
import {
  deleteCategory,
  subscribeCategories,
} from '@/lib/firebase/categories';
import type { Category } from '@/lib/models';
import { Colors, FontSizes, Spacing } from '@/lib/theme';

export default function CategoriesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [menuTarget, setMenuTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeCategories(user.uid, setCategories);
  }, [user?.uid]);

  const filtered = search.trim()
    ? categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
    : categories;

  const handleAdd = () =>
    router.push('/(home)/(config)/categories/form');
  const handleEdit = (id: string) =>
    router.push({
      pathname: '/(home)/(config)/categories/form',
      params: { id },
    });
  const handleDelete = (item: Category) => setDeleteTarget(item);

  const confirmDelete = async () => {
    if (!user?.uid || !deleteTarget) return;
    setDeleting(true);
    await deleteCategory(user.uid, deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const showMenu = (item: Category) => setMenuTarget(item);

  return (
    <>
    <ConfirmModal
      visible={!!deleteTarget}
      title="Eliminar categoría"
      message={`¿Eliminar "${deleteTarget?.name}"?`}
      confirmLabel="Eliminar"
      destructive
      loading={deleting}
      onConfirm={confirmDelete}
      onCancel={() => setDeleteTarget(null)}
    />
    <ActionModal
      visible={!!menuTarget}
      title={menuTarget?.name ?? ''}
      subtitle={menuTarget?.type === 'income' ? 'Categoría de ingreso' : 'Categoría de gasto'}
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
      searchPlaceholder="Buscar categorías..."
      onFilterPress={() => { }}
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

            }}
          >
            <View style={styles.row}>
              {item.color ? (
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: item.color },
                  ]}
                />
              ) : null}
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.subtitle,
                { color: item.type === 'income' ? Colors.success : Colors.error },
                ]} numberOfLines={1}>
                  {item.type === 'income' ? 'Ingreso' : 'Gasto'}
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
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
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
