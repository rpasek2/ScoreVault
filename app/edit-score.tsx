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
import { Score, Gymnast } from '@/types';
import { WOMENS_EVENTS, MENS_EVENTS, EVENT_LABELS } from '@/constants/theme';
import { getScoreById, getGymnastById, updateScore, deleteScore } from '@/utils/database';

export default function EditScoreScreen() {
  const { scoreId } = useLocalSearchParams<{ scoreId: string }>();
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

    // Validate based on discipline
    if (selectedDiscipline === 'Womens') {
      const vaultNum = parseFloat(vault);
      const barsNum = parseFloat(bars);
      const beamNum = parseFloat(beam);
      const floorNum = parseFloat(floor);

      if (isNaN(vaultNum) || isNaN(barsNum) || isNaN(beamNum) || isNaN(floorNum)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please enter valid scores for all events');
        return;
      }

      if (vaultNum < 0 || vaultNum > 10 || barsNum < 0 || barsNum > 10 ||
          beamNum < 0 || beamNum > 10 || floorNum < 0 || floorNum > 10) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please enter valid scores for all events');
        return;
      }

      if (floorNum < 0 || floorNum > 15 || pommelHorseNum < 0 || pommelHorseNum > 15 ||
          ringsNum < 0 || ringsNum > 15 || vaultNum < 0 || vaultNum > 15 ||
          parallelBarsNum < 0 || parallelBarsNum > 15 || highBarNum < 0 || highBarNum > 15) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Scores must be between 0.000 and 15.000');
        return;
      }
    }

    setLoading(true);
    try {
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

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  cancelButton: {
    fontSize: 16,
    color: '#666'
  },
  saveButton: {
    fontSize: 16,
    color: '#4A90E2',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15
  },
  gymnastNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
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
    color: '#333',
    marginBottom: 6
  },
  required: {
    color: '#FF3B30'
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  allAroundBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    marginTop: 5
  },
  allAroundLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  allAroundValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  deleteButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
    marginBottom: 30
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600'
  }
});
