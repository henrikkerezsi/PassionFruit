import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { EmptyState } from '../../components/empty-state';
import { useAppTheme } from '../../theme';

export default function BrewScreen() {
  const theme = useAppTheme();

  return (
    <ScreenFade>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <EmptyState
          icon={
            <MaterialCommunityIcons
              name="coffee-maker-outline"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
          }
          message="No brews yet. Tap the microphone to record one by voice, or log one by hand."
        />
      </KeyboardAwareScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
