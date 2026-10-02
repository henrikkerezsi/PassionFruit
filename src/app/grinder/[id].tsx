import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, List, Text } from 'react-native-paper';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { useAppData } from '../../data/DataProvider';
import { useAppTheme } from '../../theme';

export default function GrinderDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { brewers, grindSettings, removeGrindSetting } = useAppData();

  const setting = grindSettings.find((candidate) => candidate.id === Number(id));

  if (!setting) {
    return (
      <>
        <Stack.Screen options={{ title: 'Grind setting' }} />
        <ScreenFade>
          <View style={[styles.center, { padding: theme.spacing[6] }]}>
            <Text variant="bodyLarge">That grind setting does not exist.</Text>
          </View>
        </ScreenFade>
      </>
    );
  }

  const grinder = brewers.find((candidate) => candidate.id === setting.brewerId);

  return (
    <ScreenFade>
      <Stack.Screen options={{ title: setting.name }} />
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Card mode="contained" style={styles.headerCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {grinder ? grinder.name : 'Unknown grinder'}
            </Text>
          </Card.Content>
        </Card>

        <List.Item
          title="Selection"
          description={setting.selectionLabel ?? 'Not set'}
          left={(props) => <List.Icon {...props} icon="tune" />}
        />
        <List.Item
          title="Step count"
          description={setting.stepCount === null ? 'Not set' : String(setting.stepCount)}
          left={(props) => <List.Icon {...props} icon="counter" />}
        />
        <List.Item
          title="Dial origin"
          description={setting.isZeroBased ? 'Zero-based' : 'Not zero-based'}
          left={(props) => <List.Icon {...props} icon="rotate-left" />}
        />

        {setting.notes ? (
          <>
            <Text variant="titleSmall" style={styles.notesTitle}>
              Notes
            </Text>
            <Text variant="bodyMedium">{setting.notes}</Text>
          </>
        ) : null}

        <Button
          mode="contained"
          icon="pencil"
          onPress={() => router.push(`/grinder/new?id=${setting.id}`)}
          style={styles.edit}
        >
          Edit setting
        </Button>
        <Button
          mode="text"
          textColor={theme.semantic.error}
          icon="delete-outline"
          onPress={async () => {
            await removeGrindSetting(setting.id);
            router.back();
          }}
          style={styles.delete}
        >
          Remove setting
        </Button>
      </KeyboardAwareScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    marginBottom: 12,
  },
  notesTitle: {
    marginTop: 16,
    marginBottom: 6,
  },
  edit: {
    marginTop: 24,
  },
  delete: {
    marginTop: 8,
  },
});
