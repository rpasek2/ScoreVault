import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Send password reset email to ${email}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send',
          onPress: async () => {
            setLoading(true);
            try {
              const auth = getAuth();
              await sendPasswordResetEmail(auth, email);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                'Email Sent',
                `A password reset link has been sent to ${email}. Please check your inbox and spam folder.`
              );
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              let errorMessage = 'Failed to send reset email';

              if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address';
              } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
              } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later';
              }

              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#4A90E2', '#5856D6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>

        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>⭐</Text>
            </View>
            <Text style={styles.logo}>ScoreVault</Text>
            <Text style={styles.subtitle}>Track Every Perfect 10</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.formSubtitle}>
            {isSignUp ? 'Sign up to start tracking scores' : 'Sign in to your account'}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused
                ]}
                placeholder="your@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.inputLabel}>Password</Text>
                {!isSignUp && (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={loading}
                    activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>Forgot?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsSignUp(!isSignUp);
              }}
              disabled={loading}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchTextBold}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40
  },
  logoContainer: {
    alignItems: 'center' as const
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  logoIcon: {
    fontSize: 40
  },
  logo: {
    fontSize: 34,
    fontWeight: '800' as const,
    lineHeight: 41,
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: '#1C1C1E',
    marginBottom: 4,
    textAlign: 'center' as const
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'center' as const,
    marginBottom: 24
  },
  form: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: 20
  },
  passwordHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    color: '#666666',
    textTransform: 'uppercase' as const
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    color: '#4A90E2'
  },
  input: {
    backgroundColor: '#F5F6F7',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    color: '#1C1C1E'
  },
  inputFocused: {
    borderColor: '#4A90E2',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 21,
    color: '#FFFFFF'
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center' as const
  },
  switchText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: '#666666'
  },
  switchTextBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: '#4A90E2'
  }
});
