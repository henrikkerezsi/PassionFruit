import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Divider, List, Text } from 'react-native-paper';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { useAppData } from '../../data/DataProvider';
import { useAppTheme } from '../../theme';

export default function RoasterDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { roasters, beans } = useAppData();

  const roaster = roasters.find((candidate) => candidate.id === Number(id));

  if (!roaster) {
    return (
      <>
        <Stack.Screen options={{ title: 'Roaster' }} />
        <ScreenFade>
          <View style={[styles.center, { padding: theme.spacing[6] }]}>
            <Text variant="bodyLarge">That roaster does not exist.</Text>
          </View>
        </ScreenFade>
      </>
    );
  }

  const roasterBeans = beans.filter((bean) => bean.roasterId === roaster.id);

  return (
    <ScreenFade>
      <Stack.Screen options={{ title: roaster.name }} />
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Card mode="contained" style={styles.headerCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {roaster.location ?? 'No location'}
            </Text>
          </Card.Content>
        </Card>

        {roaster.url ? (
          <List.Item
            title="Website"
            description={roaster.url}
            left={(props) => <List.Icon {...props} icon="link-variant" />}
          />
        ) : null}
        {roaster.notes ? (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleSmall" style={styles.notesTitle}>
              Notes
            </Text>
            <Text variant="bodyMedium">{roaster.notes}</Text>
          </>
        ) : null}

        <Divider style={styles.divider} />
        <Text variant="titleMedium" style={styles.section}>
          Beans
        </Text>
        {roasterBeans.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No beans from this roaster yet.
          </Text>
        ) : (
          roasterBeans.map((bean) => (
            <List.Item
              key={bean.id}
              title={bean.name}
              description={bean.roastDate ?? 'No roast date'}
              left={(props) => <List.Icon {...props} icon="coffee-outline" />}
              onPress={() => router.push(`/bean/${bean.id}`)}
            />
          ))
        )}

        <Button
          mode="contained"
          icon="pencil"
          onPress={() => router.push(`/roaster/new?id=${roaster.id}`)}
          style={styles.edit}
        >
          Edit roaster
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
  divider: {
    marginVertical: 16,
  },
  notesTitle: {
    marginBottom: 6,
  },
  section: {
    marginBottom: 4,
  },
  edit: {
    marginTop: 24,
  },
});
