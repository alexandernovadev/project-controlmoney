import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Spacing, FontSizes } from '@/lib/theme';

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  label?: string;
  placeholder?: string;
  value: string | null;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
};

export function Select({
  label,
  placeholder = 'Select...',
  value,
  onValueChange,
  options,
  error,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[styles.trigger, error && styles.triggerError]}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {displayText}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.textSecondary} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => handleSelect(item.value)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && (
                    <MaterialIcons name="check" size={20} color={Colors.accent} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  errorText: {
    fontSize: FontSizes.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: Spacing.xl,
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
});
