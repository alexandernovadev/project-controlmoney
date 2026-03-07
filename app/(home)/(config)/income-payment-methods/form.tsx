import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import {
  getIncomePaymentMethod,
  createIncomePaymentMethod,
  updateIncomePaymentMethod,
} from '@/lib/firebase/income-payment-methods';
import type {
  IncomePaymentMethodCreate,
  IncomePaymentType,
} from '@/lib/models';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/components/ui/select-modal';
import { Colors, Spacing } from '@/lib/theme';

const schema = z.object({
  label: z.string().min(1, 'Requerido'),
  value: z.string().min(1, 'Requerido'),
  type: z.enum(['cash', 'digital'] as const),
});

type FormValues = z.infer<typeof schema>;

const typeOptions: SelectOption[] = [
  { label: 'Efectivo', value: 'cash' },
  { label: 'Digital', value: 'digital' },
];

export default function IncomePaymentMethodFormScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const id = params.id;
  const isEdit = !!id;

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Editar método' : 'Agregar método',
    });
  }, [navigation, isEdit]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: '', value: '', type: 'digital' },
  });

  useEffect(() => {
    if (!id || !user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const method = await getIncomePaymentMethod(user.uid, id);
        if (cancelled) return;
        if (method) {
          reset({
            label: method.label,
            value: method.value,
            type: method.type as IncomePaymentType,
          });
        } else {
          setFetchError('No se encontró el método');
        }
      } catch (e) {
        if (!cancelled) setFetchError('Error al cargar');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user?.uid, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateIncomePaymentMethod(user.uid, id, {
          label: values.label,
          value: values.value,
          type: values.type,
        });
      } else {
        await createIncomePaymentMethod(user.uid, {
          label: values.label,
          value: values.value,
          type: values.type,
          userId: user.uid,
          order: 0,
        } as IncomePaymentMethodCreate);
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
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + Spacing.lg }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="label"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Etiqueta"
              value={value}
              onChangeText={onChange}
              placeholder="Ej: Efectivo, Tarjeta"
              error={errors.label?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="value"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Valor (id)"
              value={value}
              onChangeText={onChange}
              placeholder="Ej: cash, card"
              error={errors.value?.message}
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
              onValueChange={(v) => onChange(v as IncomePaymentType)}
            />
          )}
        />
        <Button
          title={isEdit ? 'Editar método' : 'Agregar método'}
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
