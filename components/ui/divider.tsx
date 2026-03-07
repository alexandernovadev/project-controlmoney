import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Spacing } from '@/lib/theme';

export type DividerProps = ViewProps & {
  vertical?: boolean;
  spacing?: keyof typeof Spacing;
};

export function Divider({ vertical, spacing = 'md', style, ...props }: DividerProps) {
  const margin = Spacing[spacing];
  return (
    <View
      style={[
        styles.divider,
        vertical ? { width: 1, height: 'auto', marginHorizontal: margin } : { marginVertical: margin },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
