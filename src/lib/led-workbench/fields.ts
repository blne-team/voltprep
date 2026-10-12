import { batteryPresets, ledPresets } from './data.ts';
import type { Range } from './parse.ts';

// Form fields of each scenario: the unit shown, the accepted range and the server-rendered default.
// `scale` is displayed units per SI unit the solvers take (1000 for mA → A and mΩ → Ω).
// Preset-bound fields start from the first preset in data.ts, so a datasheet value lives in one place.
export interface FieldSpec extends Range {
  unit: string;
  step: string;
  value: number | null; // null renders an empty optional field
  scale: number;
  optional?: true;
}

const MILLI = 1000;
const field = (unit: string, min: number, max: number, value: number | null, step = 'any', scale = 1): FieldSpec => ({ unit, min, max, value, step, scale });

const [led] = ledPresets;
const [battery] = batteryPresets;

export const ledFields = {
  supplyVoltage: field('V', 1.5, 48, 5),
  forwardVoltageTyp: field('V', 1, 4, led.forwardVoltageTyp),
  forwardVoltageMax: field('V', 1, 4.5, led.forwardVoltageMax),
  current: field('mA', 1, 100, led.testCurrent * MILLI, 'any', MILLI),
  ratedCurrent: field('mA', 1, 100, led.ratedCurrent * MILLI, 'any', MILLI),
  count: field('', 1, 10, 1, '1'),
} satisfies Record<string, FieldSpec>;

export const wireFields = {
  supplyVoltage: field('V', 5, 48, 12),
  length: field('m', 0.1, 500, 10),
  area: field('mm²', 0.1, 300, 2.5),
  current: field('A', 0.01, 200, 10),
  temperature: field('°C', -20, 100, 20),
} satisfies Record<string, FieldSpec>;

export const batteryFields = {
  emf: field('V', 0.5, 60, battery.emf),
  internalResistance: field('mΩ', 1, 100000, battery.internalResistance * MILLI, 'any', MILLI),
  loadResistance: field('Ω', 0.01, 100000, 1),
  cutoffVoltage: { ...field('V', 0, 60, null), optional: true },
} satisfies Record<string, FieldSpec>;

export type LedFieldName = keyof typeof ledFields;
export type WireFieldName = keyof typeof wireFields;
export type BatteryFieldName = keyof typeof batteryFields;
