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
import type { Transaction } from '@/lib/models';
import { formatDateShort } from '@/lib/utils/format-date';
import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { Colors, FontSizes, Spacing } from '@/lib/theme';

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

type IncomeCardProps = {
  item: Transaction;
  paymentMethodLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
};

function IncomeCard({ item, paymentMethodLabel, onPress, onLongPress }: IncomeCardProps) {
  return (
    <Card onPress={onPress} onLongPress={onLongPress} padding="md">
      <View style={cardStyles.row}>
        <View style={[cardStyles.iconWrap, { backgroundColor: Colors.successMuted }]}>
          <MaterialIcons name="trending-up" size={24} color={Colors.success} />
        </View>
        <View style={cardStyles.content}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {item.description || item.source || 'Income'}
          </Text>
          <Text style={cardStyles.subtitle}>
            {paymentMethodLabel ?? item.source ?? '—'} · {formatDateShort(item.date)}
          </Text>
        </View>
        <Text style={[cardStyles.amount, { color: Colors.success }]}>
          +${formatAmount(item.amount)}
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: Spacing.md,
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

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeIncomeTransactions(user.uid, setTransactions);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    getIncomePaymentMethods(user.uid).then((methods) => {
      const map: Record<string, string> = {};
      methods.forEach((m) => { map[m.id] = m.label; });
      setPaymentMethodMap(map);
    });
  }, [user?.uid]);

  const filtered = search.trim()
    ? transactions.filter(
        (t) =>
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.source?.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

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

  return (
    <ListPageLayout
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search income..."
      onFilterPress={() => {}}
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
            <View style={[headerStyles.card, { backgroundColor: Colors.successMuted }]}>
              <Text style={headerStyles.label}>Total</Text>
              <Text style={[headerStyles.total, { color: Colors.success }]}>
                ${formatAmount(total)}
              </Text>
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
              onPress={() => handleEdit(item.id)}
              onLongPress={() => showMenu(item)}
            />
          </View>
        )}
      />
    </ListPageLayout>
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
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
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
