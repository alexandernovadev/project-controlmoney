import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, FontSizes } from '@/lib/theme';

export type DateInputProps = {
  value: string;
  onChangeValue: (value: string) => void;
  label?: string;
  error?: string;
};

function formatDisplay(isoDate: string): string {
  if (!isoDate) return '';
  // Se añade T12:00:00 para forzar el mediodía y evitar saltos de día por zona horaria
  const d = new Date(isoDate.includes('T') ? isoDate : isoDate + 'T12:00:00');
  return d.toLocaleDateString('default', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DateInput({
  value,
  onChangeValue,
  label,
  error,
}: DateInputProps) {
  const [show, setShow] = useState(false);
  const dateValue = value ? new Date(value.includes('T') ? value : value + 'T12:00:00') : new Date();

  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selectedDate) {
      // Extraemos la fecha local en formato YYYY-MM-DD sin usar toISOString para evitar el desfase
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      onChangeValue(`${year}-${month}-${day}`);
    }
  };

  const handlePress = () => {
    setShow(true);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={handlePress}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? formatDisplay(value) : 'Select date'}
        </Text>
        <MaterialIcons
          name="event"
          size={22}
          color={Colors.textSecondary}
        />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
      {show && Platform.OS === 'ios' && (
        <Pressable style={styles.iosDone} onPress={() => setShow(false)}>
          <Text style={styles.iosDoneText}>Done</Text>
        </Pressable>
      )}
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
  iosDone: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  iosDoneText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.accent,
  },
});
