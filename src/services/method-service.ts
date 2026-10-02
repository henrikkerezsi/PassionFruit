import type {
  BrewMethodId,
  HealthyRange,
  MethodGuide,
  StepKind,
} from '../models';
import { getMethodGuide } from '../config/method-guides';

export interface MethodValues {
  doseG: number | null;
  waterTotalG: number | null;
  waterTempC: number | null;
  totalTimeS: number | null;
  bloomWaterG?: number | null;
}

export interface HealthyRangeViolation {
  knob: 'dose_g' | 'ratio' | 'water_temp_c' | 'total_time_s' | 'bloom_water_g';
  observed: number;
  min: number | null;
  max: number | null;
  reason: string;
}

export function methodGuide(methodId: BrewMethodId): MethodGuide {
  return getMethodGuide(methodId);
}

export function deriveRatio(
  doseG: number | null,
  waterTotalG: number | null
): number | null {
  if (doseG === null || waterTotalG === null || doseG <= 0) {
    return null;
  }
  return waterTotalG / doseG;
}

export function formatRatio(ratio: number | null): string {
  if (ratio === null) {
    return '—';
  }
  return `1:${ratio.toFixed(1)}`;
}

function violates(value: number, range: HealthyRange): boolean {
  if (range.min !== null && value < range.min) {
    return true;
  }
  if (range.max !== null && value > range.max) {
    return true;
  }
  return false;
}

function rangeLabel(range: HealthyRange, unit: string): string {
  if (range.min === null && range.max === null) {
    return `not controlled (${unit})`;
  }
  if (range.min !== null && range.max !== null) {
    return `${range.min}–${range.max}${unit}`;
  }
  if (range.min !== null) {
    return `at least ${range.min}${unit}`;
  }
  return `at most ${range.max}${unit}`;
}

export function checkHealthyRanges(
  methodId: BrewMethodId,
  values: MethodValues
): HealthyRangeViolation[] {
  const { healthy } = getMethodGuide(methodId);
  const violations: HealthyRangeViolation[] = [];

  if (violatesRangeOptional(values.doseG, healthy.doseG)) {
    violations.push({
      knob: 'dose_g',
      observed: values.doseG as number,
      min: healthy.doseG.min,
      max: healthy.doseG.max,
      reason: `The dose is usually ${rangeLabel(healthy.doseG, ' g')} for this method.`,
    });
  }

  const ratio = deriveRatio(values.doseG, values.waterTotalG);
  if (ratio !== null && violates(ratio, healthy.ratio)) {
    const low = healthy.ratio.min === null ? null : `1:${healthy.ratio.min}`;
    const high = healthy.ratio.max === null ? null : `1:${healthy.ratio.max}`;
    const label = low !== null && high !== null ? `${low}–${high}` : (low ?? high ?? '—');
    violations.push({
      knob: 'ratio',
      observed: ratio,
      min: healthy.ratio.min,
      max: healthy.ratio.max,
      reason: `The ratio is outside the usual ${label} for this method.`,
    });
  }

  if (violatesRangeOptional(values.waterTempC, healthy.waterTempC)) {
    violations.push({
      knob: 'water_temp_c',
      observed: values.waterTempC as number,
      min: healthy.waterTempC.min,
      max: healthy.waterTempC.max,
      reason: `Water temperature is usually ${rangeLabel(healthy.waterTempC, ' °C')} for this method.`,
    });
  }

  if (violatesRangeOptional(values.totalTimeS, healthy.totalTimeS)) {
    violations.push({
      knob: 'total_time_s',
      observed: values.totalTimeS as number,
      min: healthy.totalTimeS.min,
      max: healthy.totalTimeS.max,
      reason: `A total brew time of ${rangeLabel(healthy.totalTimeS, ' s')} is typical.`,
    });
  }

  if (
    healthy.bloomWaterRatio !== null &&
    values.doseG !== null &&
    values.bloomWaterG != null &&
    values.doseG > 0
  ) {
    const bloomRatio = values.bloomWaterG / values.doseG;
    if (violates(bloomRatio, healthy.bloomWaterRatio)) {
      violations.push({
        knob: 'bloom_water_g',
        observed: values.bloomWaterG,
        min:
          healthy.bloomWaterRatio.min === null
            ? null
            : healthy.bloomWaterRatio.min * values.doseG,
        max:
          healthy.bloomWaterRatio.max === null
            ? null
            : healthy.bloomWaterRatio.max * values.doseG,
        reason: `The bloom is usually ${rangeLabel(healthy.bloomWaterRatio, '× the dose')}.`,
      });
    }
  }

  return violations;
}

function violatesRangeOptional(value: number | null | undefined, range: HealthyRange): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  return violates(value, range);
}

export function missingRequiredStepKinds(
  methodId: BrewMethodId,
  stepKinds: readonly (StepKind | null)[]
): StepKind[] {
  const present = new Set(stepKinds.filter((kind): kind is StepKind => kind !== null));
  return getMethodGuide(methodId).requiredStepKinds.filter((kind) => !present.has(kind));
}

export function isWaterTargetMonotonic(targets: readonly (number | null)[]): boolean {
  let previous = -Infinity;
  for (const target of targets) {
    if (target === null) {
      continue;
    }
    if (target < previous) {
      return false;
    }
    previous = target;
  }
  return true;
}

export function pourWaterDeltas(targets: readonly (number | null)[]): (number | null)[] {
  const deltas: (number | null)[] = [];
  let previous = 0;
  for (const target of targets) {
    if (target === null) {
      deltas.push(null);
      continue;
    }
    deltas.push(target - previous);
    previous = target;
  }
  return deltas;
}
