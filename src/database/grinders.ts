import type { SQLiteDatabase } from 'expo-sqlite';
import type { GrindSetting } from '../models';
import { getDatabase } from './database';

interface GrindSettingRow {
  id: number;
  uuid: string | null;
  brewer_id: number;
  name: string;
  selection_label: string | null;
  step_count: number | null;
  is_zero_based: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  deleted: number;
}

function rowToGrindSetting(row: GrindSettingRow): GrindSetting {
  return {
    id: row.id,
    uuid: row.uuid,
    brewerId: row.brewer_id,
    name: row.name,
    selectionLabel: row.selection_label,
    stepCount: row.step_count,
    isZeroBased: row.is_zero_based === 1,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: row.deleted === 1,
  };
}

export interface GrindSettingInput {
  brewerId: number;
  name: string;
  selectionLabel: string | null;
  stepCount: number | null;
  isZeroBased: boolean;
  notes: string | null;
}

export async function getAllGrindSettings(db?: SQLiteDatabase): Promise<GrindSetting[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<GrindSettingRow>(
    'SELECT * FROM grind_settings WHERE deleted = 0 ORDER BY brewer_id ASC, name ASC'
  );
  return rows.map(rowToGrindSetting);
}

export async function getGrindSettingsByBrewer(
  brewerId: number,
  db?: SQLiteDatabase
): Promise<GrindSetting[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<GrindSettingRow>(
    'SELECT * FROM grind_settings WHERE deleted = 0 AND brewer_id = ? ORDER BY name ASC',
    [brewerId]
  );
  return rows.map(rowToGrindSetting);
}

export async function getGrindSetting(
  id: number,
  db?: SQLiteDatabase
): Promise<GrindSetting | null> {
  const database = db ?? (await getDatabase());
  const row = await database.getFirstAsync<GrindSettingRow>(
    'SELECT * FROM grind_settings WHERE id = ?',
    [id]
  );
  return row ? rowToGrindSetting(row) : null;
}

export async function createGrindSetting(
  input: GrindSettingInput,
  db?: SQLiteDatabase
): Promise<number> {
  const database = db ?? (await getDatabase());
  const result = await database.runAsync(
    `INSERT INTO grind_settings (brewer_id, name, selection_label, step_count, is_zero_based, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.brewerId,
      input.name,
      input.selectionLabel,
      input.stepCount,
      input.isZeroBased ? 1 : 0,
      input.notes,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateGrindSetting(
  id: number,
  input: GrindSettingInput,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE grind_settings SET brewer_id = ?, name = ?, selection_label = ?, step_count = ?,
            is_zero_based = ?, notes = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [
      input.brewerId,
      input.name,
      input.selectionLabel,
      input.stepCount,
      input.isZeroBased ? 1 : 0,
      input.notes,
      id,
    ]
  );
}

export async function deleteGrindSetting(id: number, db?: SQLiteDatabase): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE grind_settings SET deleted = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [id]
  );
}
