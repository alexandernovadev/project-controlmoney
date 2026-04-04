import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import { getCategories } from '@/lib/firebase/categories';
import { getIncomePaymentMethods } from '@/lib/firebase/income-payment-methods';
import { getTransaction } from '@/lib/firebase/transactions';
import type { Transaction } from '@/lib/models';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { formatAmountNumber } from '@/lib/utils/format-amount';
import { formatDateShort } from '@/lib/utils/format-date';

type FieldRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  accent?: string;
};

function FieldRow({ icon, label, value, accent }: FieldRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, accent && { backgroundColor: accent + '22' }]}>
          <MaterialIcons name={icon} size={18} color={accent ?? Colors.textSecondary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, accent && { color: accent }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

export default function ExpenseViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [paymentMethodName, setPaymentMethodName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !id) return;
    Promise.all([
      getTransaction(user.uid, id),
      getCategories(user.uid),
      getIncomePaymentMethods(user.uid),
    ]).then(([tx, categories, methods]) => {
      setTransaction(tx);
      if (tx) {
        navigation.setOptions({ title: tx.description || 'Gasto' });
        if (tx.categoryId)
          setCategoryName(categories.find((c) => c.id === tx.categoryId)?.name ?? '');
        if (tx.paymentMethodId)
          setPaymentMethodName(methods.find((m) => m.id === tx.paymentMethodId)?.label ?? '');
      }
      setLoading(false);
    });
  }, [user?.uid, id, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Gasto no encontrado.</Text>
      </View>
    );
  }

  const storeObj = typeof transaction.store === 'object' ? transaction.store : null;
  const storeName = storeObj?.name ?? (typeof transaction.store === 'string' ? transaction.store : '');
  const storeAddress = storeObj?.address ?? '';
  const storeCountry = storeObj?.country ?? '';
  const storeLat = storeObj?.lat;
  const storeLng = storeObj?.lng;

  const hasStoreInfo = storeName || storeAddress || storeCountry || storeLat != null;
  const hasQtyInfo = transaction.quantity != null || transaction.unit || transaction.unitPrice != null;
  const hasNotes = transaction.rating != null || (transaction.comment?.trim());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroAmount}>-${formatAmountNumber(transaction.amount)}</Text>
        <View style={styles.heroMeta}>
          <MaterialIcons name="event" size={14} color={Colors.textSecondary} />
          <Text style={styles.heroDate}>{formatDateShort(transaction.date)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Info básica */}
        <SectionCard>
          {categoryName ? (
            <FieldRow icon="label-outline" label="Categoría" value={categoryName} />
          ) : null}
          {paymentMethodName ? (
            <FieldRow icon="account-balance-wallet" label="Método de pago" value={paymentMethodName} accent={Colors.accent} />
          ) : null}
          {transaction.brand ? (
            <FieldRow icon="storefront" label="Marca" value={transaction.brand} />
          ) : null}
          <FieldRow icon="event" label="Fecha" value={formatDateShort(transaction.date)} />
        </SectionCard>

        {/* Tienda */}
        {hasStoreInfo ? (
          <SectionCard>
            {storeName ? <FieldRow icon="store" label="Tienda" value={storeName} /> : null}
            {storeAddress ? <FieldRow icon="place" label="Dirección" value={storeAddress} /> : null}
            {storeCountry ? <FieldRow icon="flag" label="País" value={storeCountry} /> : null}
            {storeLat != null && storeLng != null ? (
              <FieldRow
                icon="my-location"
                label="Coordenadas"
                value={`${storeLat.toFixed(5)}, ${storeLng.toFixed(5)}`}
              />
            ) : null}
          </SectionCard>
        ) : null}

        {/* Cantidad */}
        {hasQtyInfo ? (
          <SectionCard>
            {transaction.quantity != null ? (
              <FieldRow icon="format-list-numbered" label="Cantidad" value={String(transaction.quantity)} />
            ) : null}
            {transaction.unit ? (
              <FieldRow icon="straighten" label="Unidad" value={transaction.unit} />
            ) : null}
            {transaction.unitPrice != null ? (
              <FieldRow icon="sell" label="Precio unitario" value={`$${formatAmountNumber(transaction.unitPrice)}`} />
            ) : null}
            {transaction.quantity != null && transaction.quantity > 1 ? (
              <FieldRow
                icon="calculate"
                label="Precio c/u"
                value={`$${formatAmountNumber(transaction.amount / transaction.quantity)}`}
              />
            ) : null}
          </SectionCard>
        ) : null}

        {/* Notas */}
        {hasNotes ? (
          <SectionCard>
            {transaction.rating != null ? (
              <FieldRow
                icon="star"
                label="Rating"
                value={'★'.repeat(Math.round(transaction.rating)) + '☆'.repeat(5 - Math.round(transaction.rating))}
                accent={Colors.warning}
              />
            ) : null}
            {transaction.comment?.trim() ? (
              <FieldRow icon="chat-bubble-outline" label="Comentario" value={transaction.comment.trim()} />
            ) : null}
          </SectionCard>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: -1,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  heroDate: {
    fontSize: FontSizes.bodySm,
    color: Colors.textSecondary,
  },

  // Content
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 0,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
});
