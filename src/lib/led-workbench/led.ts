import { resistorRatings, rulesOfThumb } from './data.ts';
import { nextStandardValue, type SeriesName } from './e-series.ts';

export interface LedInput {
  supplyVoltage: number; // V
  forwardVoltageTyp: number; // V
  forwardVoltageMax: number; // V
  current: number; // A, target forward current
  ratedCurrent: number; // A, datasheet maximum DC forward current
  count: number; // LEDs in series
  series: SeriesName;
}

export type LedFlag = 'over-rated-current' | 'little-headroom' | 'warm-resistor' | 'hot-resistor';

export type LedResult =
  | { status: 'no-headroom'; headroom: number; stringVoltage: number }
  | {
      status: 'ok';
      headroom: number; // V across the resistor at typical Vf
      stringVoltage: number; // n · Vf typ
      exactResistance: number;
      resistance: number; // chosen catalogue value
      currentTyp: number;
      currentAtMaxVf: number;
      resistorPower: number;
      rating: number | null; // smallest catalogue rating ≥ margin × power; null when beyond the range
      ledPower: number;
      flags: LedFlag[];
    };

export function solveLed(input: LedInput): LedResult {
  const stringVoltage = input.count * input.forwardVoltageTyp;
  const headroom = input.supplyVoltage - stringVoltage;
  if (headroom <= 0) return { status: 'no-headroom', headroom, stringVoltage };

  const exactResistance = headroom / input.current;
  const resistance = nextStandardValue(exactResistance, input.series);
  const currentTyp = headroom / resistance;
  const currentAtMaxVf = Math.max(0, (input.supplyVoltage - input.count * input.forwardVoltageMax) / resistance);
  const resistorPower = headroom * currentTyp;
  const needed = rulesOfThumb.ratingMargin * resistorPower;
  const rating = resistorRatings.values.find((value) => value >= needed) ?? null;

  const flags: LedFlag[] = [];
  if (input.current > input.ratedCurrent) flags.push('over-rated-current');
  if (currentAtMaxVf < rulesOfThumb.headroomRatio * currentTyp) flags.push('little-headroom');
  if (rating === null) flags.push('hot-resistor');
  else if (rating > resistorRatings.values[1]) flags.push('warm-resistor');

  return {
    status: 'ok',
    headroom,
    stringVoltage,
    exactResistance,
    resistance,
    currentTyp,
    currentAtMaxVf,
    resistorPower,
    rating,
    ledPower: stringVoltage * currentTyp,
    flags,
  };
}
