import {
  checkHealthyRanges,
  deriveRatio,
  formatRatio,
  isWaterTargetMonotonic,
  missingRequiredStepKinds,
  pourWaterDeltas,
} from '../../src/services/method-service';

describe('deriveRatio', () => {
  it('divides water by dose', () => {
    expect(deriveRatio(15, 250)).toBeCloseTo(16.666, 2);
  });

  it('returns null when either value is missing', () => {
    expect(deriveRatio(null, 250)).toBeNull();
    expect(deriveRatio(15, null)).toBeNull();
  });

  it('returns null for a non-positive dose', () => {
    expect(deriveRatio(0, 250)).toBeNull();
  });
});

describe('formatRatio', () => {
  it('renders one decimal place', () => {
    expect(formatRatio(16.666)).toBe('1:16.7');
  });

  it('renders an em dash for null', () => {
    expect(formatRatio(null)).toBe('—');
  });
});

describe('checkHealthyRanges', () => {
  it('accepts a canonical v60', () => {
    expect(
      checkHealthyRanges('v60', {
        doseG: 15,
        waterTotalG: 250,
        waterTempC: 93,
        totalTimeS: 165,
      })
    ).toEqual([]);
  });

  it('flags a cold, fast v60', () => {
    const knobs = checkHealthyRanges('v60', {
      doseG: 15,
      waterTotalG: 250,
      waterTempC: 70,
      totalTimeS: 60,
    }).map((violation) => violation.knob);
    expect(knobs).toContain('water_temp_c');
    expect(knobs).toContain('total_time_s');
  });

  it('flags an out-of-range ratio', () => {
    const knobs = checkHealthyRanges('v60', {
      doseG: 15,
      waterTotalG: 400,
      waterTempC: 93,
      totalTimeS: 165,
    }).map((violation) => violation.knob);
    expect(knobs).toContain('ratio');
  });

  it('flags a bloom that is too large', () => {
    const knobs = checkHealthyRanges('v60', {
      doseG: 15,
      waterTotalG: 250,
      waterTempC: 93,
      totalTimeS: 165,
      bloomWaterG: 90,
    }).map((violation) => violation.knob);
    expect(knobs).toContain('bloom_water_g');
  });

  it('never flags moka for a null temperature', () => {
    expect(
      checkHealthyRanges('moka', {
        doseG: 18,
        waterTotalG: 150,
        waterTempC: null,
        totalTimeS: 240,
      })
    ).toEqual([]);
  });
});

describe('missingRequiredStepKinds', () => {
  it('reports a missing bloom', () => {
    expect(missingRequiredStepKinds('v60', ['pour'])).toEqual(['bloom']);
  });

  it('reports nothing when required steps are present', () => {
    expect(missingRequiredStepKinds('v60', ['bloom', 'pour', 'swirl'])).toEqual([]);
  });

  it('requires the defining cold-brew steps', () => {
    expect(missingRequiredStepKinds('cold-brew', ['add_water'])).toEqual(['steep', 'drain']);
  });
});

describe('isWaterTargetMonotonic', () => {
  it('accepts non-decreasing targets', () => {
    expect(isWaterTargetMonotonic([45, 150, 250])).toBe(true);
  });

  it('rejects a decrease', () => {
    expect(isWaterTargetMonotonic([45, 250, 150])).toBe(false);
  });

  it('ignores nulls', () => {
    expect(isWaterTargetMonotonic([45, null, 250])).toBe(true);
  });
});

describe('pourWaterDeltas', () => {
  it('returns the pour deltas from cumulative targets', () => {
    expect(pourWaterDeltas([45, 150, 250])).toEqual([45, 105, 100]);
  });

  it('preserves null gaps', () => {
    expect(pourWaterDeltas([45, null, 250])).toEqual([45, null, 205]);
  });
});
