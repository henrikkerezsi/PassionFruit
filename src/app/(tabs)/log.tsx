import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { EmptyState } from '../../components/empty-state';
import { useAppTheme } from '../../theme';

export default function LogScreen() {
  const theme = useAppTheme();

  return (
    <ScreenFade>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <EmptyState
          icon={
            <MaterialCommunityIcons
              name="notebook-outline"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
          }
          message="Your brew history will appear here, newest first."
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
