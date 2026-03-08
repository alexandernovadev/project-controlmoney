import React, { useState, useEffect, useRef } from 'react';
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

export type IncomeFilterValues = {
  period: 'current' | 'last' | 'all' | { from: string; to: string };
  type: 'all' | 'cash' | 'digital';
  amountMin: string;
  amountMax: string;
};

export type IncomeFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  initialValues: IncomeFilterValues;
  onApply: (values: IncomeFilterValues) => void;
};

export function IncomeFilterModal({
  visible,
  onClose,
  initialValues,
  onApply,
}: IncomeFilterModalProps) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<
    'current' | 'last' | 'all' | 'custom'
  >(
    typeof initialValues.period === 'object' ? 'custom' : initialValues.period
  );
  const [type, setType] = useState<IncomeFilterValues['type']>(
    initialValues.type
  );
  const [amountMin, setAmountMin] = useState(initialValues.amountMin);
  const [amountMax, setAmountMax] = useState(initialValues.amountMax);
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

  const prevVisibleRef = useRef(false);
  useEffect(() => {
    if (visible) {
      const justOpened = !prevVisibleRef.current;
      prevVisibleRef.current = true;
      if (justOpened) {
        setPeriod(
          typeof initialValues.period === 'object' ? 'custom' : initialValues.period
        );
        setType(initialValues.type);
        setAmountMin(initialValues.amountMin);
        setAmountMax(initialValues.amountMax);
        if (typeof initialValues.period === 'object') {
          setDateFrom(initialValues.period.from);
          setDateTo(initialValues.period.to);
        }
      }
    } else {
      prevVisibleRef.current = false;
    }
  }, [visible, initialValues]);

  const handleApply = () => {
    const periodValue: IncomeFilterValues['period'] =
      period === 'custom' ? { from: dateFrom, to: dateTo } : period;
    onApply({
      period: periodValue,
      type,
      amountMin,
      amountMax,
    });
    onClose();
  };

  const handleClear = () => {
    const now = new Date();
    const { start, end } = getMonthRange(now.getFullYear(), now.getMonth());
    setPeriod('current');
    setType('all');
    setAmountMin('');
    setAmountMax('');
    setDateFrom(start.split('T')[0]);
    setDateTo(end.split('T')[0]);
    onApply({
      period: 'current',
      type: 'all',
      amountMin: '',
      amountMax: '',
    });
    onClose();
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
            <Text style={styles.title}>Filtros</Text>
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
                  style={[
                    styles.chip,
                    period === p && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      period === p && styles.chipTextSelected,
                    ]}
                  >
                    {p === 'current' ? 'Este mes' : p === 'last' ? 'Mes pasado' : 'Todos'}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setPeriod('custom')}
                style={[
                  styles.chip,
                  period === 'custom' && styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    period === 'custom' && styles.chipTextSelected,
                  ]}
                >
                  Personalizado
                </Text>
              </Pressable>
            </View>

            {period === 'custom' && (
              <View style={styles.dateRow}>
                <View style={styles.dateHalf}>
                  <DateInput
                    label="Desde"
                    value={dateFrom}
                    onChangeValue={setDateFrom}
                  />
                </View>
                <View style={styles.dateHalf}>
                  <DateInput
                    label="Hasta"
                    value={dateTo}
                    onChangeValue={setDateTo}
                  />
                </View>
              </View>
            )}

            <Text style={styles.sectionLabel}>Tipo</Text>
            <View style={styles.chipRow}>
              {(['all', 'cash', 'digital'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[styles.chip, type === t && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      type === t && styles.chipTextSelected,
                    ]}
                  >
                    {t === 'all' ? 'Todos' : t === 'cash' ? 'Cash' : 'Digital'}
                  </Text>
                </Pressable>
              ))}
            </View>

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
  keyboardAvoid: {
    width: '100%',
  },
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
    maxHeight: 400,
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
