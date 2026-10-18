import type { SourceId } from './sources.ts';

// Presets and catalogue data. Each entry names the document it was read from (see sources.ts).

export interface LedPreset {
  id: string;
  part: string;
  forwardVoltageTyp: number; // V
  forwardVoltageMax: number; // V
  testCurrent: number; // A, the current the Vf figures are specified at
  ratedCurrent: number; // A, absolute maximum DC forward current
  source: SourceId;
}

export const ledPresets: LedPreset[] = [
  { id: 'red', part: 'Kingbright WP7113SRD/D', forwardVoltageTyp: 1.85, forwardVoltageMax: 2.5, testCurrent: 0.02, ratedCurrent: 0.03, source: 'kingbrightRed' },
  { id: 'yellow', part: 'Kingbright WP7113YD', forwardVoltageTyp: 1.95, forwardVoltageMax: 2.4, testCurrent: 0.01, ratedCurrent: 0.03, source: 'kingbrightYellow' },
  { id: 'blue', part: 'Kingbright WP7113QBC/D', forwardVoltageTyp: 3.3, forwardVoltageMax: 4.0, testCurrent: 0.02, ratedCurrent: 0.03, source: 'kingbrightBlue' },
  { id: 'white', part: 'Kingbright WP7113QWC/D', forwardVoltageTyp: 3.3, forwardVoltageMax: 4.0, testCurrent: 0.02, ratedCurrent: 0.03, source: 'kingbrightWhite' },
];

/** Power ratings (W at 70 °C) of the Lumimax CF carbon-film range: CF-1/8W, 1/4W, 1/2W, 1W, 2W. */
export const resistorRatings = { values: [0.125, 0.25, 0.5, 1, 2], source: 'lumimaxCf' as SourceId };

/** Annealed copper at 20 °C. */
export const copper = { resistivity: 1 / 58, temperatureCoefficient: 0.00393, referenceTemperature: 20, source: 'nbsCopper' as SourceId };

export interface BatteryPreset {
  id: string;
  part: string;
  emf: number; // V (nominal voltage used as the open-circuit EMF)
  internalResistance: number; // Ω
  source: SourceId;
}

export const batteryPresets: BatteryPreset[] = [
  { id: 'aa-fresh-low', part: 'Energizer EN91 (AA alkaline), fresh', emf: 1.5, internalResistance: 0.15, source: 'energizerEn91' },
  { id: 'aa-fresh-high', part: 'Energizer EN91 (AA alkaline), fresh', emf: 1.5, internalResistance: 0.3, source: 'energizerEn91' },
];

/**
 * Fieldbook's own rules of thumb (original, not from a standard). The page states them as such.
 * ratingMargin: pick a resistor rated for at least this multiple of the power it dissipates.
 * headroomRatio: flag when the current at max Vf falls below this fraction of the typical current.
 * lossFraction: flag when more than this fraction of the supply's voltage (wire) or power (battery) is lost.
 */
export const rulesOfThumb = { ratingMargin: 2, headroomRatio: 0.75, lossFraction: 0.1 };
