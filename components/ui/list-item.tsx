import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/lib/theme';

export type ListItemProps = ViewProps & {
  title: string;
  subtitle?: string;
  amount?: string;
  amountType?: 'income' | 'expense';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function ListItem({
  title,
  subtitle,
  amount,
  amountType,
  leftIcon,
  rightIcon,
  onPress,
  onLongPress,
  style,
  ...props
}: ListItemProps) {
  const amountColor = amountType === 'income' ? Colors.success : amountType === 'expense' ? Colors.error : Colors.text;

  const content = (
    <>
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {amount ? (
        <Text style={[styles.amount, { color: amountColor }]}>{amount}</Text>
      ) : null}
      {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
    </>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
        {...props}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, style]} {...props}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
});
