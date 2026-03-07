import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Spacing, FontSizes } from '@/lib/theme';
import type { SelectOption } from './select-modal';

const DROPDOWN_MAX_HEIGHT = 240;

export type SelectProps = {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: string | null;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  searchable?: boolean;
};

export function Select({
  label,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  value,
  onValueChange,
  options,
  error,
  searchable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query, searchable]);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setQuery('');
  };

  const handleToggle = () => {
    if (isOpen) {
      setQuery('');
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={handleToggle}
        style={[styles.trigger, error && styles.triggerError, isOpen && styles.triggerOpen]}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {displayText}
        </Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={Colors.textSecondary}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdown}>
          {searchable && (
            <View style={styles.searchWrapper}>
              <MaterialIcons
                name="search"
                size={20}
                color={Colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={Colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
          )}
          <ScrollView
            style={styles.optionsScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled">
            {filteredOptions.length === 0 ? (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>
                  {searchable && query ? 'No results' : 'No options'}
                </Text>
              </View>
            ) : (
              filteredOptions.map((item) => (
                <Pressable
                  key={item.value}
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => handleSelect(item.value)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && (
                    <MaterialIcons name="check" size={20} color={Colors.accent} />
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}

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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  triggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: Colors.border,
  },
  triggerError: {
    borderColor: Colors.error,
  },
  triggerText: {
    fontSize: FontSizes.body,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  dropdown: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.inputBorder,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    margin: Spacing.sm,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  optionsScroll: {
    maxHeight: DROPDOWN_MAX_HEIGHT,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  optionSelected: {
    backgroundColor: Colors.backgroundSecondary,
  },
  optionText: {
    fontSize: FontSizes.body,
    color: Colors.text,
  },
  emptyWrapper: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.bodySm,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: FontSizes.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
