import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
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
