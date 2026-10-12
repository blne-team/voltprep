// E12/E24 preferred values per decade, IEC 60063:2015 Table 1 (sources.iec60063, sources.vishayESeries).
export const eSeries = {
  E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
  E24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
} as const;

export type SeriesName = keyof typeof eSeries;

// Values are compared on the two-digit mantissa scale, so 157.5 Ω and 0.47 Ω round-trip without float drift.
const SCALE_TOLERANCE = 1e-9;

/** Smallest catalogue value in the series that is at or above `resistance` (Ω). */
export function nextStandardValue(resistance: number, series: SeriesName): number {
  if (!(resistance > 0) || !Number.isFinite(resistance)) throw new RangeError(`Resistance must be positive, got ${resistance}`);
  const exponent = Math.floor(Math.log10(resistance)) - 1;
  const mantissa = resistance / 10 ** exponent;
  const match = eSeries[series].find((value) => value >= mantissa * (1 - SCALE_TOLERANCE));
  return match === undefined ? toDecade(10, exponent + 1) : toDecade(match, exponent);
}

// 10^exponent as an exact decimal for negative exponents (0.47, not 0.47000000000000003).
const toDecade = (mantissa: number, exponent: number) =>
  exponent >= 0 ? mantissa * 10 ** exponent : mantissa / 10 ** -exponent;
