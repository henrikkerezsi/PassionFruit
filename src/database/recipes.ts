import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  AgitationKind,
  BrewMethodId,
  GrindUnit,
  Recipe,
  RecipeSource,
  RecipeStep,
  StepKind,
} from '../models';
import { getDatabase } from './database';

interface RecipeRow {
  id: number;
  uuid: string | null;
  name: string;
  method_id: string;
  brewer_id: number | null;
  bean_id: number | null;
  source: string;
  parent_recipe_id: number | null;
  is_builtin: number;
  dose_g: number | null;
  water_total_g: number | null;
  water_temp_c: number | null;
  grinder_id: number | null;
  grind_setting_id: number | null;
  grind_value: number | null;
  grind_unit: string | null;
  expected_total_time_s: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  deleted: number;
}

interface RecipeStepRow {
  id: number;
  uuid: string | null;
  recipe_id: number;
  step_index: number;
  kind: string | null;
  label: string | null;
  target_water_g: number | null;
  pour_water_g: number | null;
  pour_duration_s: number | null;
  wait_after_s: number | null;
  agitation_count: number | null;
  agitation_kind: string | null;
  temperature_c: number | null;
  note: string | null;
  created_at: string;
  updated_at: string | null;
}

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    methodId: row.method_id as BrewMethodId,
    brewerId: row.brewer_id,
    beanId: row.bean_id,
    source: row.source as RecipeSource,
    parentRecipeId: row.parent_recipe_id,
    isBuiltin: row.is_builtin === 1,
    doseG: row.dose_g,
    waterTotalG: row.water_total_g,
    waterTempC: row.water_temp_c,
    grinderId: row.grinder_id,
    grindSettingId: row.grind_setting_id,
    grindValue: row.grind_value,
    grindUnit: row.grind_unit as GrindUnit | null,
    expectedTotalTimeS: row.expected_total_time_s,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: row.deleted === 1,
  };
}

