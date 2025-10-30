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
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Gymnast } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { getGymnastById, updateGymnast } from '@/utils/database';

const LEVEL_OPTIONS = [
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Level 7',
  'Level 8',
  'Level 9',
  'Level 10',
  'Xcel Bronze',
  'Xcel Silver',
  'Xcel Gold',
  'Xcel Platinum',
  'Xcel Diamond',
  'Xcel Sapphire',
  'Elite'
];

export default function EditGymnastScreen() {
  const { gymnastId } = useLocalSearchParams<{ gymnastId: string }>();
  const { theme } = useTheme();
  const [gymnast, setGymnast] = useState<Gymnast | null>(null);
  const [name, setName] = useState('');
  const [usagNumber, setUsagNumber] = useState('');
  const [level, setLevel] = useState('');
  const [discipline, setDiscipline] = useState<'Womens' | 'Mens'>('Womens');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!gymnastId) return;

    const fetchGymnast = async () => {
      try {
        const gymnastData = await getGymnastById(gymnastId);
        if (gymnastData) {
          setGymnast(gymnastData);
          setName(gymnastData.name);
          setUsagNumber(gymnastData.usagNumber || '');
          setLevel(gymnastData.level || '');
          setDiscipline(gymnastData.discipline || 'Womens');
          setDateOfBirth(gymnastData.dateOfBirth?.toDate?.() || null);
        } else {
          Alert.alert('Error', 'Gymnast not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching gymnast:', error);
        Alert.alert('Error', 'Failed to load gymnast');
      } finally {
        setLoadingData(false);
      }
    };

    fetchGymnast();
  }, [gymnastId]);

  const handleSave = async () => {
    if (!gymnastId || !gymnast) return;

    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a gymnast name');
      return;
    }

    if (name.trim().length < 2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    if (!level) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please select a level');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await updateGymnast(gymnastId, {
        name: name.trim(),
        usagNumber: usagNumber.trim() || undefined,
        level: level,
        discipline: discipline,
        dateOfBirth: dateOfBirth ? { toMillis: () => dateOfBirth.getTime() } : undefined
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.base,
      paddingTop: 60,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    cancelButton: {
      ...theme.typography.body,
      color: theme.colors.textSecondary
    },
    saveButton: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    disabled: {
      opacity: 0.4
    },
    content: {
      padding: theme.spacing.base,
      paddingBottom: 100
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.medium
    },
    sectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.base,
      fontWeight: '600'
    },
    inputGroup: {
      marginBottom: theme.spacing.base
    },
    label: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      fontWeight: '600'
    },
    required: {
      color: theme.colors.error
    },
    input: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary
    },
    hint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
      lineHeight: 16
    },
    dateInput: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.textPrimary
    },
    datePlaceholder: {
      fontSize: 16,
      color: theme.colors.textTertiary
    },
    levelGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm
    },
    levelOption: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    levelOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    levelOptionText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary
    },
    levelOptionTextSelected: {
      color: theme.colors.surface,
      fontWeight: '600'
    }
  });

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.cancelButton, loading && styles.disabled]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Gymnast</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gymnast Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Gymnast Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth (Optional)</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}>
              <Text style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
                {dateOfBirth ? formatDate(dateOfBirth) : 'Select date of birth'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>USAG Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter USAG number"
              value={usagNumber}
              onChangeText={setUsagNumber}
              editable={!loading}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Discipline <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.levelGrid}>
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  discipline === 'Womens' && styles.levelOptionSelected
                ]}
                onPress={() => setDiscipline('Womens')}
                disabled={loading}>
                <Text
                  style={[
                    styles.levelOptionText,
                    discipline === 'Womens' && styles.levelOptionTextSelected
                  ]}>
                  Womens
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  discipline === 'Mens' && styles.levelOptionSelected
                ]}
                onPress={() => setDiscipline('Mens')}
                disabled={loading}>
                <Text
                  style={[
                    styles.levelOptionText,
                    discipline === 'Mens' && styles.levelOptionTextSelected
                  ]}>
                  Mens
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Current Level <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.levelGrid}>
              {LEVEL_OPTIONS.map((levelOption) => (
                <TouchableOpacity
                  key={levelOption}
                  style={[
                    styles.levelOption,
                    level === levelOption && styles.levelOptionSelected
                  ]}
                  onPress={() => setLevel(levelOption)}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.levelOptionText,
                      level === levelOption && styles.levelOptionTextSelected
                    ]}>
                    {levelOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>
              Updating the level here won't affect past scores. New scores will be tagged with the current level.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
