import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '@/lib/firebase';
import { Colors, FontSizes, FontWeights, Spacing } from '@/lib/theme';
import { Button, Input } from '@/components/ui';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

// Configure Google Sign-in using webClientId from google-services.json
GoogleSignin.configure({
  webClientId: '441923672949-01lt4oa6399n6bes5l2cjhjkimjefjhb.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.replace('/(home)');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (response.data && response.data.idToken) {
          const googleCredential = GoogleAuthProvider.credential(response.data.idToken);
          await signInWithCredential(auth, googleCredential);
        } else {
          throw new Error('No se pudo obtener el idToken de Google.');
        }
      }
      router.replace('/(home)');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error con Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>💰</Text>
          </View>
          <Text style={styles.title}>{isLogin ? '¡Bienvenido de vuelta!' : 'Crea tu cuenta'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Inicia sesión para continuar' : 'Comienza a tomar el control de tu dinero'}
          </Text>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputsContainer}>
          <Input
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.accent} style={{ marginVertical: Spacing.lg }} />
        ) : (
          <View style={styles.buttonContainer}>
            <Button 
              title={isLogin ? 'Ingresar' : 'Registrarse'} 
              onPress={handleAuth} 
              variant="primary"
              fullWidth
            />
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continuar con</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} 
                style={styles.googleIcon} 
              />
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchTextNormal}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <Text style={styles.switchTextBold}>
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  formContainer: {
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    marginVertical: Spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.bodySm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: Spacing.md,
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
  },
  switchButton: {
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  switchTextNormal: {
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
  },
  switchTextBold: {
    color: Colors.brandText,
    fontWeight: FontWeights.bold,
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
    backgroundColor: Colors.errorMuted,
    padding: Spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
