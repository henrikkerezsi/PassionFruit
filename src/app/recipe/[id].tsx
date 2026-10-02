import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Divider, List, Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { LoadingScreen } from '../../components/loading-screen';
import { useAppData } from '../../data/DataProvider';
import { useAppTheme } from '../../theme';
import type { RecipeStep } from '../../models';
import { getRecipeSteps } from '../../database/recipes';
import { methodLabel } from '../../utils/labels';
import {
  checkHealthyRanges,
  deriveRatio,
  formatRatio,
} from '../../services/method-service';

export default function RecipeDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, adoptRecipe } = useAppData();
  const [steps, setSteps] = useState<RecipeStep[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const recipeId = Number(id);
  const recipe = recipes.find((candidate) => candidate.id === recipeId);

  useEffect(() => {
    let active = true;
    async function load() {
      const loaded = await getRecipeSteps(recipeId);
      if (active) {
        setSteps(loaded);
      }
    }
    if (Number.isFinite(recipeId)) {
      void load();
    }
    return () => {
      active = false;
    };
  }, [recipeId]);

  if (!recipe) {
    return (
      <>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <ScreenFade>
          <View style={[styles.center, { padding: theme.spacing[6] }]}>
            <Text variant="bodyLarge">That recipe does not exist.</Text>
          </View>
        </ScreenFade>
      </>
    );
  }

  if (steps === null) {
    return <LoadingScreen />;
  }

  const ratio = formatRatio(deriveRatio(recipe.doseG, recipe.waterTotalG));
  const violations = checkHealthyRanges(recipe.methodId, {
    doseG: recipe.doseG,
    waterTotalG: recipe.waterTotalG,
    waterTempC: recipe.waterTempC,
    totalTimeS: recipe.expectedTotalTimeS,
  });

  return (
    <ScreenFade>
      <Stack.Screen options={{ title: recipe.name }} />
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Card mode="contained" style={styles.headerCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {recipe.isBuiltin ? 'Built-in recipe' : 'My recipe'} ·{' '}
              {methodLabel(recipe.methodId)}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.metrics}>
          <Metric label="Dose" value={recipe.doseG === null ? '—' : `${recipe.doseG} g`} />
          <Metric
            label="Water"
            value={recipe.waterTotalG === null ? '—' : `${recipe.waterTotalG} g`}
          />
          <Metric label="Ratio" value={ratio} />
          <Metric
            label="Temp"
            value={recipe.waterTempC === null ? '—' : `${recipe.waterTempC} °C`}
          />
          <Metric
            label="Time"
            value={
              recipe.expectedTotalTimeS === null ? '—' : `${recipe.expectedTotalTimeS} s`
            }
          />
        </View>

        {violations.length > 0 ? (
          <Card mode="outlined" style={styles.warnCard}>
            <Card.Content>
              <View style={styles.warnHeader}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={20}
                  color={theme.semantic.warning}
                />
                <Text variant="titleSmall" style={styles.warnTitle}>
                  Outside the usual range
                </Text>
              </View>
              {violations.map((violation) => (
                <Text key={violation.knob} variant="bodySmall" style={styles.warnText}>
                  {violation.reason}
                </Text>
              ))}
            </Card.Content>
          </Card>
        ) : null}

        <Text variant="titleMedium" style={styles.section}>
          Steps
        </Text>
        {steps.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No steps recorded for this recipe.
          </Text>
        ) : (
          steps.map((step, index) => (
            <List.Item
              key={step.id}
              title={step.label ?? `Step ${index + 1}`}
              description={stepDescription(step)}
              left={() => (
                <Text variant="labelLarge" style={styles.stepIndex}>
                  {index + 1}
                </Text>
              )}
            />
          ))
        )}

        <Divider style={styles.divider} />

        {recipe.isBuiltin ? (
          <Button
            mode="contained"
            icon="content-copy"
            onPress={async () => {
              await adoptRecipe(recipe.id);
              setMessage('Copied into your recipes.');
            }}
          >
            Copy to my recipes
          </Button>
        ) : (
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => router.push(`/recipe/new?id=${recipe.id}`)}
          >
            Edit recipe
          </Button>
        )}

        <View style={styles.spacer} />
      </KeyboardAwareScrollView>
      <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={2000}>
        {message ?? ''}
      </Snackbar>
    </ScreenFade>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.metric}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
  );
}

function stepDescription(step: RecipeStep): string {
  const parts: string[] = [];
  if (step.pourWaterG !== null) {
    parts.push(`${step.pourWaterG} g`);
  }
  if (step.targetWaterG !== null) {
    parts.push(`to ${step.targetWaterG} g`);
  }
  if (step.pourDurationS !== null) {
    parts.push(`${step.pourDurationS} s pour`);
  }
  if (step.waitAfterS !== null) {
    parts.push(`wait ${step.waitAfterS} s`);
  }
  if (step.temperatureC !== null) {
    parts.push(`${step.temperatureC} °C`);
  }
  if (step.note) {
    parts.push(step.note);
  }
  return parts.length > 0 ? parts.join(' · ') : '—';
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
    marginBottom: 16,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metric: {
    width: '33%',
    marginBottom: 12,
  },
  warnCard: {
    marginBottom: 12,
  },
  warnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warnTitle: {
    marginLeft: 6,
  },
  warnText: {
    marginTop: 2,
  },
  section: {
    marginTop: 8,
    marginBottom: 4,
  },
  stepIndex: {
    minWidth: 28,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.6,
  },
  divider: {
    marginVertical: 16,
  },
  spacer: {
    height: 24,
  },
});
