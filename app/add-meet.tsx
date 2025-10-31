import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { calculateSeason, formatDate } from '@/utils/seasonUtils';
import { addMeet } from '@/utils/database';

export default function AddMeetScreen() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  // Calculate season from date
  useEffect(() => {
    const calculatedSeason = calculateSeason(date);
    setSeason(calculatedSeason);
  }, [date]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('meets.enterMeetName'));
      return;
    }

    setLoading(true);
    try {
      await addMeet({
        name: name.trim(),
        date: { toMillis: () => date.getTime() },
        season,
        location: location.trim() || undefined
      });

      router.back();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 60
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary
    },
    cancelButton: {
      fontSize: 16,
      color: theme.colors.textSecondary
    },
    saveButton: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    disabled: {
      opacity: 0.4
    },
    content: {
      padding: 15,
      paddingTop: 0
    },
    formCard: {
      padding: 20,
      borderRadius: 12,
      marginTop: 15,
      ...CARD_SHADOW
    },
    inputGroup: {
      marginBottom: 24
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8
    },
    required: {
      color: theme.colors.error
    },
    input: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary
    },
    hint: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 6
    },
    dateButton: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center'
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.textPrimary
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.cancelButton, loading && styles.disabled]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('meets.addMeet')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={[styles.saveButton, !name.trim() && styles.disabled]}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('meets.meetName')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('meets.meetNamePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            value={name}
            onChangeText={setName}
            editable={!loading}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('meets.date')} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}>
            <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <Text style={styles.hint}>{t('meets.season')}: {season}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('meets.location')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('meets.locationPlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            value={location}
            onChangeText={setLocation}
            editable={!loading}
          />
        </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}