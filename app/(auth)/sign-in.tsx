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
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();

  const handleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
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
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!email) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }

    Alert.alert(
      t('auth.resetPassword'),
      `${t('auth.resetPassword')} ${email}?`,
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setLoading(true);
            try {
              const auth = getAuth();
              await sendPasswordResetEmail(auth, email);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                t('common.success'),
                t('auth.resetPasswordSuccess')
              );
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('common.error'), t('auth.resetPasswordError'));
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
      backgroundColor: '#8B8EFF' // Match gradient start color
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
    logoImage: {
      width: 320,
      height: 140,
      marginBottom: 24
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
        colors={['#8B8EFF', '#BB7DD6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>

        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo-with-text.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Track Every Perfect 10</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}</Text>
          <Text style={styles.formSubtitle}>
            {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.email')}</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused
                ]}
                placeholder={t('auth.enterEmail')}
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
                <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                {!isSignUp && (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={loading}
                    activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused
                ]}
                placeholder={t('auth.enterPassword')}
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
                colors={['#7B7EFF', '#AB6DC6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, loading && styles.buttonDisabled]}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isSignUp ? t('auth.signUp') : t('auth.signIn')}
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
                {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
                {' '}
                <Text style={styles.switchTextBold}>
                  {isSignUp ? t('auth.signIn') : t('auth.signUp')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}