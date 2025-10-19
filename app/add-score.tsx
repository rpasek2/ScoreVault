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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { UI_PALETTE, CARD_SHADOW, WOMENS_EVENTS, MENS_EVENTS, EVENT_LABELS } from '@/constants/theme';
import { Gymnast } from '@/types';
import { getGymnasts, addScore } from '@/utils/database';

export default function AddScoreScreen() {
  const { meetId } = useLocalSearchParams<{ meetId: string }>();
  const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
  const [selectedGymnastId, setSelectedGymnastId] = useState('');
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
  const [loadingGymnasts, setLoadingGymnasts] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();

  // Fetch gymnasts
  useEffect(() => {
    const fetchGymnasts = async () => {
      try {
        const gymnastsList = await getGymnasts();
        setGymnasts(gymnastsList);
      } catch (error) {
        console.error('Error fetching gymnasts:', error);
        Alert.alert('Error', 'Failed to load gymnasts');
      } finally {
        setLoadingGymnasts(false);
      }
    };

    fetchGymnasts();
  }, []);

  // Update discipline when gymnast is selected
  useEffect(() => {
    if (selectedGymnastId) {
      const gymnast = gymnasts.find(g => g.id === selectedGymnastId);
      if (gymnast) {
        setSelectedDiscipline(gymnast.discipline || 'Womens');
      }
    }
  }, [selectedGymnastId, gymnasts]);

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
    // Validation
    if (!meetId) {
      Alert.alert('Error', 'No meet selected');
      return;
    }

    if (!selectedGymnastId) {
      Alert.alert('Error', 'Please select a gymnast');
      return;
    }

    // Validate based on discipline
    if (selectedDiscipline === 'Womens') {
      const vaultNum = parseFloat(vault);
      const barsNum = parseFloat(bars);
      const beamNum = parseFloat(beam);
      const floorNum = parseFloat(floor);

      if (isNaN(vaultNum) || isNaN(barsNum) || isNaN(beamNum) || isNaN(floorNum)) {
        Alert.alert('Error', 'Please enter valid scores for all events');
        return;
      }

      if (vaultNum < 0 || vaultNum > 10 || barsNum < 0 || barsNum > 10 ||
          beamNum < 0 || beamNum > 10 || floorNum < 0 || floorNum > 10) {
        Alert.alert('Error', 'Scores must be between 0.000 and 10.000');
        return;
      }
    } else {
      // Mens validation
      const floorNum = parseFloat(floor);
      const pommelHorseNum = parseFloat(pommelHorse);
      const ringsNum = parseFloat(rings);
      const vaultNum = parseFloat(vault);
      const parallelBarsNum = parseFloat(parallelBars);
      const highBarNum = parseFloat(highBar);

      if (isNaN(floorNum) || isNaN(pommelHorseNum) || isNaN(ringsNum) ||
          isNaN(vaultNum) || isNaN(parallelBarsNum) || isNaN(highBarNum)) {
        Alert.alert('Error', 'Please enter valid scores for all events');
        return;
      }

      if (floorNum < 0 || floorNum > 15 || pommelHorseNum < 0 || pommelHorseNum > 15 ||
          ringsNum < 0 || ringsNum > 15 || vaultNum < 0 || vaultNum > 15 ||
          parallelBarsNum < 0 || parallelBarsNum > 15 || highBarNum < 0 || highBarNum > 15) {
        Alert.alert('Error', 'Scores must be between 0.000 and 15.000');
        return;
      }
    }

    setLoading(true);
    try {
      // Find the selected gymnast to get their current level
      const selectedGymnast = gymnasts.find(g => g.id === selectedGymnastId);

      // Build scores object based on discipline
      const scores: any = { allAround: parseFloat(allAround) };
      const placements: any = { allAround: aaPlace ? parseInt(aaPlace) : null };

      if (selectedDiscipline === 'Womens') {
        scores.vault = parseFloat(vault);
        scores.bars = parseFloat(bars);
        scores.beam = parseFloat(beam);
        scores.floor = parseFloat(floor);
        placements.vault = vaultPlace ? parseInt(vaultPlace) : null;
        placements.bars = barsPlace ? parseInt(barsPlace) : null;
        placements.beam = beamPlace ? parseInt(beamPlace) : null;
        placements.floor = floorPlace ? parseInt(floorPlace) : null;
      } else {
        scores.floor = parseFloat(floor);
        scores.pommelHorse = parseFloat(pommelHorse);
        scores.rings = parseFloat(rings);
        scores.vault = parseFloat(vault);
        scores.parallelBars = parseFloat(parallelBars);
        scores.highBar = parseFloat(highBar);
        placements.floor = floorPlace ? parseInt(floorPlace) : null;
        placements.pommelHorse = pommelHorsePlace ? parseInt(pommelHorsePlace) : null;
        placements.rings = ringsPlace ? parseInt(ringsPlace) : null;
        placements.vault = vaultPlace ? parseInt(vaultPlace) : null;
        placements.parallelBars = parallelBarsPlace ? parseInt(parallelBarsPlace) : null;
        placements.highBar = highBarPlace ? parseInt(highBarPlace) : null;
      }

      await addScore({
        meetId,
        gymnastId: selectedGymnastId,
        level: selectedGymnast?.level || undefined,
        scores,
        placements
      });

      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
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
      paddingBottom: 100,
      backgroundColor: theme.colors.background
    },
    section: {
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      ...CARD_SHADOW
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 15
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
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary
    },
    noGymnastsText: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 20
    },
    pickerContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8
    },
    gymnastOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    gymnastOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    gymnastOptionText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '500'
    },
    gymnastOptionTextSelected: {
      color: theme.colors.surface,
      fontWeight: '600'
    },
    allAroundBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    }
  });

  if (loadingGymnasts) {
    return (
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </LinearGradient>
    );
  }

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
        <Text style={styles.title}>Add Score</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Gymnast Selection */}
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.section}>
          <Text style={styles.sectionTitle}>Gymnast</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Select Gymnast <Text style={styles.required}>*</Text>
            </Text>
            {gymnasts.length === 0 ? (
              <Text style={styles.noGymnastsText}>
                No gymnasts found. Please add a gymnast first.
              </Text>
            ) : (
              <View style={styles.pickerContainer}>
                {gymnasts.map((gymnast) => (
                  <TouchableOpacity
                    key={gymnast.id}
                    style={[
                      styles.gymnastOption,
                      selectedGymnastId === gymnast.id && styles.gymnastOptionSelected
                    ]}
                    onPress={() => setSelectedGymnastId(gymnast.id)}>
                    <Text
                      style={[
                        styles.gymnastOptionText,
                        selectedGymnastId === gymnast.id && styles.gymnastOptionTextSelected
                      ]}>
                      {gymnast.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Scores Section */}
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.section}>
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

          <LinearGradient
            colors={theme.colors.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.allAroundBox}>
            <Text style={styles.allAroundLabel}>All-Around</Text>
            <Text style={styles.allAroundValue}>{allAround}</Text>
          </LinearGradient>
        </LinearGradient>

        {/* Placements Section */}
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.section}>
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
              value={aaPlace}
              onChangeText={setAaPlace}
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}