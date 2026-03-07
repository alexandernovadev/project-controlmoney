import React, { useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/lib/theme';
import { formatAmount } from '@/lib/utils/format-amount';

export type AmountInputProps = {
  value: string;
  onChangeValue: (value: string) => void;
  label?: string;
  error?: string;
  currencySymbol?: string;
  maxDecimals?: number;
  placeholder?: string;
};

export function AmountInput({
  value,
  onChangeValue,
  label,
  error,
  currencySymbol = '$',
  maxDecimals = 2,
  placeholder = '0.00',
}: AmountInputProps) {
  const handleChange = useCallback(
    (text: string) => {
      const formatted = formatAmount(text, maxDecimals);
      onChangeValue(formatted);
    },
    [maxDecimals, onChangeValue]
  );

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrapper, error && styles.wrapperError]}>
        <Text style={[styles.symbol, !value && styles.symbolMuted]}>{currencySymbol}</Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.bodySm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    minHeight: 56,
    paddingHorizontal: Spacing.md,
  },
  wrapperError: {
    borderColor: Colors.error,
  },
  symbol: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  symbolMuted: {
    color: Colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.h2,
    fontWeight: '600',
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    fontSize: FontSizes.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
