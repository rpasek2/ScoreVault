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
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Score, Gymnast } from '@/types';
import { WOMENS_EVENTS, MENS_EVENTS, EVENT_LABELS } from '@/constants/theme';
import { getScoreById, getGymnastById, updateScore, deleteScore } from '@/utils/database';

export default function EditScoreScreen() {
  const { scoreId } = useLocalSearchParams<{ scoreId: string }>();
  const { theme } = useTheme();
  const [score, setScore] = useState<Score | null>(null);
  const [gymnastName, setGymnastName] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<'Womens' | 'Mens'>('Womens');

  // Womens score inputs
  const [vault, setVault] = useState('');
  const [bars, setBars] = useState('');
  const [beam, setBeam] = useState('');
  const [floor, setFloor] = useState('');

  // Mens score inputs
  const [pommelHorse, setPommelHorse] = useState('');
  const [rings, setRings] = useState('');
  const [parallelBars, setParallelBars] = useState('');
  const [highBar, setHighBar] = useState('');

  const [allAround, setAllAround] = useState('0.000');

  // Womens placement inputs
  const [vaultPlace, setVaultPlace] = useState('');
  const [barsPlace, setBarsPlace] = useState('');
  const [beamPlace, setBeamPlace] = useState('');
  const [floorPlace, setFloorPlace] = useState('');

  // Mens placement inputs
  const [pommelHorsePlace, setPommelHorsePlace] = useState('');
  const [ringsPlace, setRingsPlace] = useState('');
  const [parallelBarsPlace, setParallelBarsPlace] = useState('');
  const [highBarPlace, setHighBarPlace] = useState('');

  const [aaPlace, setAaPlace] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  // Fetch existing score data
  useEffect(() => {
    if (!scoreId) return;

    const fetchScore = async () => {
      try {
        const scoreData = await getScoreById(scoreId);
        if (scoreData) {
          setScore(scoreData);

          // Fetch gymnast to determine discipline
          const gymnastData = await getGymnastById(scoreData.gymnastId);
          if (gymnastData) {
            setGymnastName(gymnastData.name);
            const discipline = gymnastData.discipline || 'Womens';
            setSelectedDiscipline(discipline);

            // Populate form based on discipline
            if (discipline === 'Womens') {
              setVault(scoreData.scores.vault?.toString() || '');
              setBars(scoreData.scores.bars?.toString() || '');
              setBeam(scoreData.scores.beam?.toString() || '');
              setFloor(scoreData.scores.floor?.toString() || '');
              setVaultPlace(scoreData.placements.vault?.toString() || '');
              setBarsPlace(scoreData.placements.bars?.toString() || '');
              setBeamPlace(scoreData.placements.beam?.toString() || '');
              setFloorPlace(scoreData.placements.floor?.toString() || '');
            } else {
              setFloor(scoreData.scores.floor?.toString() || '');
              setPommelHorse(scoreData.scores.pommelHorse?.toString() || '');
              setRings(scoreData.scores.rings?.toString() || '');
              setVault(scoreData.scores.vault?.toString() || '');
              setParallelBars(scoreData.scores.parallelBars?.toString() || '');
              setHighBar(scoreData.scores.highBar?.toString() || '');
              setFloorPlace(scoreData.placements.floor?.toString() || '');
              setPommelHorsePlace(scoreData.placements.pommelHorse?.toString() || '');
              setRingsPlace(scoreData.placements.rings?.toString() || '');
              setVaultPlace(scoreData.placements.vault?.toString() || '');
              setParallelBarsPlace(scoreData.placements.parallelBars?.toString() || '');
              setHighBarPlace(scoreData.placements.highBar?.toString() || '');
            }

            setAllAround(scoreData.scores.allAround.toFixed(3));
            setAaPlace(scoreData.placements.allAround?.toString() || '');
          }
        } else {
          Alert.alert('Error', 'Score not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching score:', error);
        Alert.alert('Error', 'Failed to load score');
      } finally {
        setLoadingData(false);
      }
    };

    fetchScore();
  }, [scoreId]);

  // Calculate all-around in real-time based on discipline
  useEffect(() => {
    let total = 0;
    if (selectedDiscipline === 'Womens') {
      const v = parseFloat(vault) || 0;
      const b = parseFloat(bars) || 0;
      const be = parseFloat(beam) || 0;
      const f = parseFloat(floor) || 0;
      total = v + b + be + f;
    } else {
      const f = parseFloat(floor) || 0;
      const ph = parseFloat(pommelHorse) || 0;
      const r = parseFloat(rings) || 0;
      const v = parseFloat(vault) || 0;
      const pb = parseFloat(parallelBars) || 0;
      const hb = parseFloat(highBar) || 0;
      total = f + ph + r + v + pb + hb;
    }
    setAllAround(total.toFixed(3));
  }, [selectedDiscipline, vault, bars, beam, floor, pommelHorse, rings, parallelBars, highBar]);

  const handleSave = async () => {
    if (!scoreId || !score) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Validate based on discipline - allow partial scores
    if (selectedDiscipline === 'Womens') {
      const vaultNum = vault ? parseFloat(vault) : null;
      const barsNum = bars ? parseFloat(bars) : null;
      const beamNum = beam ? parseFloat(beam) : null;
      const floorNum = floor ? parseFloat(floor) : null;

      // Check if at least one score is entered
      if (vaultNum === null && barsNum === null && beamNum === null && floorNum === null) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please enter at least one score');
        return;
      }

      // Validate only the scores that are filled in
      if ((vaultNum !== null && (vaultNum < 0 || vaultNum > 10)) ||
          (barsNum !== null && (barsNum < 0 || barsNum > 10)) ||
          (beamNum !== null && (beamNum < 0 || beamNum > 10)) ||
          (floorNum !== null && (floorNum < 0 || floorNum > 10))) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Scores must be between 0.000 and 10.000');
        return;
      }
    } else {
      // Mens validation - allow partial scores
      const floorNum = floor ? parseFloat(floor) : null;
      const pommelHorseNum = pommelHorse ? parseFloat(pommelHorse) : null;
      const ringsNum = rings ? parseFloat(rings) : null;
      const vaultNum = vault ? parseFloat(vault) : null;
      const parallelBarsNum = parallelBars ? parseFloat(parallelBars) : null;
      const highBarNum = highBar ? parseFloat(highBar) : null;

      // Check if at least one score is entered
      if (floorNum === null && pommelHorseNum === null && ringsNum === null &&
          vaultNum === null && parallelBarsNum === null && highBarNum === null) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please enter at least one score');
        return;
      }

      // Validate only the scores that are filled in
      if ((floorNum !== null && (floorNum < 0 || floorNum > 15)) ||
          (pommelHorseNum !== null && (pommelHorseNum < 0 || pommelHorseNum > 15)) ||
          (ringsNum !== null && (ringsNum < 0 || ringsNum > 15)) ||
          (vaultNum !== null && (vaultNum < 0 || vaultNum > 15)) ||
          (parallelBarsNum !== null && (parallelBarsNum < 0 || parallelBarsNum > 15)) ||
          (highBarNum !== null && (highBarNum < 0 || highBarNum > 15))) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Scores must be between 0.000 and 15.000');
        return;
      }
    }

    setLoading(true);
    try {
      // Build scores object based on discipline - only include filled scores
      const scores: any = { allAround: parseFloat(allAround) };
      const placements: any = { allAround: aaPlace ? parseInt(aaPlace) : null };

      if (selectedDiscipline === 'Womens') {
        scores.vault = vault ? parseFloat(vault) : undefined;
        scores.bars = bars ? parseFloat(bars) : undefined;
        scores.beam = beam ? parseFloat(beam) : undefined;
        scores.floor = floor ? parseFloat(floor) : undefined;
        placements.vault = vaultPlace ? parseInt(vaultPlace) : null;
        placements.bars = barsPlace ? parseInt(barsPlace) : null;
        placements.beam = beamPlace ? parseInt(beamPlace) : null;
        placements.floor = floorPlace ? parseInt(floorPlace) : null;
      } else {
        scores.floor = floor ? parseFloat(floor) : undefined;
        scores.pommelHorse = pommelHorse ? parseFloat(pommelHorse) : undefined;
        scores.rings = rings ? parseFloat(rings) : undefined;
        scores.vault = vault ? parseFloat(vault) : undefined;
        scores.parallelBars = parallelBars ? parseFloat(parallelBars) : undefined;
        scores.highBar = highBar ? parseFloat(highBar) : undefined;
        placements.floor = floorPlace ? parseInt(floorPlace) : null;
        placements.pommelHorse = pommelHorsePlace ? parseInt(pommelHorsePlace) : null;
        placements.rings = ringsPlace ? parseInt(ringsPlace) : null;
        placements.vault = vaultPlace ? parseInt(vaultPlace) : null;
        placements.parallelBars = parallelBarsPlace ? parseInt(parallelBarsPlace) : null;
        placements.highBar = highBarPlace ? parseInt(highBarPlace) : null;
      }

      await updateScore(scoreId, {
        scores,
        placements
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Score',
      `Are you sure you want to delete this score for ${gymnastName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteScore(scoreId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
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
      padding: 16,
      paddingTop: 60,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
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
      paddingBottom: 100
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 15
    },
    gymnastNameText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.primary,
      textAlign: 'center',
      padding: 10
    },
    inputGroup: {
      marginBottom: 15
    },
    inputGroupHalf: {
      flex: 1,
      marginBottom: 15
    },
    row: {
      flexDirection: 'row',
      gap: 10
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 6
    },
    required: {
      color: theme.colors.error
    },
    input: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary
    },
    allAroundBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 8,
      marginTop: 5
    },
    allAroundLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.surface
    },
    allAroundValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.surface
    },
    deleteButton: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.error,
      marginBottom: 30
    },
    deleteButtonText: {
      fontSize: 16,
      color: theme.colors.error,
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
        <Text style={styles.title}>Edit Score</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#4A90E2" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Gymnast Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gymnast</Text>
          <Text style={styles.gymnastNameText}>{gymnastName}</Text>
        </View>

        {/* Scores Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>

          {selectedDiscipline === 'Womens' ? (
            <>
              {/* Womens Events: Vault, Bars, Beam, Floor */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Vault <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={vault}
                    onChangeText={setVault}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Bars <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={bars}
                    onChangeText={setBars}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Beam <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={beam}
                    onChangeText={setBeam}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Floor <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={floor}
                    onChangeText={setFloor}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Mens Events: Floor, Pommel Horse, Rings, Vault, Parallel Bars, High Bar */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Floor <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={floor}
                    onChangeText={setFloor}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Pommel Horse <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={pommelHorse}
                    onChangeText={setPommelHorse}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Rings <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={rings}
                    onChangeText={setRings}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Vault <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={vault}
                    onChangeText={setVault}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    Parallel Bars <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={parallelBars}
                    onChangeText={setParallelBars}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>
                    High Bar <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    value={highBar}
                    onChangeText={setHighBar}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.allAroundBox}>
            <Text style={styles.allAroundLabel}>All-Around</Text>
            <Text style={styles.allAroundValue}>{allAround}</Text>
          </View>
        </View>

        {/* Placements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Placements (Optional)</Text>

          {selectedDiscipline === 'Womens' ? (
            <>
              {/* Womens Placements: Vault, Bars, Beam, Floor */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Vault Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={vaultPlace}
                    onChangeText={setVaultPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Bars Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={barsPlace}
                    onChangeText={setBarsPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Beam Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={beamPlace}
                    onChangeText={setBeamPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Floor Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={floorPlace}
                    onChangeText={setFloorPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Mens Placements: Floor, Pommel Horse, Rings, Vault, Parallel Bars, High Bar */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Floor Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={floorPlace}
                    onChangeText={setFloorPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Pommel Horse Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={pommelHorsePlace}
                    onChangeText={setPommelHorsePlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Rings Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={ringsPlace}
                    onChangeText={setRingsPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Vault Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={vaultPlace}
                    onChangeText={setVaultPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>Parallel Bars Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={parallelBarsPlace}
                    onChangeText={setParallelBarsPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>High Bar Place</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.colors.textTertiary}
                    value={highBarPlace}
                    onChangeText={setHighBarPlace}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>All-Around Place</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor={theme.colors.textTertiary}
              value={aaPlace}
              onChangeText={setAaPlace}
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={loading}
          activeOpacity={0.7}>
          <Text style={styles.deleteButtonText}>Delete Score</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
