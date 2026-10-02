import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../theme';

interface MicFabProps {
  bottomOffset?: number;
}

export function MicFab({ bottomOffset = 0 }: MicFabProps) {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: theme.spacing[6] + bottomOffset }]}
    >
      <FAB
        icon="microphone"
        color={theme.colors.onPrimary}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/record')}
        accessibilityRole="button"
        accessibilityLabel="Start voice recording"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
  },
  fab: {
    borderRadius: 28,
  },
});
