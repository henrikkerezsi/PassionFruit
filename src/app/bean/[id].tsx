import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Dialog, Divider, List, Portal, Text } from 'react-native-paper';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { AppDialog } from '../../components/app-dialog';
import { useAppData } from '../../data/DataProvider';
import { useAppTheme } from '../../theme';
import { beanFreshness, remainingFraction } from '../../services/bean-service';
import { PROCESS_LABELS, ROAST_LEVEL_LABELS } from '../../utils/labels';

const FRESHNESS_LABELS: Record<string, string> = {
  unknown: 'No roast date',
  resting: 'Resting',
  peak: 'In its peak window',
  aging: 'Aging',
  'past-peak': 'Past its peak',
};

export default function BeanDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { beans, roasters, removeBean, setBeanRemaining } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const bean = beans.find((candidate) => candidate.id === Number(id));

  if (!bean) {
    return (
      <>
        <Stack.Screen options={{ title: 'Bean' }} />
        <ScreenFade>
          <View style={[styles.center, { padding: theme.spacing[6] }]}>
            <Text variant="bodyLarge">That bean does not exist.</Text>
          </View>
        </ScreenFade>
      </>
    );
  }

  const roaster = roasters.find((candidate) => candidate.id === bean.roasterId);
  const freshness = beanFreshness(bean.roastDate);
  const fraction = remainingFraction(bean);

  return (
    <ScreenFade>
      <Stack.Screen options={{ title: bean.name }} />
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Card mode="contained" style={styles.headerCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {roaster ? roaster.name : 'No roaster'} · {FRESHNESS_LABELS[freshness.state]}
              {freshness.daysSinceRoast !== null ? ` (${freshness.daysSinceRoast} d)` : ''}
            </Text>
          </Card.Content>
        </Card>

        <List.Item
          title="Remaining"
          description={
            bean.remainingWeightG === null
              ? 'Not tracked'
              : `${bean.remainingWeightG} g${
                  fraction === null ? '' : ` · ${Math.round(fraction * 100)}%`
                }`
          }
          left={(props) => <List.Icon {...props} icon="scale" />}
        />
        <List.Item
          title="Process"
          description={bean.process ? PROCESS_LABELS[bean.process] : 'Not set'}
          left={(props) => <List.Icon {...props} icon="water-outline" />}
        />
        <List.Item
          title="Roast level"
          description={bean.roastLevel ? ROAST_LEVEL_LABELS[bean.roastLevel] : 'Not set'}
          left={(props) => <List.Icon {...props} icon="fire" />}
        />
        <List.Item
          title="Origin"
          description={[bean.originCountry, bean.originRegion].filter(Boolean).join(', ') || 'Not set'}
          left={(props) => <List.Icon {...props} icon="earth" />}
        />
        <List.Item
          title="Roast date"
          description={bean.roastDate ?? 'Not set'}
          left={(props) => <List.Icon {...props} icon="calendar" />}
        />

        {fraction !== null ? (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => setBeanRemaining(bean.id, 0)}
              disabled={bean.remainingWeightG === 0}
            >
              Mark empty
            </Button>
          </View>
        ) : null}

        {bean.notes ? (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleSmall" style={styles.notesTitle}>
              Notes
            </Text>
            <Text variant="bodyMedium">{bean.notes}</Text>
          </>
        ) : null}

        <Divider style={styles.divider} />
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => router.push(`/bean/new?id=${bean.id}`)}
        >
          Edit bean
        </Button>
        <Button
          mode="text"
          textColor={theme.semantic.error}
          icon="delete-outline"
          onPress={() => setConfirmDelete(true)}
          style={styles.delete}
        >
          Remove bean
        </Button>
      </KeyboardAwareScrollView>

      <Portal>
        <AppDialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>Remove bean?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              The bean is hidden from your catalogue. Brews that used it keep their record.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              textColor={theme.semantic.error}
              onPress={async () => {
                setConfirmDelete(false);
                await removeBean(bean.id);
                router.back();
              }}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </AppDialog>
      </Portal>
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
  actions: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  notesTitle: {
    marginBottom: 6,
  },
  delete: {
    marginTop: 8,
  },
});
