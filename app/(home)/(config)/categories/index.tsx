import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import {
  subscribeCategories,
  deleteCategory,
} from '@/lib/firebase/categories';
import type { Category } from '@/lib/models';
import { ListPageLayout } from '@/components/layout/list-page-layout';
import { ListItem } from '@/components/ui/list-item';
import { Divider } from '@/components/ui/divider';
import { Colors } from '@/lib/theme';

export default function CategoriesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

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
  const handleDelete = (item: Category) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Eliminar "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            await deleteCategory(user.uid, item.id);
          },
        },
      ]
    );
  };

  const showMenu = (item: Category) => {
    Alert.alert('Categoría', item.name, [
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
      searchPlaceholder="Buscar categorías..."
      onFilterPress={() => {}}
      onAddPress={handleAdd}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={item.type === 'income' ? 'Ingreso' : 'Gasto'}
            leftIcon={
              item.color ? (
                <MaterialIcons
                  name="circle"
                  size={12}
                  color={item.color}
                  style={{ marginRight: 4 }}
                />
              ) : undefined
            }
            onPress={() => handleEdit(item.id)}
            onLongPress={() => showMenu(item)}
          />
        )}
      />
    </ListPageLayout>
  );
}
