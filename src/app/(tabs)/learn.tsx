import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { EmptyState } from '../../components/empty-state';
import { useAppTheme } from '../../theme';

export default function LearnScreen() {
  const theme = useAppTheme();

  return (
    <ScreenFade>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <EmptyState
          icon={
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
          }
          message="Patterns, sensitivities and suggestions will appear here as you brew."
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
