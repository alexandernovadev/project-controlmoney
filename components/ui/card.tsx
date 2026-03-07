import React, { type ReactNode } from 'react';
import { View, StyleSheet, Pressable, type ViewProps, type ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/lib/theme';

export type CardProps = ViewProps & {
  children: ReactNode;
  onPress?: () => void;
  padding?: keyof typeof Spacing;
  elevated?: boolean;
};

export function Card({ children, onPress, padding = 'md', elevated, style, ...props }: CardProps) {
  const content = (
    <View style={[styles.content, { padding: Spacing[padding] }]}>{children}</View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          elevated && styles.elevated,
          pressed && styles.pressed,
          style as ViewStyle,
        ]}
        {...props}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, elevated && styles.elevated, style as ViewStyle]} {...props}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  elevated: {
    borderColor: Colors.backgroundElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    opacity: 0.95,
  },
  content: {},
});
