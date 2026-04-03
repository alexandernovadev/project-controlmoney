import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontSizes, Spacing } from '@/lib/theme';

export type ActionItem = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
};

export type ActionModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: ActionItem[];
  onClose: () => void;
};

export function ActionModal({
  visible,
  title,
  subtitle,
  actions,
  onClose,
}: ActionModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}
          onPress={() => {}}
        >
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>

          {/* Actions */}
          <View style={styles.actionsWrap}>
            {actions.map((action, i) => (
              <Pressable
                key={i}
                onPress={() => { onClose(); action.onPress(); }}
                style={({ pressed }) => [
                  styles.actionRow,
                  i < actions.length - 1 && styles.actionBorder,
                  pressed && styles.actionPressed,
                ]}
              >
                <View style={[styles.actionIcon, action.destructive && styles.actionIconDestructive]}>
                  <MaterialIcons
                    name={action.icon}
                    size={20}
                    color={action.destructive ? Colors.error : Colors.text}
                  />
                </View>
                <Text style={[styles.actionLabel, action.destructive && styles.actionLabelDestructive]}>
                  {action.label}
                </Text>
                {!action.destructive && (
                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                )}
              </Pressable>
            ))}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.actionPressed]}
          >
            <Text style={styles.cancelLabel}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.h3,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsWrap: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconDestructive: {
    backgroundColor: Colors.errorMuted,
  },
  actionLabel: {
    flex: 1,
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.text,
  },
  actionLabelDestructive: {
    color: Colors.error,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelLabel: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
