import { FAB } from "@/components/ui/fab";
import { Input } from "@/components/ui/input";
import { Colors, Spacing } from "@/lib/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type ListPageLayoutProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onFilterPress?: () => void;
  onAddPress: () => void;
  onTransferPress?: () => void;
  children: React.ReactNode;
};

export function ListPageLayout({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  onFilterPress,
  onAddPress,
  onTransferPress,
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
            rightIcon={
              searchValue.length > 0 ? (
                <Pressable onPress={() => onSearchChange("")}>
                  <MaterialIcons
                    name="cancel"
                    size={18}
                    color={Colors.textMuted}
                  />
                </Pressable>
              ) : null
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
      {onTransferPress ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onTransferPress();
          }}
          style={({ pressed }) => [
            styles.transferFab,
            pressed && styles.filterPressed,
          ]}
        >
          <MaterialIcons name="swap-horiz" size={26} color="#fff" />
        </Pressable>
      ) : null}
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
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
    alignItems: "center",
    justifyContent: "center",
  },
  filterPressed: {
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  transferFab: {
    position: "absolute",
    bottom: Spacing.xl + 56 + 12,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#AF52DE",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
