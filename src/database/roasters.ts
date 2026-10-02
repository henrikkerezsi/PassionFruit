import type { SQLiteDatabase } from 'expo-sqlite';
import type { Roaster } from '../models';
import { getDatabase } from './database';

interface RoasterRow {
  id: number;
  uuid: string | null;
  name: string;
  location: string | null;
  url: string | null;
  notes: string | null;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  deleted: number;
}

function rowToRoaster(row: RoasterRow): Roaster {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    location: row.location,
    url: row.url,
    notes: row.notes,
    active: row.active === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: row.deleted === 1,
  };
}

export interface RoasterInput {
  name: string;
  location: string | null;
  url: string | null;
  notes: string | null;
  active: boolean;
  sortOrder: number;
}

export async function getAllRoasters(db?: SQLiteDatabase): Promise<Roaster[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RoasterRow>(
    'SELECT * FROM roasters WHERE deleted = 0 ORDER BY sort_order ASC, name ASC'
  );
  return rows.map(rowToRoaster);
}

export async function getActiveRoasters(db?: SQLiteDatabase): Promise<Roaster[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<RoasterRow>(
    'SELECT * FROM roasters WHERE deleted = 0 AND active = 1 ORDER BY sort_order ASC, name ASC'
  );
  return rows.map(rowToRoaster);
}

export async function getRoaster(id: number, db?: SQLiteDatabase): Promise<Roaster | null> {
  const database = db ?? (await getDatabase());
  const row = await database.getFirstAsync<RoasterRow>(
    'SELECT * FROM roasters WHERE id = ?',
    [id]
  );
  return row ? rowToRoaster(row) : null;
}

export async function createRoaster(
  input: RoasterInput,
  db?: SQLiteDatabase
): Promise<number> {
  const database = db ?? (await getDatabase());
  const result = await database.runAsync(
    `INSERT INTO roasters (name, location, url, notes, active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.name, input.location, input.url, input.notes, input.active ? 1 : 0, input.sortOrder]
  );
  return result.lastInsertRowId;
}

export async function updateRoaster(
  id: number,
  input: RoasterInput,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE roasters SET name = ?, location = ?, url = ?, notes = ?, active = ?,
            sort_order = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [input.name, input.location, input.url, input.notes, input.active ? 1 : 0, input.sortOrder, id]
  );
}

export async function setRoasterActive(
  id: number,
  active: boolean,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE roasters SET active = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [active ? 1 : 0, id]
  );
}

export async function deleteRoaster(id: number, db?: SQLiteDatabase): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE roasters SET deleted = 1, active = 0,
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [id]
  );
}
