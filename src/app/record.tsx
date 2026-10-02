import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenFade } from '../components/screen-fade';
import { KeyboardAwareScrollView } from '../components/keyboard-aware-scroll-view';
import { useAppTheme } from '../theme';

export default function RecordScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <ScreenFade>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Text variant="bodyMedium">
          Voice recording arrives in a later milestone. For now, everything can be
          logged by hand and works fully offline.
        </Text>
        <Button mode="contained" style={styles.button} onPress={() => router.back()}>
          Close
        </Button>
      </KeyboardAwareScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  button: {
    marginTop: 24,
    alignSelf: 'flex-start',
  },
});
