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
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  // Fetch gymnasts
  useEffect(() => {
    const fetchGymnasts = async () => {
      try {
        const gymnastsList = await getGymnasts();
        setGymnasts(gymnastsList);
      } catch (error) {
        console.error('Error fetching gymnasts:', error);
        Alert.alert(t('common.error'), t('gymnasts.failedToLoadGymnasts'));
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
      Alert.alert(t('common.error'), t('scores.noMeetSelected'));
      return;
    }

    if (!selectedGymnastId) {
      Alert.alert(t('common.error'), t('scores.selectGymnast'));
      return;
    }

    // Validate based on discipline - allow partial scores
    if (selectedDiscipline === 'Womens') {
      const vaultNum = vault ? parseFloat(vault) : null;
      const barsNum = bars ? parseFloat(bars) : null;
      const beamNum = beam ? parseFloat(beam) : null;
      const floorNum = floor ? parseFloat(floor) : null;

      // Check if at least one score is entered
      if (vaultNum === null && barsNum === null && beamNum === null && floorNum === null) {
        Alert.alert(t('common.error'), t('scores.enterAtLeastOneScore'));
        return;
      }

      // Validate only the scores that are filled in
      if ((vaultNum !== null && (vaultNum < 0 || vaultNum > 10)) ||
          (barsNum !== null && (barsNum < 0 || barsNum > 10)) ||
          (beamNum !== null && (beamNum < 0 || beamNum > 10)) ||
          (floorNum !== null && (floorNum < 0 || floorNum > 10))) {
        Alert.alert(t('common.error'), t('scores.womensScoreRange'));
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
        Alert.alert(t('common.error'), t('scores.enterAtLeastOneScore'));
        return;
      }

      // Validate only the scores that are filled in
      if ((floorNum !== null && (floorNum < 0 || floorNum > 15)) ||
          (pommelHorseNum !== null && (pommelHorseNum < 0 || pommelHorseNum > 15)) ||
          (ringsNum !== null && (ringsNum < 0 || ringsNum > 15)) ||
          (vaultNum !== null && (vaultNum < 0 || vaultNum > 15)) ||
          (parallelBarsNum !== null && (parallelBarsNum < 0 || parallelBarsNum > 15)) ||
          (highBarNum !== null && (highBarNum < 0 || highBarNum > 15))) {
        Alert.alert(t('common.error'), t('scores.mensScoreRange'));
        return;
      }
    }

    setLoading(true);
    try {
      // Find the selected gymnast to get their current level
      const selectedGymnast = gymnasts.find(g => g.id === selectedGymnastId);

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

      await addScore({
        meetId,
        gymnastId: selectedGymnastId,
        level: selectedGymnast?.level || undefined,
        scores,
        placements
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
    dropdownButton: {
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    dropdownButtonText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      flex: 1
    },
    dropdownButtonPlaceholder: {
      color: theme.colors.textTertiary
    },
    dropdownIcon: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginLeft: 8
    },
    dropdownList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 4,
      maxHeight: 200
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight
    },
    dropdownItemLast: {
      borderBottomWidth: 0
    },
    dropdownItemSelected: {
      backgroundColor: theme.colors.primary + '15'
    },
    dropdownItemName: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      flex: 1
    },
    dropdownItemLevel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6
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
          <Text style={[styles.cancelButton, loading && styles.disabled]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('scores.addScore')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveButton}>{t('common.save')}</Text>
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
          <Text style={styles.sectionTitle}>{t('scores.gymnast')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('scores.selectGymnast')} <Text style={styles.required}>*</Text>
            </Text>
            {gymnasts.length === 0 ? (
              <Text style={styles.noGymnastsText}>
                {t('scores.noGymnastsFound')}
              </Text>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.dropdownButtonText,
                      !selectedGymnastId && styles.dropdownButtonPlaceholder
                    ]}>
                    {selectedGymnastId
                      ? gymnasts.find(g => g.id === selectedGymnastId)?.name
                      : t('scores.selectAGymnast')}
                  </Text>
                  <Text style={styles.dropdownIcon}>{dropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {dropdownOpen && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {gymnasts.map((gymnast, index) => (
                      <TouchableOpacity
                        key={gymnast.id}
                        style={[
                          styles.dropdownItem,
                          index === gymnasts.length - 1 && styles.dropdownItemLast,
                          selectedGymnastId === gymnast.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedGymnastId(gymnast.id);
                          setDropdownOpen(false);
                        }}
                        activeOpacity={0.7}>
                        <Text style={styles.dropdownItemName}>{gymnast.name}</Text>
                        <Text style={styles.dropdownItemLevel}>{gymnast.level}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Scores Section */}
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.section}>
          <Text style={styles.sectionTitle}>{t('scores.scores')}</Text>

          {selectedDiscipline === 'Womens' ? (
            <>
              {/* Womens Events: Vault, Bars, Beam, Floor */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.vault')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={vault}
                    onChangeText={setVault}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.bars')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={bars}
                    onChangeText={setBars}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.beam')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={beam}
                    onChangeText={setBeam}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.floor')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
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
                  <Text style={styles.label}>{t('scores.floor')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={floor}
                    onChangeText={setFloor}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.pommelHorse')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={pommelHorse}
                    onChangeText={setPommelHorse}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.rings')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={rings}
                    onChangeText={setRings}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.vault')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={vault}
                    onChangeText={setVault}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.parallelBars')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={parallelBars}
                    onChangeText={setParallelBars}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.highBar')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.000"
                    placeholderTextColor={theme.colors.textTertiary}
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
            <Text style={styles.allAroundLabel}>{t('scores.allAround')}</Text>
            <Text style={styles.allAroundValue}>{allAround}</Text>
          </LinearGradient>
        </LinearGradient>

        {/* Placements Section */}
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.section}>
          <Text style={styles.sectionTitle}>{t('scores.placements')}</Text>

          {selectedDiscipline === 'Womens' ? (
            <>
              {/* Womens Placements: Vault, Bars, Beam, Floor */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.label}>{t('scores.vaultPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.barsPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.beamPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.floorPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.floorPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.pommelHorsePlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.ringsPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.vaultPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.parallelBarsPlace')}</Text>
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
                  <Text style={styles.label}>{t('scores.highBarPlace')}</Text>
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
            <Text style={styles.label}>{t('scores.allAroundPlace')}</Text>
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
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}