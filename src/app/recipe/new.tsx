import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/loading-screen';
import { RecipeForm } from '../../components/recipe-form';
import { useAppData } from '../../data/DataProvider';
import { getRecipeSteps } from '../../database/recipes';
import type { RecipeStepInput } from '../../database/recipes';

export default function NewRecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ready, recipes, addRecipe, saveRecipe } = useAppData();
  const [steps, setSteps] = useState<RecipeStepInput[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const recipeId = id ? Number(id) : null;
  const existing =
    recipeId === null ? null : recipes.find((recipe) => recipe.id === recipeId) ?? null;
  const editing = existing !== null && !existing.isBuiltin;

  useEffect(() => {
    let active = true;
    async function load() {
      if (recipeId === null) {
        setSteps([]);
        return;
      }
      const loaded = await getRecipeSteps(recipeId);
      if (active) {
        setSteps(
          loaded.map((step) => ({
            kind: step.kind,
            label: step.label,
            targetWaterG: step.targetWaterG,
            pourWaterG: step.pourWaterG,
            pourDurationS: step.pourDurationS,
            waitAfterS: step.waitAfterS,
            agitationCount: step.agitationCount,
            agitationKind: step.agitationKind,
            temperatureC: step.temperatureC,
            note: step.note,
          }))
        );
      }
    }
    if (ready) {
      void load();
    }
    return () => {
      active = false;
    };
  }, [ready, recipeId]);

  if (!ready || steps === null) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: editing ? 'Edit recipe' : existing ? 'Copy recipe' : 'New recipe',
        }}
      />
      <RecipeForm
        initial={existing}
        initialSteps={steps}
        submitting={submitting}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            if (editing && existing) {
              await saveRecipe(existing.id, input);
            } else {
              await addRecipe(input);
            }
            router.back();
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </>
  );
}
