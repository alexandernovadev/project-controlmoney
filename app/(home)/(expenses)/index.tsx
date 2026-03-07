import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import {
  deleteTransaction,
  subscribeExpenseTransactions,
} from '@/lib/firebase/transactions';
import type { Transaction } from '@/lib/models';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { formatDateShort } from '@/lib/utils/format-date';

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

type ExpenseCardProps = {
  item: Transaction;
  categoryLabel?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onLongPress: () => void;
};

function ExpenseCard({
  item,
  categoryLabel,
  isExpanded,
  onToggleExpand,
  onEdit,
  onLongPress,
}: ExpenseCardProps) {
  const storeName = typeof item.store === 'string' ? item.store : item.store?.name;
  const subtitleParts = [
    categoryLabel ?? null,
    formatDateShort(item.date),
  ].filter(Boolean);
  const subtitle = subtitleParts.join(' · ');

  const hasExpandedContent =
    item.quantity != null ||
    item.unit != null ||
    storeName != null ||
    item.unitPrice != null ||
    item.rating != null ||
    (item.comment != null && item.comment.trim() !== '');

  return (
    <Card
      onPress={onToggleExpand}
      onLongPress={onLongPress}
      padding="md"
      style={{ borderLeftWidth: 4, borderLeftColor: Colors.error }}
    >
      <View style={cardStyles.row}>
        <View style={cardStyles.content}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {item.description || 'Expense'}
          </Text>
          <Text style={cardStyles.subtitle} numberOfLines={1}>
            {subtitle || '—'}
          </Text>
        </View>
        <View style={cardStyles.right}>
          <Text style={[cardStyles.amount, { color: Colors.error }]}>
            -${formatAmount(item.amount)}
          </Text>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={Colors.textSecondary}
            style={{ marginLeft: Spacing.xs }}
          />
        </View>
      </View>

      {isExpanded && hasExpandedContent && (
        <View style={cardStyles.expanded}>
          <View style={cardStyles.divider} />
          {item.quantity != null && (
            <View style={cardStyles.detailRow}>
              <Text style={cardStyles.detailLabel}>Cantidad</Text>
              <Text style={cardStyles.detailValue}>{String(item.quantity)}</Text>
            </View>
          )}

          {storeName != null && storeName !== '' && (
            <View style={cardStyles.detailRow}>
              <Text style={cardStyles.detailLabel}>Tienda</Text>
              <Text style={cardStyles.detailValue}>{storeName}</Text>
            </View>
          )}
          {item.unitPrice != null && (
            <View style={cardStyles.detailRow}>
              <Text style={cardStyles.detailLabel}>Precio/u</Text>
              <Text style={cardStyles.detailValue}>
                {[formatAmount(item.unitPrice), item.unit ?? null]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            </View>
          )}
          {item.rating != null && (
            <View style={cardStyles.detailRow}>
              <Text style={cardStyles.detailLabel}>Rating</Text>
              <Text style={cardStyles.detailValue}>
                {'★'.repeat(Math.round(item.rating))}
                {'☆'.repeat(5 - Math.round(item.rating))}
              </Text>
            </View>
          )}
          {item.comment != null && item.comment.trim() !== '' && (
            <View style={cardStyles.detailRow}>
              <Text style={cardStyles.detailLabel}>Comentario</Text>
              <Text style={cardStyles.detailValue} numberOfLines={3}>
                {item.comment}
              </Text>
            </View>
          )}
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              cardStyles.editButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="edit" size={18} color={Colors.accent} />
            <Text style={cardStyles.editButtonText}>Edit</Text>
          </Pressable>
        </View>
      )}

      {isExpanded && !hasExpandedContent && (
        <View style={cardStyles.expanded}>
          <View style={cardStyles.divider} />
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              cardStyles.editButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="edit" size={18} color={Colors.accent} />
            <Text style={cardStyles.editButtonText}>Edit</Text>
          </Pressable>
        </View>
      )}
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
  right: {
    flexDirection: 'row' as const,
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
    marginTop: 2,
  },
  amount: {
    fontSize: FontSizes.bodyLg,
    fontWeight: '700' as const,
  },
  expanded: {
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    minWidth: 80,
  },
  detailValue: {
    fontSize: FontSizes.caption,
    color: Colors.text,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  editButtonText: {
    fontSize: FontSizes.bodySm,
    color: Colors.accent,
    fontWeight: '600' as const,
  },
};

export default function ExpensesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeExpenseTransactions(user.uid, setTransactions);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    getCategories(user.uid).then((categories) => {
      const map: Record<string, string> = {};
      categories.forEach((c) => { map[c.id] = c.name; });
      setCategoryMap(map);
    });
  }, [user?.uid]);

  const getStoreName = (t: Transaction) =>
    typeof t.store === 'string' ? t.store : t.store?.name ?? '';
  const filtered = search.trim()
    ? transactions.filter(
        (t) =>
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          getStoreName(t).toLowerCase().includes(search.toLowerCase()) ||
          (categoryMap[t.categoryId ?? '']?.toLowerCase().includes(search.toLowerCase())) ||
          (t.comment?.toLowerCase().includes(search.toLowerCase()))
      )
    : transactions;

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const handleAdd = () => router.push('/(home)/(expenses)/form');
  const handleEdit = (id: string) =>
    router.push({ pathname: '/(home)/(expenses)/form', params: { id } });
  const handleDelete = (item: Transaction) => {
    Alert.alert(
      'Delete expense',
      `Delete "${item.description || 'this expense'}"?`,
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
    Alert.alert('Expense', item.description || 'Expense', [
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
      searchPlaceholder="Search expenses..."
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
            <View style={[headerStyles.card, { backgroundColor: Colors.errorMuted }]}>
              <Text style={headerStyles.label}>Total</Text>
              <Text style={[headerStyles.total, { color: Colors.error }]}>
                ${formatAmount(total)}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={emptyStyles.wrap}>
            <View style={[emptyStyles.iconWrap, { backgroundColor: Colors.errorMuted }]}>
              <MaterialIcons name="trending-down" size={48} color={Colors.error} />
            </View>
            <Text style={emptyStyles.title}>No expenses yet</Text>
            <Text style={emptyStyles.subtitle}>Tap + to add your first expense</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: Spacing.sm }}>
            <ExpenseCard
              item={item}
              categoryLabel={item.categoryId ? categoryMap[item.categoryId] : undefined}
              isExpanded={expandedId === item.id}
              onToggleExpand={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              onEdit={() => handleEdit(item.id)}
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
    borderColor: 'rgba(255, 59, 48, 0.3)',
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
