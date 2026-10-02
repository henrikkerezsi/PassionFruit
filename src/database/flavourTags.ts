import type { SQLiteDatabase } from 'expo-sqlite';
import type { FlavourCategory, FlavourTag } from '../models';
import { getDatabase } from './database';

interface FlavourTagRow {
  id: string;
  uuid: string | null;
  name: string;
  category: string;
  is_seeded: number;
  sort_order: number;
}

function rowToFlavourTag(row: FlavourTagRow): FlavourTag {
  return {
    id: row.id,
    name: row.name,
    category: row.category as FlavourCategory,
    isSeeded: row.is_seeded === 1,
    sortOrder: row.sort_order,
  };
}

export async function getAllFlavourTags(db?: SQLiteDatabase): Promise<FlavourTag[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<FlavourTagRow>(
    'SELECT * FROM flavour_tags ORDER BY category ASC, sort_order ASC, name ASC'
  );
  return rows.map(rowToFlavourTag);
}

export async function getFlavourTagsByCategory(
  category: FlavourCategory,
  db?: SQLiteDatabase
): Promise<FlavourTag[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<FlavourTagRow>(
    'SELECT * FROM flavour_tags WHERE category = ? ORDER BY sort_order ASC, name ASC',
    [category]
  );
  return rows.map(rowToFlavourTag);
}

export async function getFlavourTag(
  id: string,
  db?: SQLiteDatabase
): Promise<FlavourTag | null> {
  const database = db ?? (await getDatabase());
  const row = await database.getFirstAsync<FlavourTagRow>(
    'SELECT * FROM flavour_tags WHERE id = ?',
    [id]
  );
  return row ? rowToFlavourTag(row) : null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * User tags may only be added under the `other` category; seeded tags are never
 * renamed or deleted (idea.txt §10.4).
 */
export async function addOtherFlavourTag(
  name: string,
  db?: SQLiteDatabase
): Promise<string> {
  const database = db ?? (await getDatabase());
  const base = `other-${slugify(name) || 'tag'}`;
  let id = base;
  let suffix = 2;
  while (await getFlavourTag(id, database)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  const max = await database.getFirstAsync<{ next: number | null }>(
    "SELECT MAX(sort_order) + 1 AS next FROM flavour_tags WHERE category = 'other'"
  );
  await database.runAsync(
    'INSERT INTO flavour_tags (id, name, category, is_seeded, sort_order) VALUES (?, ?, ?, 0, ?)',
    [id, name.trim(), 'other', max?.next ?? 1]
  );
  return id;
}
