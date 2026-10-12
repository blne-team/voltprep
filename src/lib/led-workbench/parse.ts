export interface Range {
  min: number;
  max: number;
}

export type Parsed = { ok: true; value: number } | { ok: false; reason: 'empty' | 'not-a-number' | 'out-of-range' };

/** Reads one form field: a finite decimal inside [min, max]. */
export function parseQuantity(raw: string, range: Range): Parsed {
  const text = raw.trim();
  if (text === '') return { ok: false, reason: 'empty' };
  const value = Number(text);
  if (!Number.isFinite(value)) return { ok: false, reason: 'not-a-number' };
  if (value < range.min || value > range.max) return { ok: false, reason: 'out-of-range' };
  return { ok: true, value };
}
