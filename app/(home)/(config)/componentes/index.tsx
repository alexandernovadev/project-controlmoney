import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '@/lib/firebase';
import { Colors, Spacing } from '@/lib/theme';
import {
  Button,
  Card,
  Input,
  AmountInput,
  Select,
  SelectModal,
  Badge,
  ListItem,
  Divider,
} from '@/components/ui';
import { ThemedText } from '@/components/themed-text';

const CATEGORY_OPTIONS = [
  { label: 'Alimentación', value: 'food' },
  { label: 'Transporte', value: 'transport' },
  { label: 'Servicios', value: 'services' },
  { label: 'Otros', value: 'other' },
];

const SEARCHABLE_OPTIONS = [
  { label: 'Alimentación', value: 'food' },
  { label: 'Transporte', value: 'transport' },
  { label: 'Servicios', value: 'services' },
  { label: 'Supermercado', value: 'supermarket' },
  { label: 'Restaurantes', value: 'restaurants' },
  { label: 'Gasolina', value: 'gas' },
  { label: 'Entretenimiento', value: 'entertainment' },
  { label: 'Salud', value: 'health' },
  { label: 'Otros', value: 'other' },
];

export default function ComponentesScreen() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectSearchableValue, setSelectSearchableValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
      <ThemedText type="title" style={styles.pageTitle}>
        UI Components
      </ThemedText>

      {/* Buttons */}
      <Card>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Button
        </ThemedText>
        <View style={styles.row}>
          <Button title="Primary" variant="primary" onPress={() => {}} />
          <Button title="Secondary" variant="secondary" onPress={() => {}} />
        </View>
        <View style={styles.row}>
          <Button title="Danger" variant="danger" onPress={() => {}} />
          <Button title="Outline" variant="outline" onPress={() => {}} />
        </View>
        <View style={styles.row}>
          <Button
            title={loading ? 'Loading...' : 'Loading demo'}
            variant="primary"
            loading={loading}
            onPress={handleLoadingDemo}
          />
        </View>
        <Button title="Full width" variant="primary" fullWidth onPress={() => {}} />
      </Card>

      {/* Input */}
      <Card>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Input
        </ThemedText>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={inputValue}
          onChangeText={setInputValue}
        />
        <Input
          label="With error"
          placeholder="Invalid input"
          error="This field is required"
        />
      </Card>

      {/* AmountInput */}
      <Card>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          AmountInput
        </ThemedText>
        <AmountInput
          label="Amount"
          value={amountValue}
          onChangeValue={setAmountValue}
          currencySymbol="$"
          placeholder="0.00"
        />
      </Card>

      {/* Select / SelectModal */}
      <Card>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Select
        </ThemedText>
        <SelectModal
          label="SelectModal (simple)"
          placeholder="Choose category"
          value={selectValue}
          onValueChange={setSelectValue}
          options={CATEGORY_OPTIONS}
        />
        <Select
          label="Select (with search)"
          placeholder="Choose category"
          searchPlaceholder="Search category..."
          value={selectSearchableValue}
          onValueChange={setSelectSearchableValue}
          options={SEARCHABLE_OPTIONS}
          searchable
        />
      </Card>

      {/* Badge */}
      <Card>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Badge
        </ThemedText>
        <View style={styles.badgeRow}>
          <Badge label="Income" variant="income" />
          <Badge label="Expense" variant="expense" />
          <Badge label="Neutral" variant="neutral" />
          <Badge label="Warning" variant="warning" />
        </View>
        <View style={styles.badgeRow}>
          <Badge label="Small" variant="income" size="sm" />
          <Badge label="Medium" variant="expense" size="md" />
        </View>
      </Card>

      {/* ListItem */}
      <Card>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ListItem
        </ThemedText>
        <ListItem
          title="Supermercado"
          subtitle="Grocery store"
          amount="-$45.50"
          amountType="expense"
          leftIcon={<MaterialIcons name="shopping-cart" size={24} color={Colors.icon} />}
          onPress={() => {}}
        />
        <Divider spacing="xs" />
        <ListItem
          title="Salary"
          subtitle="Monthly income"
          amount="+$2,500"
          amountType="income"
          leftIcon={<MaterialIcons name="payments" size={24} color={Colors.icon} />}
          onPress={() => {}}
        />
        <Divider spacing="xs" />
        <ListItem
          title="Coffee"
          amount="-$4.00"
          amountType="expense"
          leftIcon={<MaterialIcons name="coffee" size={24} color={Colors.icon} />}
        />
      </Card>

      {/* Logout - now moved to Profile screen, keeping here only for dev testing */}
      {__DEV__ && (
        <Button
          title="Cerrar Sesión (Dev)"
          variant="danger"
          fullWidth
          onPress={() => auth.signOut()}
          style={styles.logoutBtn}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  pageTitle: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  logoutBtn: {
    marginTop: Spacing.xl,
  },
});
