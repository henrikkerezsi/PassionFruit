import type { Bean } from '../models';
import { daysSince } from '../utils/date';

export const DEFAULT_PEAK_END_DAYS = 21;
export const DEFAULT_TAIL_END_DAYS = 45;
export const RESTING_DAYS = 3;

export type FreshnessState = 'unknown' | 'resting' | 'peak' | 'aging' | 'past-peak';

export interface BeanFreshness {
  daysSinceRoast: number | null;
  state: FreshnessState;
}

export function beanFreshness(
  roastDate: string | null,
  now?: string,
  peakEndDays: number = DEFAULT_PEAK_END_DAYS,
  tailEndDays: number = DEFAULT_TAIL_END_DAYS
): BeanFreshness {
  if (roastDate === null) {
    return { daysSinceRoast: null, state: 'unknown' };
  }
  const days = daysSince(roastDate, now);
  if (days < RESTING_DAYS) {
    return { daysSinceRoast: days, state: 'resting' };
  }
  if (days <= peakEndDays) {
    return { daysSinceRoast: days, state: 'peak' };
  }
  if (days <= tailEndDays) {
    return { daysSinceRoast: days, state: 'aging' };
  }
  return { daysSinceRoast: days, state: 'past-peak' };
}

export function remainingFraction(bean: Pick<Bean, 'bagWeightG' | 'remainingWeightG'>): number | null {
  if (bean.bagWeightG === null || bean.bagWeightG <= 0 || bean.remainingWeightG === null) {
    return null;
  }
  const fraction = bean.remainingWeightG / bean.bagWeightG;
  return Math.max(0, Math.min(1, fraction));
}

export function isLowBean(
  bean: Pick<Bean, 'bagWeightG' | 'remainingWeightG'>,
  typicalDoseG: number | null
): boolean {
  if (bean.remainingWeightG === null || typicalDoseG === null) {
    return false;
  }
  return bean.remainingWeightG < typicalDoseG;
}

/**
 * Rotation order: beans that are open and still have coffee come first, oldest
 * roast first, so the user finishes what is going stale before opening anything
 * new. Unopened and inactive beans sink to the bottom.
 */
export function rotationOrder(beans: Bean[]): Bean[] {
  return [...beans].sort((a, b) => {
    const activeDelta = Number(b.isActive) - Number(a.isActive);
    if (activeDelta !== 0) {
      return activeDelta;
    }
    const openedA = a.openedDate !== null;
    const openedB = b.openedDate !== null;
    if (openedA !== openedB) {
      return openedA ? -1 : 1;
    }
    const roastA = a.roastDate ?? '9999-12-31';
    const roastB = b.roastDate ?? '9999-12-31';
    if (roastA !== roastB) {
      return roastA < roastB ? -1 : 1;
    }
    return a.sortOrder - b.sortOrder;
  });
}

export function activeBeans(beans: Bean[]): Bean[] {
  return beans.filter((bean) => bean.isActive && !bean.deleted);
}
