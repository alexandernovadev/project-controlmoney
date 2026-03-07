import React from 'react';
import { View, Text, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/lib/theme';

type BadgeVariant = 'income' | 'expense' | 'neutral' | 'warning';

export type BadgeProps = ViewProps & {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
};

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  income: {
    bg: Colors.successMuted,
    text: Colors.success,
  },
  expense: {
    bg: Colors.errorMuted,
    text: Colors.error,
  },
  neutral: {
    bg: Colors.backgroundSecondary,
    text: Colors.textSecondary,
  },
  warning: {
    bg: Colors.warningMuted,
    text: Colors.warning,
  },
};

export function Badge({ label, variant = 'neutral', size = 'md', style, ...props }: BadgeProps) {
  const { bg, text } = variantStyles[variant];
  const paddingH = size === 'sm' ? Spacing.sm : Spacing.md;
  const paddingV = size === 'sm' ? Spacing.xs : Spacing.sm;
  const fontSize = size === 'sm' ? FontSizes.caption : FontSizes.bodySm;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, paddingHorizontal: paddingH, paddingVertical: paddingV },
        style,
      ]}
      {...props}>
      <Text style={[styles.text, { color: text, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
