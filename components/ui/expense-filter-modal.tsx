import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes } from '@/lib/theme';
import { DateInput } from './date-input';
import { AmountInput } from './amount-input';
import { Button } from './button';
import { getMonthRange } from '@/lib/utils/format-date';
import type { Unit } from '@/lib/models';

export type ExpenseFilterValues = {
  period: 'current' | 'last' | 'all' | { from: string; to: string };
  amountMin: string;
  amountMax: string;
  categoryIds: string[]; // empty means all
  ratingMin: string;
};

export type ExpenseFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  initialValues: ExpenseFilterValues;
  onApply: (values: ExpenseFilterValues) => void;
  categories: { id: string; name: string }[];
};

export function ExpenseFilterModal({
  visible,
  onClose,
  initialValues,
  onApply,
  categories,
}: ExpenseFilterModalProps) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<'current' | 'last' | 'all' | 'custom'>(
    typeof initialValues.period === 'object' ? 'custom' : initialValues.period
  );
  const [amountMin, setAmountMin] = useState(initialValues.amountMin);
  const [amountMax, setAmountMax] = useState(initialValues.amountMax);
  const [categoryIds, setCategoryIds] = useState<string[]>(initialValues.categoryIds);
  const [ratingMin, setRatingMin] = useState(initialValues.ratingMin);
  const [dateFrom, setDateFrom] = useState(
    typeof initialValues.period === 'object'
      ? initialValues.period.from
      : new Date().toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(
    typeof initialValues.period === 'object'
      ? initialValues.period.to
      : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (visible) {
      setPeriod(typeof initialValues.period === 'object' ? 'custom' : initialValues.period);
      setAmountMin(initialValues.amountMin);
      setAmountMax(initialValues.amountMax);
      setCategoryIds(initialValues.categoryIds);
      setRatingMin(initialValues.ratingMin);
      if (typeof initialValues.period === 'object') {
        setDateFrom(initialValues.period.from);
        setDateTo(initialValues.period.to);
      }
    }
  }, [visible, initialValues]);

  const handleApply = () => {
    const periodValue: ExpenseFilterValues['period'] =
      period === 'custom' ? { from: dateFrom, to: dateTo } : period;
    onApply({
      period: periodValue,
      amountMin,
      amountMax,
      categoryIds,
      ratingMin,
    });
    onClose();
  };

  const handleClear = () => {
    const now = new Date();
    const { start, end } = getMonthRange(now.getFullYear(), now.getMonth());
    setPeriod('current');
    setAmountMin('');
    setAmountMax('');
    setCategoryIds([]);
    setRatingMin('');
    setDateFrom(start.split('T')[0]);
    setDateTo(end.split('T')[0]);
    onApply({
      period: 'current',
      amountMin: '',
      amountMax: '',
      categoryIds: [],
      ratingMin: '',
    });
    onClose();
  };

  const toggleCategory = (id: string) => {
    if (categoryIds.includes(id)) {
      setCategoryIds(categoryIds.filter((cid) => cid !== id));
    } else {
      setCategoryIds([...categoryIds, id]);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Filtros de Gastos</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets
            >
              <Text style={styles.sectionLabel}>Período</Text>
              <View style={styles.chipRow}>
                {(['current', 'last', 'all'] as const).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPeriod(p)}
                    style={[styles.chip, period === p && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, period === p && styles.chipTextSelected]}>
                      {p === 'current' ? 'Este mes' : p === 'last' ? 'Mes pasado' : 'Todos'}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setPeriod('custom')}
                  style={[styles.chip, period === 'custom' && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, period === 'custom' && styles.chipTextSelected]}>
                    Personalizado
                  </Text>
                </Pressable>
              </View>

              {period === 'custom' && (
                <View style={styles.dateRow}>
                  <View style={styles.dateHalf}>
                    <DateInput label="Desde" value={dateFrom} onChangeValue={setDateFrom} />
                  </View>
                  <View style={styles.dateHalf}>
                    <DateInput label="Hasta" value={dateTo} onChangeValue={setDateTo} />
                  </View>
                </View>
              )}

              <Text style={styles.sectionLabel}>Monto</Text>
              <View style={styles.amountRow}>
                <View style={styles.amountHalf}>
                  <AmountInput
                    label="Desde"
                    value={amountMin}
                    onChangeValue={setAmountMin}
                    placeholder="0"
                  />
                </View>
                <View style={styles.amountHalf}>
                  <AmountInput
                    label="Hasta"
                    value={amountMax}
                    onChangeValue={setAmountMax}
                    placeholder="Sin límite"
                  />
                </View>
              </View>

              <Text style={styles.sectionLabel}>Categorías</Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => setCategoryIds([])}
                  style={[styles.chip, categoryIds.length === 0 && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, categoryIds.length === 0 && styles.chipTextSelected]}>
                    Todas
                  </Text>
                </Pressable>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    style={[styles.chip, categoryIds.includes(cat.id) && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, categoryIds.includes(cat.id) && styles.chipTextSelected]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Calificación mínima</Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => setRatingMin('')}
                  style={[styles.chip, ratingMin === '' && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, ratingMin === '' && styles.chipTextSelected]}>
                    Cualquiera
                  </Text>
                </Pressable>
                {['1', '2', '3', '4', '5'].map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRatingMin(r)}
                    style={[styles.chip, ratingMin === r && styles.chipSelected]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.chipText, ratingMin === r && styles.chipTextSelected]}>
                        {r}
                      </Text>
                      <MaterialIcons 
                        name="star" 
                        size={14} 
                        color={ratingMin === r ? Colors.success : Colors.textSecondary} 
                        style={{ marginLeft: 2 }} 
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Limpiar"
                variant="ghost"
                onPress={handleClear}
                style={styles.footerBtn}
              />
              <Button
                title="Aplicar"
                variant="primary"
                onPress={handleApply}
                style={styles.footerBtn}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  scroll: {
    maxHeight: 500,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.bodySm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  chipSelected: {
    backgroundColor: Colors.successMuted,
    borderColor: Colors.success,
  },
  chipText: {
    fontSize: FontSizes.bodySm,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.success,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  dateHalf: {
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  amountHalf: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerBtn: {
    flex: 1,
  },
});
