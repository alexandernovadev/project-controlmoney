import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, FontSizes } from '@/lib/theme';
import { DateTime } from 'luxon';

export type DateInputProps = {
  value: string;
  onChangeValue: (value: string) => void;
  label?: string;
  error?: string;
  mode?: 'date' | 'datetime';
};

function formatDisplay(value: string, mode: 'date' | 'datetime'): string {
  if (!value) return '';
  if (mode === 'date') {
    const d = new Date(value.includes('T') ? value : value + 'T12:00:00');
    return d.toLocaleDateString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } else {
    const dt = DateTime.fromISO(value);
    return dt.isValid ? dt.toFormat("MMM d, yyyy 'at' h:mm a") : value;
  }
}

// Web: convierte ISO → YYYY-MM-DD o YYYY-MM-DDTHH:MM para el input HTML
function toWebInputValue(iso: string, mode: 'date' | 'datetime'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  if (mode === 'date') return `${y}-${mo}-${da}`;
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${da}T${h}:${mi}`;
}

function fromWebInputValue(val: string, mode: 'date' | 'datetime'): string {
  if (!val) return '';
  if (mode === 'date') return `${val}T00:00:00.000Z`;
  return new Date(val).toISOString();
}

export function DateInput({
  value,
  onChangeValue,
  label,
  error,
  mode = 'date',
}: DateInputProps) {
  const [showPicker, setShowPicker] = useState<'date' | 'time' | 'datetime' | false>(false);

  const dateValue = value
    ? new Date(mode === 'date' && !value.includes('T') ? value + 'T12:00:00' : value)
    : new Date();

  // ── WEB ──────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    const webValue = toWebInputValue(value, mode);
    const inputType = mode === 'datetime' ? 'datetime-local' : 'date';

    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {React.createElement(
          'div',
          { style: error ? { ...webTrigger, borderColor: Colors.error } : webTrigger },
          React.createElement('input', {
            type: inputType,
            value: webValue,
            onChange: (e: any) => onChangeValue(fromWebInputValue(e.target.value, mode)),
            style: webInput,
          }),
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  // ── NATIVE (iOS / Android) ────────────────────────────────────────────────
  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (showPicker === 'date') {
        if (selectedDate) {
          if (mode === 'datetime') {
            const newDate = new Date(dateValue);
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            onChangeValue(newDate.toISOString());
            setShowPicker('time');
          } else {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            onChangeValue(`${year}-${month}-${day}T00:00:00.000Z`);
            setShowPicker(false);
          }
        } else {
          setShowPicker(false);
        }
      } else if (showPicker === 'time') {
        if (selectedDate) {
          const newDate = new Date(dateValue);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds());
          onChangeValue(newDate.toISOString());
        }
        setShowPicker(false);
      }
    } else {
      if (selectedDate) {
        if (mode === 'date') {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          onChangeValue(`${year}-${month}-${day}T00:00:00.000Z`);
        } else {
          onChangeValue(selectedDate.toISOString());
        }
      }
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'android') {
      setShowPicker('date');
    } else {
      setShowPicker(mode === 'datetime' ? 'datetime' : 'date');
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={handlePress}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? formatDisplay(value, mode) : (mode === 'date' ? 'Select date' : 'Select date & time')}
        </Text>
        <MaterialIcons
          name={mode === 'date' ? "event" : "access-time"}
          size={22}
          color={Colors.textSecondary}
        />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateValue}
          mode={showPicker as 'date' | 'time'}
          display="default"
          onChange={handleChange}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <View>
          <DateTimePicker
            value={dateValue}
            mode={showPicker as 'date' | 'datetime'}
            display="spinner"
            onChange={handleChange}
          />
          <Pressable style={styles.iosDone} onPress={() => setShowPicker(false)}>
            <Text style={styles.iosDoneText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Web styles (plain CSS objects, no StyleSheet) ─────────────────────────
const webTrigger: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.inputBackground,
  borderRadius: 14,
  border: `1px solid ${Colors.inputBorder}`,
  minHeight: 52,
  paddingLeft: Spacing.md,
  paddingRight: Spacing.md,
};

const webInput: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: Colors.text,
  fontSize: FontSizes.body,
  colorScheme: 'dark',
  cursor: 'pointer',
  width: '100%',
  padding: 0,
};

// ── Native styles ─────────────────────────────────────────────────────────
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
