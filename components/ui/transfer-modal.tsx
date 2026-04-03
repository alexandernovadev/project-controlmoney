import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { AmountInput } from './amount-input';
import { Button } from './button';
import { SelectModal, type SelectOption } from './select-modal';

export type TransferModalProps = {
  visible: boolean;
  onClose: () => void;
  paymentMethodOptions: SelectOption[];
  onConfirm: (params: {
    amount: number;
    fromMethodId: string;
    toMethodId: string;
    fromLabel: string;
    toLabel: string;
  }) => Promise<void>;
};

export function TransferModal({
  visible,
  onClose,
  paymentMethodOptions,
  onConfirm,
}: TransferModalProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [fromMethodId, setFromMethodId] = useState<string | null>(null);
  const [toMethodId, setToMethodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setAmount('');
    setFromMethodId(null);
    setToMethodId(null);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }
    if (!fromMethodId) {
      setError('Selecciona la cuenta de origen.');
      return;
    }
    if (!toMethodId) {
      setError('Selecciona la cuenta de destino.');
      return;
    }
    if (fromMethodId === toMethodId) {
      setError('El origen y destino no pueden ser iguales.');
      return;
    }

    const fromLabel = paymentMethodOptions.find((o) => o.value === fromMethodId)?.label ?? '';
    const toLabel = paymentMethodOptions.find((o) => o.value === toMethodId)?.label ?? '';

    setLoading(true);
    setError('');
    try {
      await onConfirm({ amount: parsedAmount, fromMethodId, toMethodId, fromLabel, toLabel });
      reset();
      onClose();
    } catch {
      setError('Error al registrar la transferencia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconBadge}>
                  <MaterialIcons name="swap-horiz" size={18} color="#AF52DE" />
                </View>
                <Text style={styles.title}>Transferencia</Text>
              </View>
              <Pressable onPress={handleClose} hitSlop={12} style={({ pressed }) => pressed && styles.pressed}>
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            <View style={styles.body}>
              <AmountInput label="Monto" value={amount} onChangeValue={setAmount} />

              <View style={styles.row}>
                <View style={styles.half}>
                  <SelectModal
                    label="De"
                    placeholder="Origen"
                    value={fromMethodId}
                    onValueChange={setFromMethodId}
                    options={paymentMethodOptions}
                  />
                </View>

                <View style={styles.arrowWrap}>
                  <MaterialIcons name="arrow-forward" size={20} color={Colors.textMuted} />
                </View>

                <View style={styles.half}>
                  <SelectModal
                    label="Hacia"
                    placeholder="Destino"
                    value={toMethodId}
                    onValueChange={setToMethodId}
                    options={paymentMethodOptions}
                  />
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.footer}>
              <Button title="Cancelar" variant="ghost" onPress={handleClose} style={styles.footerBtn} />
              {loading ? (
                <View style={[styles.footerBtn, styles.loadingBtn]}>
                  <ActivityIndicator color={Colors.text} />
                </View>
              ) : (
                <Button title="Transferir" variant="primary" onPress={handleConfirm} style={[styles.footerBtn, styles.confirmBtn]} />
              )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(175, 82, 222, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  half: {
    flex: 1,
  },
  arrowWrap: {
    paddingBottom: 18,
  },
  errorText: {
    fontSize: FontSizes.caption,
    color: Colors.error,
    backgroundColor: Colors.errorMuted,
    padding: Spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: Spacing.xs,
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
  confirmBtn: {
    backgroundColor: '#AF52DE',
  },
  loadingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#AF52DE',
  },
});
