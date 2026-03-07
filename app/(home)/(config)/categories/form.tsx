import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import {
  getCategory,
  createCategory,
  updateCategory,
} from '@/lib/firebase/categories';
import type { CategoryCreate, CategoryType } from '@/lib/models';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/components/ui/select-modal';
import { Colors, Spacing } from '@/lib/theme';

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  type: z.enum(['income', 'expense'] as const),
});

type FormValues = z.infer<typeof schema>;

const typeOptions: SelectOption[] = [
  { label: 'Gasto', value: 'expense' },
  { label: 'Ingreso', value: 'income' },
];

export default function CategoryFormScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const id = params.id;
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'expense' },
  });

  useEffect(() => {
    if (!id || !user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const cat = await getCategory(user.uid, id);
        if (cancelled) return;
        if (cat) {
          reset({ name: cat.name, type: cat.type as CategoryType });
        } else {
          setFetchError('No se encontró la categoría');
        }
      } catch (e) {
        if (!cancelled) setFetchError('Error al cargar');
      }
    })();
    return () => { cancelled = true; };
  }, [id, user?.uid, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateCategory(user.uid, id, {
          name: values.name,
          type: values.type,
        });
      } else {
        await createCategory(user.uid, {
          name: values.name,
          type: values.type,
          userId: user.uid,
          order: 0,
        } as CategoryCreate);
      }
      router.back();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <ThemedView style={styles.center}>
        <Button title="Volver" variant="ghost" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom + Spacing.lg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Nombre"
              value={value}
              onChangeText={onChange}
              placeholder="Ej: Comida, Transporte"
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Tipo"
              options={typeOptions}
              value={value}
              onValueChange={(v) => onChange(v as CategoryType)}
            />
          )}
        />
        <Button
          title={isEdit ? 'Guardar' : 'Crear categoría'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
});
