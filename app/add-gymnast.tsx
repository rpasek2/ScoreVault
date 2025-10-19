import React, { useState } from 'react';
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
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { addGymnast } from '@/utils/database';

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

export default function AddGymnastScreen() {
  const [name, setName] = useState('');
  const [usagNumber, setUsagNumber] = useState('');
  const [level, setLevel] = useState('');
  const [discipline, setDiscipline] = useState<'Womens' | 'Mens'>('Womens');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flexGrow: 1,
      padding: 15,
      paddingTop: 0
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
    disabled: {
      opacity: 0.4
    },
    form: {
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
    dateInput: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
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
      gap: 8
    },
    levelOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    levelOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    levelOptionText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '500'
    },
    levelOptionTextSelected: {
      color: theme.colors.surface,
      fontWeight: '600'
    },
    saveButtonContainer: {
      marginTop: 24,
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
      ...CARD_SHADOW
    },
    saveButtonDisabled: {
      opacity: 0.5
    },
    saveButtonGradient: {
      padding: 18,
      alignItems: 'center',
      justifyContent: 'center'
    },
    saveButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5
    }
  });

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a gymnast name');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    if (!level) {
      Alert.alert('Error', 'Please select a level');
      return;
    }

    setLoading(true);
    try {
      await addGymnast({
        name: name.trim(),
        usagNumber: usagNumber.trim() || undefined,
        level: level,
        discipline: discipline,
        dateOfBirth: dateOfBirth ? { toMillis: () => dateOfBirth.getTime() } : undefined
      });

      router.back();
    } catch (error: any) {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.cancelButton, loading && styles.disabled]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Gymnast</Text>
        <View style={{ width: 50 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.form}>
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
              autoFocus
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
              Level <Text style={styles.required}>*</Text>
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
            <Text style={styles.hint}>You can update level later as they progress</Text>
          </View>
        </LinearGradient>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButtonContainer, (!name.trim() || !level || loading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || !level || loading}
          activeOpacity={0.8}>
          <LinearGradient
            colors={(!name.trim() || !level || loading) ? ['#CCCCCC', '#AAAAAA'] : [theme.colors.primary, theme.colors.primaryDark]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Gymnast</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}