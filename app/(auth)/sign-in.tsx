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
import { useTheme } from '@/contexts/ThemeContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#6B6EFF' // Match gradient start color
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
      alignItems: 'center'
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      ...theme.shadows.medium
    },
    logoIcon: {
      fontSize: 40
    },
    logo: {
      ...theme.typography.h2,
      color: '#FFFFFF',
      marginBottom: 8,
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4
    },
    subtitle: {
      ...theme.typography.body,
      color: 'rgba(255, 255, 255, 0.9)',
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },
    formCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: theme.spacing.xl,
      paddingBottom: 40,
      ...theme.shadows.large
    },
    formTitle: {
      ...theme.typography.h3,
      color: '#1A1A2E',
      marginBottom: theme.spacing.xs,
      textAlign: 'center'
    },
    formSubtitle: {
      ...theme.typography.bodySmall,
      color: '#6B6E80',
      textAlign: 'center',
      marginBottom: theme.spacing.xl
    },
    form: {
      width: '100%'
    },
    inputGroup: {
      marginBottom: theme.spacing.lg
    },
    passwordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    inputLabel: {
      ...theme.typography.caption,
      color: '#6B6E80',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: theme.spacing.xs
    },
    forgotPasswordText: {
      ...theme.typography.caption,
      color: '#6B6EFF',
      fontWeight: '600'
    },
    input: {
      backgroundColor: '#F5F6FA',
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      fontSize: 16,
      borderWidth: 2,
      borderColor: 'transparent',
      color: '#1A1A2E'
    },
    inputFocused: {
      borderColor: '#6B6EFF',
      backgroundColor: '#FFFFFF',
      ...theme.shadows.small
    },
    button: {
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.md,
      ...theme.shadows.medium
    },
    buttonDisabled: {
      opacity: 0.6
    },
    buttonText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    switchButton: {
      marginTop: theme.spacing.xl,
      alignItems: 'center'
    },
    switchText: {
      ...theme.typography.bodySmall,
      color: '#6B6E80'
    },
    switchTextBold: {
      ...theme.typography.bodySmall,
      color: '#6B6EFF',
      fontWeight: '600'
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={['#6B6EFF', '#9B59B6']}
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
                placeholderTextColor="#A0A3B1"
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
                placeholderTextColor="#A0A3B1"
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
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#6B6EFF', '#9B59B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, loading && styles.buttonDisabled]}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </LinearGradient>
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