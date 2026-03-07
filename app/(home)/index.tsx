import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import { subscribeExpenseTransactions, subscribeIncomeTransactions } from '@/lib/firebase/transactions';
import type { Transaction } from '@/lib/models';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { MONTH_NAMES, getSubscriptionOptionsFromPeriod } from '@/lib/utils/format-date';
import { formatAmountNumber } from '@/lib/utils/format-amount';
import { formatDateShort } from '@/lib/utils/format-date';

// We'll reuse the Expense Filter Modal types for the generic period filter
import { IncomeFilterModal, type IncomeFilterValues } from '@/components/ui/filter-modal';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, 'cash' | 'digital'>>({});
  
  // Filter state (only using period for home)
  const [filterVisible, setFilterVisible] = useState(false);
  const [period, setPeriod] = useState<IncomeFilterValues['period']>('current');

  // Subscriptions
  useEffect(() => {
    if (!user?.uid) return;
    const options = getSubscriptionOptionsFromPeriod(period);
    
    const unsubIncomes = subscribeIncomeTransactions(user.uid, setIncomes, options);
    const unsubExpenses = subscribeExpenseTransactions(user.uid, setExpenses, options);
    
    return () => {
      unsubIncomes();
      unsubExpenses();
    };
  }, [user?.uid, period]);

  // Load Metadata
  useEffect(() => {
    if (!user?.uid) return;
    
    getCategories(user.uid).then((cats) => {
      const map: Record<string, string> = {};
      cats.forEach((c) => { map[c.id] = c.name; });
      setCategories(map);
    });

    getIncomePaymentMethods(user.uid).then((methods) => {
      const map: Record<string, 'cash' | 'digital'> = {};
      methods.forEach((m) => { map[m.id] = m.type; });
      setPaymentMethods(map);
    });
  }, [user?.uid]);

  // Derived Data: Totals
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Derived Data: Cash vs Digital
  const cashIncome = incomes.reduce((sum, t) => 
    t.paymentMethodId && paymentMethods[t.paymentMethodId] === 'cash' ? sum + t.amount : sum, 0
  );
  const digitalIncome = totalIncome - cashIncome;

  // Derived Data: Expenses by Category
  const expensesByCategory = expenses.reduce((acc, t) => {
    const catId = t.categoryId || 'uncategorized';
    acc[catId] = (acc[catId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, amount]) => ({
      id,
      name: categories[id] || 'Other',
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }));

  // Derived Data: Insights (Expenses)
  const mostExpensive = expenses.length > 0 
    ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
    : null;

  const cheapest = expenses.length > 0
    ? expenses.reduce((min, t) => t.amount < min.amount ? t : min, expenses[0])
    : null;

  // Count repetitions by description/store
  const repetitions = expenses.reduce((acc, t) => {
    const key = t.description?.toLowerCase().trim() || 
                (typeof t.store === 'string' ? t.store : t.store?.name)?.toLowerCase().trim() || 
                'Unknown';
    if (!acc[key]) acc[key] = { count: 0, total: 0, name: t.description || 'Unknown' };
    acc[key].count += 1;
    acc[key].total += t.amount;
    return acc;
  }, {} as Record<string, { count: number, total: number, name: string }>);

  const mostRepeated = Object.values(repetitions)
    .filter(r => r.count > 1)
    .sort((a, b) => b.count - a.count)[0] || null;

  // Filter label
  const filterLabel = (() => {
    if (period === 'all') return 'Todos los meses';
    if (period === 'current') {
      const now = new Date();
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }
    if (period === 'last') {
      const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1);
      return `${MONTH_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;
    }
    return `${period.from} – ${period.to}`;
  })();

  return (
    <>
      {/* We reuse IncomeFilterModal but only care about the period. We hide type/amount by applying them as default. */}
      <IncomeFilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        initialValues={{ period, type: 'all', amountMin: '', amountMax: '' }}
        onApply={(vals) => setPeriod(vals.period)}
      />

      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Card 
            onPress={() => setFilterVisible(true)} 
            padding="sm" 
            style={styles.filterBtn}
          >
            <View style={styles.filterBtnContent}>
              <MaterialIcons name="calendar-today" size={16} color={Colors.textSecondary} />
              <Text style={styles.filterBtnText}>{filterLabel}</Text>
              <MaterialIcons name="arrow-drop-down" size={16} color={Colors.textSecondary} />
            </View>
          </Card>
        </View>

        {/* BALANCE */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Dinero Disponible</Text>
          <Text style={[styles.balanceAmount, balance < 0 && { color: Colors.error }]}>
            ${formatAmountNumber(balance)}
          </Text>
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceHalf}>
              <View style={styles.statHeader}>
                <MaterialIcons name="arrow-downward" size={16} color={Colors.success} />
                <Text style={styles.statLabel}>Ingresos</Text>
              </View>
              <Text style={[styles.statAmount, { color: Colors.success }]}>
                +${formatAmountNumber(totalIncome)}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceHalf}>
              <View style={styles.statHeader}>
                <MaterialIcons name="arrow-upward" size={16} color={Colors.error} />
                <Text style={styles.statLabel}>Gastos</Text>
              </View>
              <Text style={[styles.statAmount, { color: Colors.error }]}>
                -${formatAmountNumber(totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* CASH VS DIGITAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de Ingresos</Text>
          <View style={styles.cardsRow}>
            <Card style={styles.miniCard}>
              <View style={styles.miniCardHeader}>
                <MaterialIcons name="payments" size={16} color={Colors.success} />
                <Text style={styles.miniCardLabel}>Efectivo</Text>
              </View>
              <Text style={styles.miniCardAmount}>${formatAmountNumber(cashIncome)}</Text>
            </Card>
            <Card style={styles.miniCard}>
              <View style={styles.miniCardHeader}>
                <MaterialIcons name="account-balance-wallet" size={16} color={Colors.accent} />
                <Text style={styles.miniCardLabel}>Digital</Text>
              </View>
              <Text style={styles.miniCardAmount}>${formatAmountNumber(digitalIncome)}</Text>
            </Card>
          </View>
        </View>

        {/* TOP CATEGORIES */}
        {topCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Gastos</Text>
            <Card padding="sm">
              {topCategories.map((cat, index) => (
                <View key={cat.id} style={[styles.categoryRow, index > 0 && { marginTop: Spacing.sm }]}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryAmount}>${formatAmountNumber(cat.amount)}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${cat.percentage}%`, backgroundColor: Colors.error }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* INSIGHTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights de Gastos</Text>
          <View style={{ gap: Spacing.sm }}>
            {mostExpensive && (
              <Card style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <View style={[styles.insightIconBg, { backgroundColor: Colors.errorMuted }]}>
                    <MaterialIcons name="local-fire-department" size={16} color={Colors.error} />
                  </View>
                  <Text style={styles.insightDescText} numberOfLines={1}>{mostExpensive.description}</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabelText}>Más caro</Text>
                  <Text style={styles.insightPriceText}>${formatAmountNumber(mostExpensive.amount)}</Text>
                </View>
              </Card>
            )}

            {mostRepeated && (
              <Card style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <View style={[styles.insightIconBg, { backgroundColor: Colors.warningMuted }]}>
                    <MaterialIcons name="repeat" size={16} color={Colors.warning} />
                  </View>
                  <Text style={styles.insightDescText} numberOfLines={1}>{mostRepeated.name}</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabelText}>{mostRepeated.count} veces</Text>
                  <Text style={styles.insightPriceText}>${formatAmountNumber(mostRepeated.total)}</Text>
                </View>
              </Card>
            )}

            {cheapest && (
              <Card style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <View style={[styles.insightIconBg, { backgroundColor: Colors.successMuted }]}>
                    <MaterialIcons name="arrow-downward" size={16} color={Colors.success} />
                  </View>
                  <Text style={styles.insightDescText} numberOfLines={1}>{cheapest.description}</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabelText}>Más barato</Text>
                  <Text style={styles.insightPriceText}>${formatAmountNumber(cheapest.amount)}</Text>
                </View>
              </Card>
            )}
          </View>
        </View>

        {/* LATEST TRANSACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos 5 Gastos</Text>
          <Card padding="sm">
            {expenses.slice(0, 5).map((t, index) => (
              <View key={t.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.recentRow}>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle} numberOfLines={1}>{t.description}</Text>
                    <Text style={styles.recentDate}>{formatDateShort(t.date)}</Text>
                  </View>
                  <Text style={styles.recentAmount}>-${formatAmountNumber(t.amount)}</Text>
                </View>
              </View>
            ))}
            {expenses.length === 0 && (
              <Text style={styles.emptyText}>No hay gastos registrados</Text>
            )}
          </Card>
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.h2,
    fontWeight: '700',
    color: Colors.text,
  },
  filterBtn: {
    borderRadius: 20,
    backgroundColor: Colors.backgroundElevated,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  filterBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  filterBtnText: {
    fontSize: FontSizes.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 24,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  balanceHalf: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statAmount: {
    fontSize: FontSizes.h3,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  miniCard: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
  },
  miniCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  miniCardLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  miniCardAmount: {
    fontSize: FontSizes.h3,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryRow: {
    width: '100%',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.bodySm,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: FontSizes.bodySm,
    color: Colors.text,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightCard: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundElevated,
    gap: 4,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightDescText: {
    flex: 1,
    textAlign: 'right',
    fontSize: FontSizes.bodySm,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
  insightLabelText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  insightPriceText: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    color: Colors.text,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  recentTitle: {
    fontSize: FontSizes.bodySm,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
  },
  recentAmount: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    color: Colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  emptyText: {
    fontSize: FontSizes.bodySm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});

