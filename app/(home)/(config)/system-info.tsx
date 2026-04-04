import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/lib/theme';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function SystemInfoScreen() {
  const appName = Constants.expoConfig?.name || 'Control Money App';
  const appVersion = Constants.expoConfig?.version || '1.2.2';
  const sdkVersion = Constants.expoConfig?.sdkVersion || 'Desconocida';
  const expoVersion = Constants.expoVersion || 'No disponible';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sistema',
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Aplicación</ThemedText>
            <View style={styles.card}>
              <InfoRow label="Nombre" value={appName} />
              <InfoRow label="Versión" value={appVersion} />
              <InfoRow label="Entorno" value={__DEV__ ? 'Desarrollo' : 'Producción'} />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Dispositivo y SO</ThemedText>
            <View style={styles.card}>
              <InfoRow label="Sistema Operativo" value={Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS} />
              <InfoRow label="Versión del SO" value={String(Platform.Version)} />
              <InfoRow label="Plataforma" value={Platform.OS === 'ios' && Platform.isPad ? 'Tablet' : Platform.isTV ? 'TV' : 'Móvil / Default'} />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Expo & SDK</ThemedText>
            <View style={styles.card}>
              <InfoRow label="SDK Version" value={sdkVersion} />
              <InfoRow label="Expo Version" value={expoVersion} />
              <InfoRow label="Session ID" value={Constants.sessionId || 'N/A'} />
            </View>
          </View>

        </ScrollView>
      </ThemedView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value} numberOfLines={1} ellipsizeMode="tail">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollContent: {
    padding: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 12,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 15,
    flex: 1,
  },
  value: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
});
