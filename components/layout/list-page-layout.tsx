import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Input } from '@/components/ui/input';
import { FAB } from '@/components/ui/fab';
import { Colors, Spacing } from '@/lib/theme';

export type ListPageLayoutProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onFilterPress?: () => void;
  onAddPress: () => void;
  children: React.ReactNode;
};

export function ListPageLayout({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onFilterPress,
  onAddPress,
  children,
}: ListPageLayoutProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <Input
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            leftIcon={
              <MaterialIcons name="search" size={20} color={Colors.textMuted} />
            }
            containerStyle={styles.searchInput}
          />
        </View>
        {onFilterPress ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onFilterPress();
            }}
            style={({ pressed }) => [
              styles.filterButton,
              pressed && styles.filterPressed,
            ]}
          >
            <MaterialIcons
              name="filter-list"
              size={24}
              color={Colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.list}>{children}</View>
      <FAB onPress={onAddPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  searchWrapper: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPressed: {
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
});
