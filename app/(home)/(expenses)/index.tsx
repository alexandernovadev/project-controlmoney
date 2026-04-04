import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListPageLayout } from '@/components/layout/list-page-layout';
import { Card } from '@/components/ui/card';
import { ExpenseFilterModal, type ExpenseFilterValues } from '@/components/ui/expense-filter-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import {
  deleteTransaction,
  subscribeExpenseTransactions,
} from '@/lib/firebase/transactions';
import type { Transaction } from '@/lib/models';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { formatAmountNumber } from '@/lib/utils/format-amount';
import { formatDateShort, getSubscriptionOptionsFromPeriod, MONTH_NAMES } from '@/lib/utils/format-date';
import { calculateTotal } from '@/lib/utils/calculations';

type ExpenseCardProps = {
  item: Transaction;
  categoryLabel?: string;
  paymentMethodLabel?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function ExpenseCard({
  item,
  categoryLabel,
  paymentMethodLabel,
  onView,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const storeName = typeof item.store === 'string' ? item.store : item.store?.name;
  const subtitleParts = [
    categoryLabel ?? null,
  ].filter(Boolean);
  const subtitle = subtitleParts.join(' · ');

  const hasExpandedContent =
    item.brand != null ||
    item.quantity != null ||
    item.unit != null ||
    storeName != null ||
    item.unitPrice != null ||
    item.rating != null ||
    paymentMethodLabel != null ||
    (item.comment != null && item.comment.trim() !== '');

  return (
    <Card
      padding="sm"
      style={{ borderLeftWidth: 2, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.sm }}
    >
      <View style={cardStyles.container}>
        {/* Row 1: Description */}
        <Text style={cardStyles.title}>
          {item.description || 'Expense'}
          {item.brand ? (
            <Text style={cardStyles.brandTextInline}>
              {` - ${item.brand}`}
            </Text>
          ) : null}
          {(item.unit || item.unitPrice != null) ? (
            <Text style={cardStyles.unitTextInline}>
              {' ('}
              {[
                item.unitPrice != null ? `${formatAmountNumber(item.unitPrice)}` : null,
                item.unit ? `${item.unit}` : null
              ].filter(Boolean).join('')}
              {')'}

            </Text>
          ) : null}
        </Text>

        {/* Row 2: Category and Price */}
        <View style={cardStyles.middleRow}>
          {subtitle ? (
            <Text style={cardStyles.subtitle}>
              {subtitle}
            </Text>
          ) : <View style={{ flex: 1 }} />}
          <View style={cardStyles.right}>
            <Text style={[cardStyles.amount, { color: Colors.error }]}>
              -${formatAmountNumber(item.amount)}
            </Text>
          </View>
        </View>

        {/* Row 3: Date */}
        <Text style={cardStyles.date}>
          {formatDateShort(item.date)}
        </Text>
      </View>

      <View style={cardStyles.expanded}>
        {hasExpandedContent && (
          <>
            <View style={cardStyles.divider} />
            
            {paymentMethodLabel != null && paymentMethodLabel !== '' && (
              <View style={cardStyles.detailRow}>
                <Text style={cardStyles.detailLabel}>Pago con</Text>
                <Text style={cardStyles.detailValue}>{paymentMethodLabel}</Text>
              </View>
            )}

            {item.brand != null && item.brand !== '' && (
              <View style={cardStyles.detailRow}>
                <Text style={cardStyles.detailLabel}>Marca</Text>
                <Text style={cardStyles.detailValue}>{item.brand}</Text>
              </View>
            )}
            {item.quantity != null && (
              <View style={cardStyles.detailRow}>
                <Text style={cardStyles.detailLabel}>Cantidad</Text>
                <Text style={cardStyles.detailValue}>
                  {String(item.quantity)}
                  {item.quantity > 1 && (
                    <Text style={{ fontSize: FontSizes.caption, color: Colors.textSecondary }}>
                      {' '}
                      (c/u {formatAmountNumber(item.amount / item.quantity)})
                    </Text>
                  )}
                </Text>
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
                <Text style={cardStyles.detailLabel}>Valor</Text>
                <Text style={cardStyles.detailValue}>
                  {[formatAmountNumber(item.unitPrice), item.unit ?? null]
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
          </>
        )}
        
        {/* Siempre mostramos los botones, con su divisor si no hay contenido expandido para no pegar los botones a la fecha */}
        {!hasExpandedContent && <View style={[cardStyles.divider, { marginBottom: Spacing.xs }]} />}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.xs }}>
          <Pressable
            onPress={onView}
            style={({ pressed }) => [
              cardStyles.actionButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="visibility" size={18} color={Colors.textSecondary} />
            <Text style={[cardStyles.editButtonText, { color: Colors.textSecondary }]}>Ver</Text>
          </Pressable>

          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              cardStyles.actionButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="edit" size={18} color={Colors.accent} />
            <Text style={cardStyles.editButtonText}>Editar</Text>
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [
              cardStyles.actionButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
            <Text style={[cardStyles.editButtonText, { color: Colors.error }]}>Eliminar</Text>
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
  right: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  brandTextInline: {
    fontSize: FontSizes.bodySm,
    fontStyle: 'italic' as const,
    fontWeight: 'normal' as const,
    color: Colors.brandText,
  },
  unitTextInline: {
    fontSize: FontSizes.caption,
    fontWeight: 'normal' as const,
    color: Colors.textSecondary,
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
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, string>>({});

  const [filterVisible, setFilterVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterValues, setFilterValues] = useState<ExpenseFilterValues>(() => ({
    period: 'all',
    amountMin: '',
    amountMax: '',
    categoryIds: [],
    ratingMin: '',
  }));

  useEffect(() => {
    if (!user?.uid) return;
    const options = getSubscriptionOptionsFromPeriod(filterValues.period);
    return subscribeExpenseTransactions(user.uid, setTransactions, options);
  }, [user?.uid, filterValues.period]);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      getCategories(user.uid),
      getIncomePaymentMethods(user.uid)
    ]).then(([categorias, methods]) => {
      setCategories(categorias);
      const map: Record<string, string> = {};
      categorias.forEach((c) => { map[c.id] = c.name; });
      setCategoryMap(map);

      const pMethodMap: Record<string, string> = {};
      methods.forEach((m) => { pMethodMap[m.id] = m.label; });
      setPaymentMethodMap(pMethodMap);
    });
  }, [user?.uid]);

  const getStoreName = (t: Transaction) =>
    typeof t.store === 'string' ? t.store : t.store?.name ?? '';

  let filtered = transactions;

  // Amount filters
  const amountMinNum = filterValues.amountMin ? parseFloat(filterValues.amountMin) : NaN;
  const amountMaxNum = filterValues.amountMax ? parseFloat(filterValues.amountMax) : NaN;
  if (!isNaN(amountMinNum)) {
    filtered = filtered.filter((t) => t.amount >= amountMinNum);
  }
  if (!isNaN(amountMaxNum)) {
    filtered = filtered.filter((t) => t.amount <= amountMaxNum);
  }

  // Categories filter
  if (filterValues.categoryIds.length > 0) {
    filtered = filtered.filter((t) => t.categoryId && filterValues.categoryIds.includes(t.categoryId));
  }

  // Rating filter
  if (filterValues.ratingMin) {
    const minRating = parseInt(filterValues.ratingMin, 10);
    filtered = filtered.filter((t) => t.rating != null && t.rating >= minRating);
  }

  if (search.trim()) {
    filtered = filtered.filter(
      (t) =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.brand?.toLowerCase().includes(search.toLowerCase()) ||
        getStoreName(t).toLowerCase().includes(search.toLowerCase()) ||
        (categoryMap[t.categoryId ?? '']?.toLowerCase().includes(search.toLowerCase())) ||
        (t.comment?.toLowerCase().includes(search.toLowerCase()))
    );
  }

  const total = calculateTotal(filtered);

  const handleAdd = () => router.push('/(home)/(expenses)/form');
  const handleView = (id: string) =>
    router.push({ pathname: '/(home)/(expenses)/view', params: { id } });
  const handleEdit = (id: string) =>
    router.push({ pathname: '/(home)/(expenses)/form', params: { id } });
  const handleDelete = (item: Transaction) => setDeleteTarget(item);

  const confirmDelete = async () => {
    if (!user?.uid || !deleteTarget) return;
    setDeleting(true);
    await deleteTransaction(user.uid, deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
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
      <ConfirmModal
        visible={!!deleteTarget}
        title="Eliminar gasto"
        message={`¿Eliminar "${deleteTarget?.description || 'este gasto'}"?`}
        confirmLabel="Eliminar"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ExpenseFilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        initialValues={filterValues}
        onApply={setFilterValues}
        categories={categories}
      />
      <ListPageLayout
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search expenses..."
        onFilterPress={handleFilterPress}
        onAddPress={handleAdd}
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
              <View style={[headerStyles.card, { backgroundColor: Colors.errorMuted, borderColor: 'rgba(255, 59, 48, 0.3)' }]}>
                <View style={headerStyles.cardHeader}>
                  <MaterialIcons name="trending-down" size={16} color={Colors.error} />
                  <Text style={[headerStyles.label, { color: Colors.error }]}>Total Gastos</Text>
                </View>
                <Text style={[headerStyles.total, { color: Colors.error }]}>
                  ${formatAmountNumber(total)}
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
                paymentMethodLabel={item.paymentMethodId ? paymentMethodMap[item.paymentMethodId] : undefined}
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
  card: {
    borderRadius: 16,
    padding: Spacing.xs,
    borderWidth: 1,
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
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  total: {
    fontSize: FontSizes.h2,
    fontWeight: '700' as const,
  },
};
