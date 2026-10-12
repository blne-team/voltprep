// Reads each scenario's form values into solver input, and holds the server-side defaults.
// Boundary parsing lives here: every field is checked against its range in fields.ts.
import { batteryFields, ledFields, wireFields, type FieldSpec } from '../../lib/led-workbench/fields.ts';
import { parseQuantity } from '../../lib/led-workbench/parse.ts';
import type { SeriesName } from '../../lib/led-workbench/e-series.ts';
import type { LedInput } from '../../lib/led-workbench/led.ts';
import type { WireInput } from '../../lib/led-workbench/wire.ts';
import type { BatteryInput } from '../../lib/led-workbench/battery.ts';

export type FieldProblem = { field: string; reason: 'empty' | 'not-a-number' | 'out-of-range' | 'max-below-typ' };
export type Read<T> = { ok: true; input: T } | { ok: false; problem: FieldProblem };

type Values<S extends Record<string, FieldSpec>> = { [K in keyof S]: S[K] extends { optional: true } ? number | null : number };

function readFields<S extends Record<string, FieldSpec>>(specs: S, raw: (name: string) => string): Read<Values<S>> {
  const values: Record<string, number | null> = {};
  for (const [name, spec] of Object.entries(specs)) {
    const text = raw(name);
    if (spec.optional && text.trim() === '') {
      values[name] = null;
      continue;
    }
    const parsed = parseQuantity(text, spec);
    if (!parsed.ok) return { ok: false, problem: { field: name, reason: parsed.reason } };
    values[name] = parsed.value / spec.scale;
  }
  return { ok: true, input: values as Values<S> };
}

export function readLed(raw: (name: string) => string, series: SeriesName): Read<LedInput> {
  const read = readFields(ledFields, raw);
  if (!read.ok) return read;
  if (read.input.forwardVoltageMax < read.input.forwardVoltageTyp) return { ok: false, problem: { field: 'forwardVoltageMax', reason: 'max-below-typ' } };
  return { ok: true, input: { ...read.input, series } };
}

export const readWire = (raw: (name: string) => string): Read<WireInput> => readFields(wireFields, raw);
export const readBattery = (raw: (name: string) => string): Read<BatteryInput> => readFields(batteryFields, raw);

/** The single state path: a valid read is solved into its view; an invalid one gets the unavailable view. */
export function viewFor<T, V>(read: Read<T>, solve: (input: T) => V, unavailable: (problem: FieldProblem) => V): { view: V; problem: FieldProblem | null } {
  return read.ok ? { view: solve(read.input), problem: null } : { view: unavailable(read.problem), problem: read.problem };
}

/** The value a field is rendered with, as text (empty for an optional field without a default). */
export const defaultText = (spec: FieldSpec) => (spec.value === null ? '' : String(spec.value));
export const defaults = (specs: Record<string, FieldSpec>) => (name: string) => defaultText(specs[name]);
