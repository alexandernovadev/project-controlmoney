import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedView } from '@/components/themed-view';
import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/components/ui/select-modal';
import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import {
  createTransaction,
  getTransaction,
  updateTransaction,
} from '@/lib/firebase/transactions';
import type { Category, Unit } from '@/lib/models';
import { UNITS } from '@/lib/models/unit';
import { Colors, Spacing } from '@/lib/theme';

const schema = z.object({
  amount: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  categoryId: z.string().min(1, 'Required'),
  brand: z.string().min(1, 'Required'),
  store: z.string().min(1, 'Required'),
  storeAddress: z.string().optional(),
  storeCountry: z.string().optional(),
  storeLat: z.string().optional(),
  storeLng: z.string().optional(),
  quantity: z
    .string()
    .min(1, 'Required')
    .refine((val) => {
      const n = parseFloat(val);
      return !isNaN(n) && n >= 1 && n <= 1000;
    }, 'Between 1 and 1000'),
  unit: z.string().optional(),
  unitPrice: z.string().optional(),
  rating: z.string().optional(),
  comment: z.string().optional(),
  date: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export default function ExpenseFormScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const id = params.id;
  const isEdit = !!id;

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit expense' : 'Add expense' });
  }, [navigation, isEdit]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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
      categoryId: '',
      brand: '',
      store: '',
      storeAddress: '',
      storeCountry: '',
      storeLat: '',
      storeLng: '',
      quantity: '1',
      unit: '',
      unitPrice: '',
      rating: '',
      comment: '',
      date: new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (!user?.uid) return;
    getCategories(user.uid).then((all) => {
      const expenseCategories = all.filter((c) => c.type === 'expense');
      setCategories(expenseCategories);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!id || !user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const tx = await getTransaction(user.uid, id);
        if (cancelled) return;
        if (tx && tx.type === 'expense') {
          const storeObj =
            typeof tx.store === 'object' && tx.store != null ? tx.store : null;
          reset({
            amount: String(tx.amount),
            description: tx.description,
            categoryId: tx.categoryId ?? '',
            brand: tx.brand ?? '',
            store:
              typeof tx.store === 'string'
                ? tx.store
                : storeObj?.name ?? '',
            storeAddress: storeObj?.address ?? '',
            storeCountry: storeObj?.country ?? '',
            storeLat: storeObj?.lat != null ? String(storeObj.lat) : '',
            storeLng: storeObj?.lng != null ? String(storeObj.lng) : '',
            quantity: tx.quantity != null ? String(tx.quantity) : '1',
            unit: tx.unit ?? '',
            unitPrice: tx.unitPrice != null ? String(tx.unitPrice) : '',
            rating: tx.rating != null ? String(tx.rating) : '',
            comment: tx.comment ?? '',
            date: tx.date,
          });
        } else {
          setFetchError('Expense not found');
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
      const storeName = values.store?.trim();
      const storeAddr = values.storeAddress?.trim();
      const storeCountryVal = values.storeCountry?.trim();
      const latNum = values.storeLat ? parseFloat(values.storeLat) : NaN;
      const lngNum = values.storeLng ? parseFloat(values.storeLng) : NaN;
      const lat = !isNaN(latNum) ? latNum : undefined;
      const lng = !isNaN(lngNum) ? lngNum : undefined;

      let store: string | { name: string; address?: string; country?: string; lat?: number; lng?: number } | undefined;
      if (storeName) {
        if (storeAddr || storeCountryVal || lat != null || lng != null) {
          store = {
            name: storeName,
            ...(storeAddr && { address: storeAddr }),
            ...(storeCountryVal && { country: storeCountryVal }),
            ...(lat != null && { lat }),
            ...(lng != null && { lng }),
          };
        } else {
          store = storeName;
        }
      }

      const payload = {
        userId: user.uid,
        type: 'expense' as const,
        amount: parseFloat(values.amount) || 0,
        description: values.description.trim(),
        categoryId: values.categoryId || undefined,
        brand: values.brand?.trim() || undefined,
        store: store,
        quantity: Math.min(1000, Math.max(1, parseFloat(values.quantity) || 1)),
        unit: (values.unit || undefined) as Unit | undefined,
        unitPrice: values.unitPrice ? parseFloat(values.unitPrice) : undefined,
        rating: values.rating ? parseInt(values.rating, 10) : undefined,
        comment: values.comment?.trim() || undefined,
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

  const categoryOptions: SelectOption[] = [
    { label: '— Select category —', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const unitOptions: SelectOption[] = [
    { label: '— Select unit —', value: '' },
    ...UNITS.map((u) => ({ label: u.label, value: u.value })),
  ];

  const ratingOptions: SelectOption[] = [
    { label: '— None —', value: '' },
    { label: '1 ★', value: '1' },
    { label: '2 ★★', value: '2' },
    { label: '3 ★★★', value: '3' },
    { label: '4 ★★★★', value: '4' },
    { label: '5 ★★★★★', value: '5' },
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
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Supermarket, Cinema"
              error={errors.description?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="brand"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Brand"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Nike, Apple"
              error={errors.brand?.message}
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
        <View style={styles.rowCantidadCategoria}>
          <View style={styles.cantidadField}>
            <Controller
              control={control}
              name="quantity"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Quantity"
                  value={value}
                  onChangeText={onChange}
                  placeholder="1 - 1000"
                  keyboardType="decimal-pad"
                  error={errors.quantity?.message}
                />
              )}
            />
          </View>
          <View style={styles.categoriaField}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={value || null}
                  onValueChange={(v) => onChange(v || '')}
                  placeholder="Select"
                  error={errors.categoryId?.message}
                />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="store"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Store"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Walmart, Netflix"
              error={errors.store?.message}
            />
          )}
        />
        <View style={styles.collapsibleWrap}>
          <Collapsible title="Store details (advanced)">
            <Controller
              control={control}
              name="storeAddress"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Street, city..."
                />
              )}
            />
            <Controller
              control={control}
              name="storeCountry"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Country"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. Colombia"
                />
              )}
            />
            <Controller
              control={control}
              name="storeLat"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Latitude"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. 4.7110"
                  keyboardType="decimal-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="storeLng"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Longitude"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. -74.0721"
                  keyboardType="decimal-pad"
                />
              )}
            />
          </Collapsible>
        </View>
        <View style={styles.rowFields}>
          <View style={styles.rowField}>
            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Unit (optional)"
                  options={unitOptions}
                  value={value || null}
                  onValueChange={(v) => onChange(v || '')}
                  placeholder="Select"
                />
              )}
            />
          </View>
          <View style={styles.rowField}>
            <Controller
              control={control}
              name="unitPrice"
              render={({ field: { onChange, value } }) => (
                <AmountInput
                  label="Valor (opcional)"
                  value={value ?? ''}
                  onChangeValue={onChange}
                  placeholder="0"
                  currencySymbol=""
                />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="rating"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Rating (optional)"
              options={ratingOptions}
              value={value || null}
              onValueChange={(v) => onChange(v || '')}
              placeholder="Select"
            />
          )}
        />
        <Controller
          control={control}
          name="comment"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Comment (optional)"
              value={value}
              onChangeText={onChange}
              placeholder="Notes..."
              multiline
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
          title={isEdit ? 'Edit expense' : 'Add expense'}
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
  collapsibleWrap: { marginBottom: Spacing.md },
  rowCantidadCategoria: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cantidadField: {
    flex: 2,
    minWidth: 60,
  },
  categoriaField: {
    flex: 8,
    minWidth: 0,
  },
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowField: {
    flex: 1,
  },
});
