import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const { signInWithGoogle, isSigningIn } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Control Money
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Inicia sesión para gestionar tus finanzas
        </ThemedText>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.background }]}
          onPress={() => signInWithGoogle()}
          disabled={isSigningIn}
        >
          <Image
            source={{
              uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
            }}
            style={styles.googleIcon}
          />
          <ThemedText style={[styles.googleButtonText, { color: colors.text }]}>
            {isSigningIn ? 'Iniciando sesión...' : 'Continuar con Google'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 48,
    textAlign: 'center',
    opacity: 0.8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dadce0',
    gap: 12,
    minWidth: 240,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
