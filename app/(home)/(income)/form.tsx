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
  getTransaction,
  createTransaction,
  updateTransaction,
} from '@/lib/firebase/transactions';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import { getCategories } from '@/lib/firebase/categories';
import type { IncomePaymentMethod, Category } from '@/lib/models';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/ui/amount-input';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/components/ui/select-modal';
import { Colors, Spacing } from '@/lib/theme';

const schema = z.object({
  amount: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  source: z.string().optional(),
  paymentMethodId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function IncomeFormScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const id = params.id;
  const isEdit = !!id;

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit income' : 'Add income' });
  }, [navigation, isEdit]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<IncomePaymentMethod[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      description: '',
      source: '',
      paymentMethodId: '',
      categoryId: '',
      date: todayISO(),
    },
  });

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const [methods, categories] = await Promise.all([
        getIncomePaymentMethods(user.uid),
        getCategories(user.uid),
      ]);
      setPaymentMethods(methods);
      setIncomeCategories(categories.filter((c) => c.type === 'income'));
    })();
  }, [user?.uid]);

  useEffect(() => {
    if (!id || !user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const tx = await getTransaction(user.uid, id);
        if (cancelled) return;
        if (tx && tx.type === 'income') {
          reset({
            amount: String(tx.amount),
            description: tx.description,
            source: tx.source ?? '',
            paymentMethodId: tx.paymentMethodId ?? '',
            categoryId: tx.categoryId ?? '',
            date: tx.date.split('T')[0],
          });
        } else {
          setFetchError('Income not found');
        }
      } catch (e) {
        if (!cancelled) setFetchError('Error loading');
      }
    })();
    return () => { cancelled = true; };
  }, [id, user?.uid, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const payload = {
        userId: user.uid,
        type: 'income' as const,
        amount: parseFloat(values.amount) || 0,
        description: values.description,
        source: values.source || undefined,
        paymentMethodId: values.paymentMethodId || undefined,
        categoryId: values.categoryId || undefined,
        date: new Date(values.date).toISOString(),
      };
      if (isEdit && id) {
        await updateTransaction(user.uid, id, payload);
      } else {
        await createTransaction(user.uid, payload);
      }
      router.back();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const methodOptions: SelectOption[] = [
    { label: '— Select —', value: '' },
    ...paymentMethods.map((m) => ({ label: m.label, value: m.id })),
  ];

  const categoryOptions: SelectOption[] = [
    { label: '— Select category —', value: '' },
    ...incomeCategories.map((c) => ({ label: c.name, value: c.id })),
  ];

  if (fetchError) {
    return (
      <ThemedView style={styles.center}>
        <Button title="Back" variant="ghost" onPress={() => router.back()} />
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
          name="amount"
          render={({ field: { onChange, value } }) => (
            <AmountInput
              label="Amount"
              value={value}
              onChangeValue={onChange}
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Salary, Freelance"
              error={errors.description?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="source"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Source (optional)"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Company, Client"
            />
          )}
        />
        <Controller
          control={control}
          name="paymentMethodId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Payment method"
              options={methodOptions}
              value={value || null}
              onValueChange={(v) => onChange(v || '')}
              placeholder="Select"
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Category (optional)"
              options={categoryOptions}
              value={value || null}
              onValueChange={(v) => onChange(v || '')}
              placeholder="Select"
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DateInput
              label="Date"
              value={value}
              onChangeValue={onChange}
              error={errors.date?.message}
            />
          )}
        />
        <Button
          title={isEdit ? 'Edit income' : 'Add income'}
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
});
