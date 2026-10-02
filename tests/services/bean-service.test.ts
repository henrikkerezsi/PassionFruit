import type { Bean } from '../../src/models';
import {
  activeBeans,
  beanFreshness,
  isLowBean,
  remainingFraction,
  rotationOrder,
} from '../../src/services/bean-service';

function bean(partial: Partial<Bean>): Bean {
  return {
    id: partial.id ?? 1,
    uuid: partial.uuid ?? null,
    name: partial.name ?? 'Test Bean',
    roasterId: partial.roasterId ?? null,
    originCountry: partial.originCountry ?? null,
    originRegion: partial.originRegion ?? null,
    farm: partial.farm ?? null,
    producer: partial.producer ?? null,
    varietal: partial.varietal ?? null,
    process: partial.process ?? null,
    altitudeM: partial.altitudeM ?? null,
    roastLevel: partial.roastLevel ?? null,
    roastDate: partial.roastDate ?? null,
    purchasedDate: partial.purchasedDate ?? null,
    openedDate: partial.openedDate ?? null,
    finishedDate: partial.finishedDate ?? null,
    bagWeightG: partial.bagWeightG ?? null,
    remainingWeightG: partial.remainingWeightG ?? null,
    priceCents: partial.priceCents ?? null,
    currency: partial.currency ?? null,
    notes: partial.notes ?? null,
    isActive: partial.isActive ?? true,
    sortOrder: partial.sortOrder ?? 0,
    createdAt: partial.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: partial.updatedAt ?? null,
    deleted: partial.deleted ?? false,
  };
}

describe('beanFreshness', () => {
  it('is unknown without a roast date', () => {
    expect(beanFreshness(null, '2026-10-01')).toEqual({
      daysSinceRoast: null,
      state: 'unknown',
    });
  });

  it('treats a fresh roast as resting', () => {
    expect(beanFreshness('2026-10-01', '2026-10-01')).toEqual({
      daysSinceRoast: 0,
      state: 'resting',
    });
  });

  it('treats a two-week-old roast as peak', () => {
    expect(beanFreshness('2026-09-15', '2026-10-01').state).toBe('peak');
  });

  it('treats a thirty-day roast as aging', () => {
    expect(beanFreshness('2026-09-01', '2026-10-01')).toEqual({
      daysSinceRoast: 30,
      state: 'aging',
    });
  });

  it('treats a very old roast as past its peak', () => {
    expect(beanFreshness('2026-08-01', '2026-10-01').state).toBe('past-peak');
  });
});

describe('remainingFraction', () => {
  it('divides remaining by bag weight', () => {
    expect(remainingFraction({ bagWeightG: 1000, remainingWeightG: 250 })).toBe(0.25);
  });

  it('returns null without both weights', () => {
    expect(remainingFraction({ bagWeightG: 1000, remainingWeightG: null })).toBeNull();
    expect(remainingFraction({ bagWeightG: null, remainingWeightG: 250 })).toBeNull();
  });

  it('clamps a negative remaining to zero', () => {
    expect(remainingFraction({ bagWeightG: 1000, remainingWeightG: -50 })).toBe(0);
  });
});

describe('isLowBean', () => {
  it('is true when remaining is below a typical dose', () => {
    expect(isLowBean({ bagWeightG: 1000, remainingWeightG: 12 }, 15)).toBe(true);
  });

  it('is false without a typical dose', () => {
    expect(isLowBean({ bagWeightG: 1000, remainingWeightG: 12 }, null)).toBe(false);
  });
});

describe('rotationOrder', () => {
  it('prefers opened beans, oldest roast first, then inactive last', () => {
    const unopened = bean({ id: 1, openedDate: null, roastDate: '2026-09-01' });
    const openedOld = bean({ id: 2, openedDate: '2026-09-20', roastDate: '2026-08-01' });
    const openedNew = bean({ id: 3, openedDate: '2026-09-25', roastDate: '2026-09-15' });
    const inactive = bean({ id: 4, isActive: false, openedDate: '2026-01-01', roastDate: '2026-01-01' });

    expect(rotationOrder([unopened, openedNew, inactive, openedOld]).map((b) => b.id)).toEqual([
      2, 3, 1, 4,
    ]);
  });
});

describe('activeBeans', () => {
  it('keeps only active, undeleted beans', () => {
    const beans = [
      bean({ id: 1 }),
      bean({ id: 2, isActive: false }),
      bean({ id: 3, deleted: true }),
    ];
    expect(activeBeans(beans).map((b) => b.id)).toEqual([1]);
  });
});
