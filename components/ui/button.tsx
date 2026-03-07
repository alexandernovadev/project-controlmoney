import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { Colors, FontSizes } from '@/lib/theme';
import { Spacing } from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.backgroundElevated,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const variantTextColors: Record<ButtonVariant, string> = {
  primary: Colors.text,
  secondary: Colors.text,
  danger: Colors.text,
  outline: Colors.text,
  ghost: Colors.accent,
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth,
  leftIcon,
  rightIcon,
  style,
  ...props
}: ButtonProps) {
  const textColor = variantTextColors[variant];
  const isDisabled = disabled || loading;

  const paddingVertical = size === 'sm' ? Spacing.sm : size === 'lg' ? Spacing.lg : Spacing.md;
  const paddingHorizontal = size === 'sm' ? Spacing.md : size === 'lg' ? Spacing.xl : Spacing.lg;
  const fontSize =
    size === 'sm' ? FontSizes.bodySm : size === 'lg' ? FontSizes.bodyLg : FontSizes.body;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        {
          paddingVertical,
          paddingHorizontal,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style as ViewStyle,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: Spacing.sm,
  },
  icon: {},
  text: {
    fontWeight: '600',
  },
});
