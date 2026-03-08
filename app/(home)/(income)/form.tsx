import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedView } from '@/components/themed-view';
import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { SelectModal } from '@/components/ui/select-modal';
import type { SelectOption } from '@/components/ui/select-modal';
import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import {
  createTransaction,
  getTransaction,
  updateTransaction,
} from '@/lib/firebase/transactions';
import type { Category, IncomePaymentMethod } from '@/lib/models';
import { Colors, Spacing } from '@/lib/theme';

const schema = z.object({
  amount: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  source: z.string().optional(),
  paymentMethodId: z.string().min(1, 'Required'),
  categoryId: z.string().optional(),
  date: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export default function IncomeFormScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
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
      date: new Date().toISOString(),
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
            date: tx.date,
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
        description: values.description.trim(),
        source: values.source?.trim() || undefined,
        paymentMethodId: values.paymentMethodId || undefined,
        categoryId: values.categoryId || undefined,
        date: values.date,
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
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.lg * 2 }]}
          keyboardShouldPersistTaps="handled"
        >
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
            <SelectModal
              label="Payment method"
              options={methodOptions}
              value={value || null}
              onValueChange={(v) => onChange(v || '')}
              placeholder="Select"
              error={errors.paymentMethodId?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <SelectModal
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
              mode="datetime"
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
      </KeyboardAvoidingView>
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
  keyboardView: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
});
