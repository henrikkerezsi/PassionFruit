import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Divider, List, SegmentedButtons, Switch, Text } from 'react-native-paper';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { NumberField } from '../../components/number-field';
import { OptionField } from '../../components/option-field';
import { useAppData } from '../../data/DataProvider';
import { useAppTheme } from '../../theme';
import { BREW_METHOD_IDS } from '../../models';
import type { BrewMethodId, ThemeMode } from '../../models';
import { BREWER_KIND_LABELS, METHOD_LABELS } from '../../utils/labels';

const METHOD_OPTIONS = BREW_METHOD_IDS.map((value) => ({
  value,
  label: METHOD_LABELS[value],
}));

export default function SettingsScreen() {
  const {
    settings,
    aiState,
    roasters,
    brewers,
    grindSettings,
    saveSettings,
  } = useAppData();
  const theme = useAppTheme();

  return (
    <ScreenFade>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Text variant="titleMedium" style={styles.section}>
          Appearance
        </Text>
        <SegmentedButtons
          value={settings.themeMode}
          onValueChange={(value) => saveSettings({ themeMode: value as ThemeMode })}
          buttons={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          Coffee
        </Text>
        <OptionField<BrewMethodId>
          label="Default method"
          value={settings.defaultMethodId}
          options={METHOD_OPTIONS}
          onChange={(value) => saveSettings({ defaultMethodId: value })}
          emptyLabel="No default"
        />
        <View style={styles.field}>
          <NumberField
            label="Bean freshness nudge"
            value={settings.beanFreshnessWarningDays}
            onChange={(value) =>
              saveSettings({ beanFreshnessWarningDays: value ?? settings.beanFreshnessWarningDays })
            }
            unit="days"
            integer
          />
        </View>
        <View style={styles.field}>
          <NumberField
            label="Low bean threshold"
            value={settings.lowBeanThresholdG}
            onChange={(value) =>
              saveSettings({ lowBeanThresholdG: value ?? settings.lowBeanThresholdG })
            }
            unit="g"
          />
        </View>

        <Text variant="titleSmall" style={styles.subhead}>
          Roasters
        </Text>
        {roasters.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No roasters yet.
          </Text>
        ) : (
          roasters.map((roaster) => (
            <List.Item
              key={roaster.id}
              title={roaster.name}
              description={roaster.location ?? 'No location'}
              left={(props) => <List.Icon {...props} icon="store-outline" />}
              onPress={() => router.push(`/roaster/${roaster.id}`)}
            />
          ))
        )}
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => router.push('/roaster/new')}
          style={styles.addButton}
        >
          Add roaster
        </Button>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          Equipment
        </Text>
        {brewers.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No equipment yet.
          </Text>
        ) : (
          brewers.map((brewer) => (
            <List.Item
              key={brewer.id}
              title={brewer.name}
              description={BREWER_KIND_LABELS[brewer.kind]}
              left={(props) => <List.Icon {...props} icon="coffee-maker-outline" />}
              onPress={() => router.push(`/brewer/${brewer.id}`)}
            />
          ))
        )}
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => router.push('/brewer/new')}
          style={styles.addButton}
        >
          Add equipment
        </Button>

        <Text variant="titleSmall" style={styles.subhead}>
          Grind settings
        </Text>
        {grindSettings.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No grind settings yet.
          </Text>
        ) : (
          grindSettings.map((setting) => (
            <List.Item
              key={setting.id}
              title={setting.name}
              description={setting.selectionLabel ?? 'No selection label'}
              left={(props) => <List.Icon {...props} icon="tune" />}
              onPress={() => router.push(`/grinder/${setting.id}`)}
            />
          ))
        )}
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => router.push('/grinder/new')}
          style={styles.addButton}
        >
          Add grind setting
        </Button>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          Recording
        </Text>
        <List.Item
          title="Keep audio"
          description="Audio is retained so a memo can be re-transcribed later."
          right={() => (
            <Switch
              value={settings.audioRetention === 'keep'}
              onValueChange={handleKeepAudio}
            />
          )}
        />

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          Notifications
        </Text>
        <List.Item
          title="Enable notifications"
          description="Bean freshness, low bean and unlogged-session reminders."
          right={() => (
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => saveSettings({ notificationsEnabled: value })}
            />
          )}
        />

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          AI provider
        </Text>
        <List.Item
          title="Status"
          description={
            aiState.enabled
              ? 'A provider is configured. Credentials are stored only on this device.'
              : 'Not configured. The app works fully offline without it.'
          }
        />
        <View style={styles.spacer} />
      </KeyboardAwareScrollView>
    </ScreenFade>
  );

  function handleKeepAudio(value: boolean) {
    saveSettings({ audioRetention: value ? 'keep' : 'delete-after-commit' });
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  section: {
    marginBottom: 8,
  },
  subhead: {
    marginTop: 16,
    marginBottom: 4,
  },
  field: {
    marginTop: 12,
  },
  addButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  spacer: {
    height: 24,
  },
});
