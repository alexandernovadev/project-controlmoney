import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { IncomeFilterModal, type IncomeFilterValues } from '@/components/ui/filter-modal';
import { TransferModal } from '@/components/ui/transfer-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { createTransaction } from '@/lib/firebase/transactions';
import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import {
  deleteTransaction,
  subscribeIncomeTransactions,
} from '@/lib/firebase/transactions';
import type { Transaction } from '@/lib/models';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { formatAmountNumber } from '@/lib/utils/format-amount';
import { formatDateShort, getSubscriptionOptionsFromPeriod, MONTH_NAMES } from '@/lib/utils/format-date';
import { calculateTotalByMethodType } from '@/lib/utils/calculations';

type IncomeCardProps = {
  item: Transaction;
  paymentMethodLabel?: string;
  categoryLabel?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function IncomeCard({ item, paymentMethodLabel, categoryLabel, onView, onEdit, onDelete }: IncomeCardProps) {
  const subtitleParts = [
    categoryLabel ?? paymentMethodLabel ?? item.source ?? null,
  ].filter(Boolean);
  const subtitle = subtitleParts.join(' · ');

  return (
    <Card
      padding="sm"
      style={{ borderLeftWidth: 2, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.sm }}
    >
      <View style={cardStyles.container}>
        {/* Row 1: Description */}
        <Text style={cardStyles.title}>
          {item.description || item.source || 'Income'}
        </Text>

        {/* Row 2: Subtitle and Price */}
        <View style={cardStyles.middleRow}>
          {subtitle ? (
            <Text style={cardStyles.subtitle}>{subtitle}</Text>
          ) : <View style={{ flex: 1 }} />}
          <Text style={[cardStyles.amount, { color: Colors.success }]}>
            +${formatAmountNumber(item.amount)}
          </Text>
        </View>

        {/* Row 3: Date */}
        <Text style={cardStyles.date}>{formatDateShort(item.date)}</Text>

        {/* Row 4: Actions */}
        <View style={cardStyles.divider} />
        <View style={cardStyles.actions}>
          <Pressable
            onPress={onView}
            style={({ pressed }) => [cardStyles.actionBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="visibility" size={18} color={Colors.textSecondary} />
            <Text style={[cardStyles.actionText, { color: Colors.textSecondary }]}>Ver</Text>
          </Pressable>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [cardStyles.actionBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="edit" size={18} color={Colors.accent} />
            <Text style={[cardStyles.actionText, { color: Colors.accent }]}>Editar</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [cardStyles.actionBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
            <Text style={[cardStyles.actionText, { color: Colors.error }]}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const cardStyles = {
  container: {
    flexDirection: 'column' as const,
    gap: Spacing.xs,
  },
  middleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  date: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  amount: {
    fontSize: FontSizes.bodyLg,
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  actionText: {
    fontSize: FontSizes.bodySm,
    fontWeight: '500' as const,
  },
};

export default function IncomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, string>>({});
  const [paymentMethodTypeMap, setPaymentMethodTypeMap] = useState<
    Record<string, 'cash' | 'digital'>
  >({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterValues, setFilterValues] = useState<IncomeFilterValues>(() => ({
    period: 'all',
    type: 'all',
    amountMin: '',
    amountMax: '',
  }));

  useEffect(() => {
    if (!user?.uid) return;
    const options = getSubscriptionOptionsFromPeriod(filterValues.period);
    return subscribeIncomeTransactions(user.uid, setTransactions, options);
  }, [user?.uid, filterValues.period]);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      getIncomePaymentMethods(user.uid),
      getCategories(user.uid),
    ]).then(([methods, categories]) => {
      const pmMap: Record<string, string> = {};
      const pmTypeMap: Record<string, 'cash' | 'digital'> = {};
      methods.forEach((m) => {
        pmMap[m.id] = m.label;
        pmTypeMap[m.id] = m.type;
      });
      setPaymentMethodMap(pmMap);
      setPaymentMethodTypeMap(pmTypeMap);
      const categoriesMap: Record<string, string> = {};
      categories.forEach((c) => { categoriesMap[c.id] = c.name; });
      setCategoryMap(categoriesMap);
    });
  }, [user?.uid]);

  let filtered = transactions;

  if (filterValues.type !== 'all') {
    filtered = filtered.filter((t) => {
      if (!t.paymentMethodId) return false;
      return paymentMethodTypeMap[t.paymentMethodId] === filterValues.type;
    });
  }

  const amountMinNum = filterValues.amountMin ? parseFloat(filterValues.amountMin) : NaN;
  const amountMaxNum = filterValues.amountMax ? parseFloat(filterValues.amountMax) : NaN;
  if (!isNaN(amountMinNum)) {
    filtered = filtered.filter((t) => t.amount >= amountMinNum);
  }
  if (!isNaN(amountMaxNum)) {
    filtered = filtered.filter((t) => t.amount <= amountMaxNum);
  }

  if (search.trim()) {
    filtered = filtered.filter(
      (t) =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.source?.toLowerCase().includes(search.toLowerCase()) ||
        (t.categoryId && categoryMap[t.categoryId]?.toLowerCase().includes(search.toLowerCase()))
    );
  }

  const incomeByMethod = Object.keys(paymentMethodMap).map((id) => {
    const total = filtered.filter(t => t.paymentMethodId === id).reduce((sum, t) => sum + t.amount, 0);
    return {
      id,
      name: paymentMethodMap[id] || 'Desconocido',
      type: paymentMethodTypeMap[id] || 'digital',
      total
    };
  }).filter(m => m.total > 0);

  const handleAdd = () => router.push('/(home)/(income)/form');
  const handleView = (id: string) =>
    router.push({ pathname: '/(home)/(income)/view', params: { id } });
  const handleEdit = (id: string) =>
    router.push({ pathname: '/(home)/(income)/form', params: { id } });
  const handleDelete = (item: Transaction) => setDeleteTarget(item);

  const confirmDelete = async () => {
    if (!user?.uid || !deleteTarget) return;
    setDeleting(true);
    await deleteTransaction(user.uid, deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleFilterPress = () => setFilterVisible(true);

  const handleTransfer = async ({
    amount,
    fromMethodId,
    toMethodId,
    fromLabel,
    toLabel,
  }: {
    amount: number;
    fromMethodId: string;
    toMethodId: string;
    fromLabel: string;
    toLabel: string;
  }) => {
    if (!user?.uid) return;
    const description = `Transferencia ${fromLabel} → ${toLabel}`;
    const date = new Date().toISOString();
    await Promise.all([
      createTransaction(user.uid, {
        type: 'expense',
        amount,
        description,
        date,
        userId: user.uid,
        paymentMethodId: fromMethodId,
      }),
      createTransaction(user.uid, {
        type: 'income',
        amount,
        description,
        date,
        userId: user.uid,
        paymentMethodId: toMethodId,
      }),
    ]);
  };

  const filterLabel = (() => {
    const p = filterValues.period;
    if (p === 'all') return 'Todos los meses';
    if (p === 'current') {
      const now = new Date();
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }
    if (p === 'last') {
      const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1);
      return `${MONTH_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;
    }
    return `${p.from} – ${p.to}`;
  })();

  const paymentMethodOptions = Object.entries(paymentMethodMap).map(([id, label]) => ({
    label,
    value: id,
  }));

  return (
    <>
    <ConfirmModal
      visible={!!deleteTarget}
      title="Eliminar ingreso"
      message={`¿Eliminar "${deleteTarget?.description || deleteTarget?.source || 'este ingreso'}"?`}
      confirmLabel="Eliminar"
      destructive
      loading={deleting}
      onConfirm={confirmDelete}
      onCancel={() => setDeleteTarget(null)}
    />
    <IncomeFilterModal
      visible={filterVisible}
      onClose={() => setFilterVisible(false)}
      initialValues={filterValues}
      onApply={setFilterValues}
    />
    <TransferModal
      visible={transferVisible}
      onClose={() => setTransferVisible(false)}
      paymentMethodOptions={paymentMethodOptions}
      onConfirm={handleTransfer}
    />
    <ListPageLayout
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search income..."
      onFilterPress={handleFilterPress}
      onAddPress={handleAdd}
      onTransferPress={() => setTransferVisible(true)}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xs,
          paddingBottom: insets.bottom + 80,
        }}
        ListHeaderComponent={
          <View style={headerStyles.wrap}>
            <Text style={headerStyles.filterLabel}>{filterLabel}</Text>
            <View style={[headerStyles.row, { flexWrap: 'wrap' }]}>
              {incomeByMethod.map((method) => (
                <Card key={method.id} style={[headerStyles.cardHalf, { minWidth: '45%', padding: Spacing.xs }]}>
                  <View style={headerStyles.cardHeader}>
                    <MaterialIcons 
                      name={method.type === 'cash' ? 'payments' : 'account-balance-wallet'} 
                      size={14} 
                      color={method.type === 'cash' ? Colors.success : Colors.accent} 
                    />
                    <Text style={[headerStyles.label, { color: Colors.textSecondary, flex: 1 }]} numberOfLines={1}>{method.name}</Text>
                  </View>
                  <Text style={[headerStyles.total, { color: Colors.text }]}>
                    ${formatAmountNumber(method.total)}
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={emptyStyles.wrap}>
            <View style={[emptyStyles.iconWrap, { backgroundColor: Colors.successMuted }]}>
              <MaterialIcons name="trending-up" size={48} color={Colors.success} />
            </View>
            <Text style={emptyStyles.title}>No income yet</Text>
            <Text style={emptyStyles.subtitle}>Tap + to add your first income</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: Spacing.sm }}>
            <IncomeCard
              item={item}
              paymentMethodLabel={item.paymentMethodId ? paymentMethodMap[item.paymentMethodId] : undefined}
              categoryLabel={item.categoryId ? categoryMap[item.categoryId] : undefined}
              onView={() => handleView(item.id)}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item)}
            />
          </View>
        )}
      />
    </ListPageLayout>
    </>
  );
}

const emptyStyles = {
  wrap: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Spacing['2xl'],
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.h3,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.bodySm,
    color: Colors.textSecondary,
  },
};

const headerStyles = {
  wrap: { marginBottom: Spacing.md },
  filterLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row' as const,
    gap: Spacing.sm,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.xs,
    borderWidth: 1,
  },
  cardHalf: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.caption,
    fontWeight: '600' as const,
  },
  total: {
    fontSize: FontSizes.body,
    fontWeight: '700' as const,
  },
};
