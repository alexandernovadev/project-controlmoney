import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, FlatList, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import {
  subscribeIncomeTransactions,
  deleteTransaction,
} from '@/lib/firebase/transactions';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import { getCategories } from '@/lib/firebase/categories';
import type { Transaction } from '@/lib/models';
import { formatDateShort } from '@/lib/utils/format-date';
import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { IncomeFilterModal, type IncomeFilterValues } from '@/components/ui/filter-modal';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { formatAmountNumber } from '@/lib/utils/format-amount';
import { getMonthRange } from '@/lib/utils/format-date';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getSubscriptionOptionsFromPeriod(
  period: IncomeFilterValues['period']
): { startDate: string; endDate: string } | undefined {
  if (period === 'all') return undefined;
  if (period === 'current') {
    const { start, end } = getMonthRange();
    return { startDate: start, endDate: end };
  }
  if (period === 'last') {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1);
    const { start, end } = getMonthRange(prev.getFullYear(), prev.getMonth());
    return { startDate: start, endDate: end };
  }
  const from = new Date(period.from).toISOString();
  const to = new Date(period.to + 'T23:59:59.999').toISOString();
  return { startDate: from, endDate: to };
}

type IncomeCardProps = {
  item: Transaction;
  paymentMethodLabel?: string;
  categoryLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
};

function IncomeCard({ item, paymentMethodLabel, categoryLabel, onPress, onLongPress }: IncomeCardProps) {
  const subtitleParts = [
    categoryLabel ?? paymentMethodLabel ?? item.source ?? null,
    formatDateShort(item.date),
  ].filter(Boolean);
  const subtitle = subtitleParts.join(' · ');

  return (
    <Card
      onPress={onPress}
      onLongPress={onLongPress}
      padding="md"
      style={{ borderLeftWidth: 4, borderLeftColor: Colors.success }}
    >
      <View style={cardStyles.row}>
        <View style={cardStyles.content}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {item.description || item.source || 'Income'}
          </Text>
          <Text style={cardStyles.subtitle}>
            {subtitle || '—'}
          </Text>
        </View>
        <Text style={[cardStyles.amount, { color: Colors.success }]}>
          +${formatAmountNumber(item.amount)}
        </Text>
      </View>
    </Card>
  );
}

const cardStyles = {
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
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSizes.bodyLg,
    fontWeight: '700' as const,
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
  const [filterValues, setFilterValues] = useState<IncomeFilterValues>(() => ({
    period: 'current',
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
      const catMap: Record<string, string> = {};
      categories.forEach((c) => { catMap[c.id] = c.name; });
      setCategoryMap(catMap);
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

  const totalCash = filtered.reduce((sum, t) => {
    if (!t.paymentMethodId) return sum;
    return paymentMethodTypeMap[t.paymentMethodId] === 'cash' ? sum + t.amount : sum;
  }, 0);
  const totalDigital = filtered.reduce((sum, t) => sum + t.amount, 0) - totalCash;

  const handleAdd = () => router.push('/(home)/(income)/form');
  const handleEdit = (id: string) =>
    router.push({ pathname: '/(home)/(income)/form', params: { id } });
  const handleDelete = (item: Transaction) => {
    Alert.alert(
      'Delete income',
      `Delete "${item.description || item.source || 'this income'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            await deleteTransaction(user.uid, item.id);
          },
        },
      ]
    );
  };

  const showMenu = (item: Transaction) => {
    Alert.alert('Income', item.description || item.source || 'Income', [
      { text: 'Edit', onPress: () => handleEdit(item.id) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDelete(item),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleFilterPress = () => setFilterVisible(true);

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

  return (
    <>
    <IncomeFilterModal
      visible={filterVisible}
      onClose={() => setFilterVisible(false)}
      initialValues={filterValues}
      onApply={setFilterValues}
    />
    <ListPageLayout
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search income..."
      onFilterPress={handleFilterPress}
      onAddPress={handleAdd}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: insets.bottom + 80,
        }}
        ListHeaderComponent={
          <View style={headerStyles.wrap}>
            <Text style={headerStyles.filterLabel}>{filterLabel}</Text>
            <View style={headerStyles.row}>
              <View style={[headerStyles.card, headerStyles.cardHalf, { backgroundColor: Colors.successMuted }]}>
                <Text style={headerStyles.label}>Cash</Text>
                <Text style={[headerStyles.total, { color: Colors.success }]}>
                  ${formatAmountNumber(totalCash)}
                </Text>
              </View>
              <View style={[headerStyles.card, headerStyles.cardHalf, { backgroundColor: Colors.successMuted }]}>
                <Text style={headerStyles.label}>Digital</Text>
                <Text style={[headerStyles.total, { color: Colors.success }]}>
                  ${formatAmountNumber(totalDigital)}
                </Text>
              </View>
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
              onPress={() => handleEdit(item.id)}
              onLongPress={() => showMenu(item)}
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
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  cardHalf: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.caption,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  total: {
    fontSize: FontSizes.h1,
    fontWeight: '700' as const,
    marginTop: Spacing.xs,
  },
};
