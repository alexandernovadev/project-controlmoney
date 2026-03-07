import React from 'react';
import { TextInput, View, Text, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/lib/theme';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          hasError && styles.inputError,
        ]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            style,
          ]}
          {...props}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    minHeight: 52,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: FontSizes.body,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  hintText: {
    fontSize: FontSizes.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
