import { copper, rulesOfThumb } from './data.ts';

export interface WireInput {
  supplyVoltage: number; // V
  length: number; // m, one way
  area: number; // mm²
  current: number; // A
  temperature: number; // °C
}

export type WireFlag = 'high-loss';

export type WireResult =
  | { status: 'exceeds-supply'; resistance: number; drop: number }
  | { status: 'ok'; resistance: number; drop: number; dropFraction: number; heat: number; loadVoltage: number; flags: WireFlag[] };

/** Copper round trip: R = ρ(T) · 2L / A, with ρ(T) = ρ20 · (1 + α20 (T − 20 °C)). */
export function solveWire(input: WireInput): WireResult {
  const resistivity = copper.resistivity * (1 + copper.temperatureCoefficient * (input.temperature - copper.referenceTemperature));
  const resistance = (resistivity * 2 * input.length) / input.area;
  const drop = input.current * resistance;
  if (drop >= input.supplyVoltage) return { status: 'exceeds-supply', resistance, drop };

  const dropFraction = drop / input.supplyVoltage;
  return {
    status: 'ok',
    resistance,
    drop,
    dropFraction,
    heat: input.current ** 2 * resistance,
    loadVoltage: input.supplyVoltage - drop,
    flags: dropFraction > rulesOfThumb.lossFraction ? ['high-loss'] : [],
  };
}
