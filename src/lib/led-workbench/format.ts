// Locale-aware readouts: three significant figures and a non-breaking space before every unit.
const NBSP = '\u00a0';

// Fraction labels for the catalogue power ratings (data.ts resistorRatings).
const ratingLabels: Record<number, string> = { 0.125: '⅛', 0.25: '¼', 0.5: '½', 1: '1', 2: '2' };

export type Formatter = ReturnType<typeof createFormatter>;

export function createFormatter(language: string) {
  const sig3 = new Intl.NumberFormat(language, { maximumSignificantDigits: 3 });
  const plain = new Intl.NumberFormat(language, { maximumSignificantDigits: 6 });
  const percent = new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 });
  const unit = (text: string, symbol: string) => `${text}${NBSP}${symbol}`;

  return {
    /** A value with its unit, 3 significant figures. */
    quantity: (value: number, symbol: string) => unit(sig3.format(value), symbol),
    /** An input or catalogue value shown as typed (up to 6 significant figures). */
    exact: (value: number, symbol: string) => unit(plain.format(value), symbol),
    count: (value: number) => plain.format(value),
    percent: (fraction: number) => percent.format(fraction),
    volts: (value: number) => unit(sig3.format(value), 'V'),
    amps: (value: number) => (Math.abs(value) < 1 ? unit(sig3.format(value * 1000), 'mA') : unit(sig3.format(value), 'A')),
    watts: (value: number) => (Math.abs(value) < 1 ? unit(sig3.format(value * 1000), 'mW') : unit(sig3.format(value), 'W')),
    ohms: (value: number) => (value >= 1000 ? unit(sig3.format(value / 1000), 'kΩ') : unit(sig3.format(value), 'Ω')),
    /** A catalogue resistor value, never rounded (E24 values have two digits but may be 9 100 Ω). */
    resistor: (value: number) => (value >= 1000 ? unit(plain.format(value / 1000), 'kΩ') : unit(plain.format(value), 'Ω')),
    rating: (value: number) => unit(ratingLabels[value] ?? plain.format(value), 'W'),
  };
}
