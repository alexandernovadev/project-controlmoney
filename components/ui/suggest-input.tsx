import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/lib/theme';
import { Input, type InputProps } from './input';

type SuggestInputProps = InputProps & {
  suggestions: string[];
  onSelectSuggestion: (value: string) => void;
};

export function SuggestInput({ suggestions, onSelectSuggestion, ...inputProps }: SuggestInputProps) {
  const showSuggestions = suggestions.length > 0 && !!inputProps.value;

  return (
    <View>
      <Input {...inputProps} />
      {showSuggestions && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.row}
          contentContainerStyle={styles.rowContent}
          keyboardShouldPersistTaps="always"
        >
          {suggestions.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              onPress={() => onSelectSuggestion(item)}
            >
              <Text style={styles.chipText} numberOfLines={1}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  rowContent: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  chipPressed: {
    backgroundColor: 'rgba(10, 132, 255, 0.25)',
  },
  chipText: {
    color: Colors.accent,
    fontSize: FontSizes.bodySm,
    fontWeight: '500',
  },
});
