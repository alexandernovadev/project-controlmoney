import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useAuth } from '@/context/auth';
import { auth } from '@/lib/firebase';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, FontSizes } from '@/lib/theme';
import { Button, Card } from '@/components/ui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Avatar Placeholder */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={60} color={Colors.icon} />
          </View>
          <ThemedText style={styles.name}>{user?.displayName || 'Usuario'}</ThemedText>
          <ThemedText style={styles.email}>{user?.email || 'Correo no disponible'}</ThemedText>
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color={Colors.textSecondary} />
            <ThemedText style={styles.infoText}>{user?.email}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialIcons name="fingerprint" size={20} color={Colors.textSecondary} />
            <ThemedText style={styles.infoText}>ID: {user?.uid.substring(0, 10)}...</ThemedText>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="Cerrar Sesión"
          variant="danger"
          fullWidth
          onPress={handleSignOut}
          style={styles.logoutBtn}
        />
        
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    fontSize: FontSizes.h2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  infoCard: {
    padding: Spacing.xs,
    marginBottom: Spacing['2xl'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  infoText: {
    fontSize: FontSizes.body,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  logoutBtn: {
    marginTop: 'auto',
  },
});
