import { rulesOfThumb } from './data.ts';

export interface BatteryInput {
  emf: number; // V
  internalResistance: number; // Ω
  loadResistance: number; // Ω
  cutoffVoltage: number | null; // V, the device's minimum supply; null when not given
}

export type BatteryFlag = 'brownout' | 'high-internal-loss';

export interface BatteryResult {
  current: number;
  terminalVoltage: number;
  sag: number; // I · r
  loadPower: number;
  internalPower: number;
  lostFraction: number; // share of the battery's power turned to heat inside it
  flags: BatteryFlag[];
}

/** Thevenin source: I = E / (r + R_L), V = E − I·r. */
export function solveBattery(input: BatteryInput): BatteryResult {
  const current = input.emf / (input.internalResistance + input.loadResistance);
  const sag = current * input.internalResistance;
  const terminalVoltage = input.emf - sag;
  const lostFraction = input.internalResistance / (input.internalResistance + input.loadResistance);

  const flags: BatteryFlag[] = [];
  if (input.cutoffVoltage !== null && terminalVoltage < input.cutoffVoltage) flags.push('brownout');
  if (lostFraction > rulesOfThumb.lossFraction) flags.push('high-internal-loss');

  return {
    current,
    terminalVoltage,
    sag,
    loadPower: current ** 2 * input.loadResistance,
    internalPower: current ** 2 * input.internalResistance,
    lostFraction,
    flags,
  };
}
