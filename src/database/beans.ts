import type { SQLiteDatabase } from 'expo-sqlite';
import type { Bean, BeanProcess, RoastLevel } from '../models';
import { getDatabase } from './database';

interface BeanRow {
  id: number;
  uuid: string | null;
  name: string;
  roaster_id: number | null;
  origin_country: string | null;
  origin_region: string | null;
  farm: string | null;
  producer: string | null;
  varietal: string | null;
  process: string | null;
  altitude_m: number | null;
  roast_level: string | null;
  roast_date: string | null;
  purchased_date: string | null;
  opened_date: string | null;
  finished_date: string | null;
  bag_weight_g: number | null;
  remaining_weight_g: number | null;
  price_cents: number | null;
  currency: string | null;
  notes: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  deleted: number;
}

function rowToBean(row: BeanRow): Bean {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    roasterId: row.roaster_id,
    originCountry: row.origin_country,
    originRegion: row.origin_region,
    farm: row.farm,
    producer: row.producer,
    varietal: row.varietal,
    process: row.process as BeanProcess | null,
    altitudeM: row.altitude_m,
    roastLevel: row.roast_level as RoastLevel | null,
    roastDate: row.roast_date,
    purchasedDate: row.purchased_date,
    openedDate: row.opened_date,
    finishedDate: row.finished_date,
    bagWeightG: row.bag_weight_g,
    remainingWeightG: row.remaining_weight_g,
    priceCents: row.price_cents,
    currency: row.currency,
    notes: row.notes,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: row.deleted === 1,
  };
}

export interface BeanInput {
  name: string;
  roasterId: number | null;
  originCountry: string | null;
  originRegion: string | null;
  farm: string | null;
  producer: string | null;
  varietal: string | null;
  process: BeanProcess | null;
  altitudeM: number | null;
  roastLevel: RoastLevel | null;
  roastDate: string | null;
  purchasedDate: string | null;
  openedDate: string | null;
  finishedDate: string | null;
  bagWeightG: number | null;
  remainingWeightG: number | null;
  priceCents: number | null;
  currency: string | null;
  notes: string | null;
  isActive: boolean;
  sortOrder: number;
}

export async function getAllBeans(db?: SQLiteDatabase): Promise<Bean[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<BeanRow>(
    'SELECT * FROM beans WHERE deleted = 0 ORDER BY is_active DESC, sort_order ASC, name ASC'
  );
  return rows.map(rowToBean);
}

export async function getActiveBeans(db?: SQLiteDatabase): Promise<Bean[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<BeanRow>(
    'SELECT * FROM beans WHERE deleted = 0 AND is_active = 1 ORDER BY sort_order ASC, name ASC'
  );
  return rows.map(rowToBean);
}

export async function getBeansByRoaster(
  roasterId: number,
  db?: SQLiteDatabase
): Promise<Bean[]> {
  const database = db ?? (await getDatabase());
  const rows = await database.getAllAsync<BeanRow>(
    'SELECT * FROM beans WHERE deleted = 0 AND roaster_id = ? ORDER BY is_active DESC, sort_order ASC, name ASC',
    [roasterId]
  );
  return rows.map(rowToBean);
}

export async function getBean(id: number, db?: SQLiteDatabase): Promise<Bean | null> {
  const database = db ?? (await getDatabase());
  const row = await database.getFirstAsync<BeanRow>('SELECT * FROM beans WHERE id = ?', [id]);
  return row ? rowToBean(row) : null;
}

export async function createBean(input: BeanInput, db?: SQLiteDatabase): Promise<number> {
  const database = db ?? (await getDatabase());
  const result = await database.runAsync(
    `INSERT INTO beans (
       name, roaster_id, origin_country, origin_region, farm, producer, varietal, process,
       altitude_m, roast_level, roast_date, purchased_date, opened_date, finished_date,
       bag_weight_g, remaining_weight_g, price_cents, currency, notes, is_active, sort_order
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.roasterId,
      input.originCountry,
      input.originRegion,
      input.farm,
      input.producer,
      input.varietal,
      input.process,
      input.altitudeM,
      input.roastLevel,
      input.roastDate,
      input.purchasedDate,
      input.openedDate,
      input.finishedDate,
      input.bagWeightG,
      input.remainingWeightG,
      input.priceCents,
      input.currency,
      input.notes,
      input.isActive ? 1 : 0,
      input.sortOrder,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateBean(
  id: number,
  input: BeanInput,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE beans SET
       name = ?, roaster_id = ?, origin_country = ?, origin_region = ?, farm = ?, producer = ?,
       varietal = ?, process = ?, altitude_m = ?, roast_level = ?, roast_date = ?,
       purchased_date = ?, opened_date = ?, finished_date = ?, bag_weight_g = ?,
       remaining_weight_g = ?, price_cents = ?, currency = ?, notes = ?, is_active = ?,
       sort_order = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
     WHERE id = ?`,
    [
      input.name,
      input.roasterId,
      input.originCountry,
      input.originRegion,
      input.farm,
      input.producer,
      input.varietal,
      input.process,
      input.altitudeM,
      input.roastLevel,
      input.roastDate,
      input.purchasedDate,
      input.openedDate,
      input.finishedDate,
      input.bagWeightG,
      input.remainingWeightG,
      input.priceCents,
      input.currency,
      input.notes,
      input.isActive ? 1 : 0,
      input.sortOrder,
      id,
    ]
  );
}

export async function setBeanActive(
  id: number,
  active: boolean,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE beans SET is_active = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [active ? 1 : 0, id]
  );
}

export async function setBeanRemainingWeight(
  id: number,
  remainingWeightG: number | null,
  db?: SQLiteDatabase
): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE beans SET remaining_weight_g = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [remainingWeightG, id]
  );
}

export async function deleteBean(id: number, db?: SQLiteDatabase): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.runAsync(
    `UPDATE beans SET deleted = 1, is_active = 0,
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`,
    [id]
  );
}

/**
 * Hard delete, only offered after the user confirms. Brews and plans that
 * reference the bean survive with a null reference, matching ON DELETE SET NULL.
 */
export async function hardDeleteBean(id: number, db?: SQLiteDatabase): Promise<void> {
  const database = db ?? (await getDatabase());
  await database.withTransactionAsync(async () => {
    await database.runAsync('UPDATE brews SET bean_id = NULL WHERE bean_id = ?', [id]);
    await database.runAsync('UPDATE plans SET bean_id = NULL WHERE bean_id = ?', [id]);
    await database.runAsync('UPDATE recipes SET bean_id = NULL WHERE bean_id = ?', [id]);
    await database.runAsync('DELETE FROM beans WHERE id = ?', [id]);
  });
}