function rowToRecipeStep(row: RecipeStepRow): RecipeStep {
  return {
    id: row.id,
    uuid: row.uuid,
    recipeId: row.recipe_id,
    stepIndex: row.step_index,
    kind: row.kind as StepKind | null,
    label: row.label,
    targetWaterG: row.target_water_g,
    pourWaterG: row.pour_water_g,
    pourDurationS: row.pour_duration_s,
    waitAfterS: row.wait_after_s,
    agitationCount: row.agitation_count,
    agitationKind: row.agitation_kind as AgitationKind | null,
    temperatureC: row.temperature_c,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface RecipeStepInput {
  kind: StepKind | null;
  label: string | null;
  targetWaterG: number | null;
  pourWaterG: number | null;
  pourDurationS: number | null;
  waitAfterS: number | null;
  agitationCount: number | null;
  agitationKind: AgitationKind | null;
  temperatureC: number | null;
  note: string | null;
}

export interface RecipeInput {
  name: string;
  methodId: BrewMethodId;
  brewerId: number | null;
  beanId: number | null;
  source: RecipeSource;
  parentRecipeId: number | null;
  isBuiltin: boolean;
  doseG: number | null;
  waterTotalG: number | null;
  waterTempC: number | null;
  grinderId: number | null;
  grindSettingId: number | null;
  grindValue: number | null;
  grindUnit: GrindUnit | null;
  expectedTotalTimeS: number | null;
  notes: string | null;
  steps: RecipeStepInput[];
}

const RECIPE_COLUMNS = `name, method_id, brewer_id, bean_id, source, parent_recipe_id, is_builtin,
  dose_g, water_total_g, water_temp_c, grinder_id, grind_setting_id, grind_value, grind_unit,
  expected_total_time_s, notes`;

function recipeParams(input: RecipeInput): (string | number | null)[] {
  return [
    input.name,
    input.methodId,
    input.brewerId,
    input.beanId,
    input.source,
    input.parentRecipeId,
    input.isBuiltin ? 1 : 0,
    input.doseG,
    input.waterTotalG,
    input.waterTempC,
    input.grinderId,
    input.grindSettingId,
    input.grindValue,
    input.grindUnit,
    input.expectedTotalTimeS,
    input.notes,
  ];
}

async function insertSteps(
  database: SQLiteDatabase,
  recipeId: number,
  steps: RecipeStepInput[]
): Promise<void> {
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    await database.runAsync(
      `INSERT INTO recipe_steps (
         recipe_id, step_index, kind, label, target_water_g, pour_water_g, pour_duration_s,
         wait_after_s, agitation_count, agitation_kind, temperature_c, note
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeId,
        index,
        step.kind,
        step.label,
        step.targetWaterG,
        step.pourWaterG,
        step.pourDurationS,
        step.waitAfterS,
        step.agitationCount,
        step.agitationKind,
        step.temperatureC,
        step.note,
      ]
    );
  }
}

export async function getAllRecipes(db?: SQLiteDatabase): Promise<Recipe[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE deleted = 0 ORDER BY is_builtin ASC, name ASC'
  );
  return rows.map(rowToRecipe);
}

export async function getRecipesByMethod(
  methodId: BrewMethodId,
  db?: SQLiteDatabase
): Promise<Recipe[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE deleted = 0 AND method_id = ? ORDER BY is_builtin ASC, name ASC',
    [methodId]
  );
  return rows.map(rowToRecipe);
}

export async function getRecipesBySource(
  source: RecipeSource,
  db?: SQLiteDatabase
): Promise<Recipe[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE deleted = 0 AND source = ? ORDER BY name ASC',
    [source]
  );
  return rows.map(rowToRecipe);
}

export async function getBuiltinRecipes(db?: SQLiteDatabase): Promise<Recipe[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE deleted = 0 AND is_builtin = 1 ORDER BY method_id ASC'
  );
  return rows.map(rowToRecipe);
}

export async function getBuiltinRecipeForMethod(
  methodId: BrewMethodId,
  db?: SQLiteDatabase
): Promise<Recipe | null> {
  const database = db ?? (await getDatabase());
  const row = await database.getFirstAsync<RecipeRow>(
    'SELECT * FROM recipes WHERE deleted = 0 AND is_builtin = 1 AND method_id = ? LIMIT 1',
    [methodId]
  );
  return row ? rowToRecipe(row) : null;
}

export async function getRecipe(id: number, db?: SQLiteDatabase): Promise<Recipe | null> {
  const database = db ?? (await getDatabase());
  const row = await database.getFirstAsync<RecipeRow>('SELECT * FROM recipes WHERE id = ?', [id]);
  return row ? rowToRecipe(row) : null;
}

export async function getRecipeSteps(
  recipeId: number,
  db?: SQLiteDatabase
): Promise<RecipeStep[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RecipeStepRow>(
    'SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY step_index ASC',
    [recipeId]
  );
  return rows.map(rowToRecipeStep);
}

export async function createRecipe(
  input: RecipeInput,
  db?: SQLiteDatabase
): Promise<number> {
  const database = db ?? (await getDatabase());
  let id = 0;
  await database.withTransactionAsync(async () => {
    const result = await database.runAsync(
      `INSERT INTO recipes (${RECIPE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      recipeParams(input)
    );
    id = result.lastInsertRowId;
    await insertSteps(database, id, input.steps);
  });
  return id;
}

export async function updateRecipe(
  id: number,
  input: RecipeInput,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `UPDATE recipes SET name = ?, method_id = ?, brewer_id = ?, bean_id = ?, source = ?,
              parent_recipe_id = ?, is_builtin = ?, dose_g = ?, water_total_g = ?,
              water_temp_c = ?, grinder_id = ?, grind_setting_id = ?, grind_value = ?,
              grind_unit = ?, expected_total_time_s = ?, notes = ?,
              updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        WHERE id = ?`,
      [...recipeParams(input), id]
    );
    await database.runAsync('DELETE FROM recipe_steps WHERE recipe_id = ?', [id]);
    await insertSteps(database, id, input.steps);
  });
}

export async function deleteRecipe(id: number, db?: SQLiteDatabase): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE recipes SET deleted = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [id]
  );
}

/**
 * Copies a built-in recipe into the user's own library without editing the
 * built-in, which must stay frozen (idea.txt §9).
 */
export async function adoptBuiltinRecipe(
  builtinId: number,
  db?: SQLiteDatabase
): Promise<number> {
  const database = db ?? (await getDatabase());
  const source = await getRecipe(builtinId, database);
  if (!source) {
    throw new Error(`Recipe ${builtinId} not found`);
  }
  const steps = await getRecipeSteps(builtinId, database);
  return createRecipe(
    {
      name: source.name,
      methodId: source.methodId,
      brewerId: source.brewerId,
      beanId: source.beanId,
      source: 'own',
      parentRecipeId: source.id,
      isBuiltin: false,
      doseG: source.doseG,
      waterTotalG: source.waterTotalG,
      waterTempC: source.waterTempC,
      grinderId: source.grinderId,
      grindSettingId: source.grindSettingId,
      grindValue: source.grindValue,
      grindUnit: source.grindUnit,
      expectedTotalTimeS: source.expectedTotalTimeS,
      notes: source.notes,
      steps: steps.map((step) => ({
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
      })),
    },
    database
  );
}
