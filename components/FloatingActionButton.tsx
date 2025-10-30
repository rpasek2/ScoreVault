import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppTheme } from '@/constants/theme';

interface FABProps {
  onPress: () => void;
  icon?: string;
  color?: string;
}

export default function FloatingActionButton({
  onPress,
  icon = '+',
  color = AppTheme.colors.primary
}: FABProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={handlePress}>
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...AppTheme.shadows.fab
  },
  icon: {
    fontSize: 32,
    color: AppTheme.colors.surface,
    fontWeight: '300',
    lineHeight: 32
  }
});
