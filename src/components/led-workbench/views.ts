// Turns a solver result into the text of the four views (words, sketch, maths, meter) plus the readout and flags.
// The server renders the default state with these and the browser script refreshes them, so both stay identical.
import type { Formatter } from '../../lib/led-workbench/format.ts';
import { copper } from '../../lib/led-workbench/data.ts';
import type { LedInput, LedResult } from '../../lib/led-workbench/led.ts';
import type { WireInput, WireResult } from '../../lib/led-workbench/wire.ts';
import type { BatteryInput, BatteryResult } from '../../lib/led-workbench/battery.ts';
import type { LedCopy } from './copy/led.ts';
import type { WireCopy } from './copy/wire.ts';
import type { BatteryCopy } from './copy/battery.ts';

export interface Step {
  label: string;
  maths: string;
}

export interface ScenarioView {
  readout: Record<string, string>;
  flags: string[];
  words: string;
  steps: Step[];
  meter: string;
  sketch: Record<string, string>;
  sketchLabel: string;
}

const DASH = '—';

export function ledView(input: LedInput, result: LedResult, copy: LedCopy, f: Formatter): ScenarioView {
  const supply = f.volts(input.supplyVoltage);
  const string = f.volts(result.stringVoltage);
  const leds = copy.leds(input.count);
  const vfSketch = `${f.count(input.count)} × ${f.volts(input.forwardVoltageTyp)}`;

  if (result.status === 'no-headroom') {
    return {
      readout: Object.fromEntries(Object.keys(copy.readout).map((key) => [key, DASH])),
      flags: [copy.flags.noHeadroom(string, supply)],
      words: copy.wordsNoHeadroom({ supply, leds, string }),
      steps: [{ label: copy.steps.headroom, maths: `${supply} − ${vfSketch} = ${f.volts(result.headroom)}` }],
      meter: copy.meterNoHeadroom,
      sketch: { supply, resistance: 'R = ?', current: 'I ≈ 0', vf: vfSketch },
      sketchLabel: copy.sketchLabel(supply, '?', f.amps(0), string),
    };
  }

  const headroom = f.volts(result.headroom);
  const resistance = f.resistor(result.resistance);
  const actual = f.amps(result.currentTyp);
  const rating = result.rating === null ? copy.noRating : f.rating(result.rating);
  const flags: string[] = [];
  for (const flag of result.flags) {
    if (flag === 'over-rated-current') flags.push(copy.flags.overRated(f.amps(input.current), f.amps(input.ratedCurrent)));
    if (flag === 'little-headroom') flags.push(copy.flags.littleHeadroom(f.amps(result.currentAtMaxVf), actual));
    if (flag === 'warm-resistor') flags.push(copy.flags.warm(rating));
    if (flag === 'hot-resistor') flags.push(copy.flags.hot(f.watts(result.resistorPower)));
  }

  return {
    readout: {
      resistance,
      exactResistance: f.exact(result.exactResistance, 'Ω'),
      currentTyp: actual,
      currentAtMaxVf: f.amps(result.currentAtMaxVf),
      resistorPower: f.watts(result.resistorPower),
      rating,
      ledPower: f.watts(result.ledPower),
    },
    flags,
    words: copy.words({ supply, leds, ledsTake: copy.ledsTake(input.count, string), string, headroom, exact: f.exact(result.exactResistance, 'Ω'), current: f.amps(input.current), series: input.series, resistance, actual }),
    steps: [
      { label: copy.steps.headroom, maths: `V_R = Vs − n·Vf = ${supply} − ${vfSketch} = ${headroom}` },
      { label: copy.steps.resistance, maths: `R = V_R / I = ${headroom} / ${f.amps(input.current)} = ${f.exact(result.exactResistance, 'Ω')} → ${resistance} (${input.series})` },
      { label: copy.steps.actual, maths: `I = V_R / R = ${headroom} / ${resistance} = ${actual}` },
      { label: copy.steps.atMax, maths: `I = (${supply} − ${f.count(input.count)} × ${f.volts(input.forwardVoltageMax)}) / ${resistance} = ${f.amps(result.currentAtMaxVf)}` },
      { label: copy.steps.power, maths: `P = V_R × I = ${headroom} × ${actual} = ${f.watts(result.resistorPower)}; 2 × P = ${f.watts(2 * result.resistorPower)} → ${rating}` },
    ],
    meter: copy.meter(headroom, resistance, actual),
    sketch: { supply, resistance: `R = ${resistance}`, current: `I = ${actual}`, vf: vfSketch },
    sketchLabel: copy.sketchLabel(supply, resistance, actual, string),
  };
}

export function wireView(input: WireInput, result: WireResult, copy: WireCopy, f: Formatter): ScenarioView {
  const supply = f.volts(input.supplyVoltage);
  const current = f.amps(input.current);
  const drop = f.volts(result.drop);
  const conductor = f.quantity(2 * input.length, 'm');
  const resistivity = copper.resistivity * (1 + copper.temperatureCoefficient * (input.temperature - copper.referenceTemperature));
  const rhoStep = {
    label: copy.steps.resistivity,
    maths: `ρ = ${f.exact(copper.resistivity, 'Ω·mm²/m')} × (1 + ${f.count(copper.temperatureCoefficient)} × (${f.exact(input.temperature, '°C')} − ${f.exact(copper.referenceTemperature, '°C')})) = ${f.quantity(resistivity, 'Ω·mm²/m')}`,
  };
  const resistanceStep = {
    label: copy.steps.resistance,
    maths: `R = ρ × 2L / A = ${f.quantity(resistivity, 'Ω·mm²/m')} × ${conductor} / ${f.exact(input.area, 'mm²')} = ${f.ohms(result.resistance)}`,
  };
  const dropStep = { label: copy.steps.drop, maths: `V = I × R = ${current} × ${f.ohms(result.resistance)} = ${drop}` };

  if (result.status === 'exceeds-supply') {
    return {
      readout: { resistance: f.ohms(result.resistance), drop, dropFraction: DASH, heat: DASH, loadVoltage: DASH },
      flags: [copy.flags.exceedsSupply(current, drop, supply)],
      words: copy.flags.exceedsSupply(current, drop, supply),
      steps: [rhoStep, resistanceStep, dropStep],
      meter: copy.meterExceeds,
      sketch: { supply, current: `I = ${current}`, drop: `${drop}`, load: '≈ 0 V' },
      sketchLabel: copy.sketchLabel(supply, drop, '≈ 0 V', current),
    };
  }

  const heat = f.watts(result.heat);
  const load = f.volts(result.loadVoltage);
  const flags = [copy.flags.heat(heat, conductor)];
  if (result.flags.includes('high-loss')) flags.unshift(copy.flags.highLoss(f.percent(result.dropFraction)));
  return {
    readout: { resistance: f.ohms(result.resistance), drop, dropFraction: f.percent(result.dropFraction), heat, loadVoltage: load },
    flags,
    words: copy.words({ current, conductor, resistance: f.ohms(result.resistance), drop, supply, load, heat }),
    steps: [
      rhoStep,
      resistanceStep,
      dropStep,
      { label: copy.steps.heat, maths: `P = I² × R = (${current})² × ${f.ohms(result.resistance)} = ${heat}` },
      { label: copy.steps.load, maths: `${supply} − ${drop} = ${load}` },
    ],
    meter: copy.meter(drop),
    sketch: { supply, current: `I = ${current}`, drop: `−${drop}`, load },
    sketchLabel: copy.sketchLabel(supply, drop, load, current),
  };
}

export function batteryView(input: BatteryInput, result: BatteryResult, copy: BatteryCopy, f: Formatter): ScenarioView {
  const emf = f.volts(input.emf);
  const internal = f.ohms(input.internalResistance);
  const load = f.ohms(input.loadResistance);
  const current = f.amps(result.current);
  const terminal = f.volts(result.terminalVoltage);
  const sag = f.volts(result.sag);
  const flags: string[] = [];
  if (result.flags.includes('brownout') && input.cutoffVoltage !== null) flags.push(copy.flags.brownout(terminal, f.volts(input.cutoffVoltage)));
  if (result.flags.includes('high-internal-loss')) flags.push(copy.flags.highLoss(f.percent(result.lostFraction)));

  return {
    readout: {
      terminalVoltage: terminal,
      current,
      sag,
      loadPower: f.watts(result.loadPower),
      internalPower: f.watts(result.internalPower),
      lostFraction: f.percent(result.lostFraction),
    },
    flags,
    words: copy.words({ emf, current, internal, sag, terminal, load: f.watts(result.loadPower) }),
    steps: [
      { label: copy.steps.current, maths: `I = E / (r + R_L) = ${emf} / (${internal} + ${load}) = ${current}` },
      { label: copy.steps.sag, maths: `I × r = ${current} × ${internal} = ${sag}` },
      { label: copy.steps.terminal, maths: `V = E − I·r = ${emf} − ${sag} = ${terminal}` },
      { label: copy.steps.power, maths: `I² × R_L = ${f.watts(result.loadPower)}; I² × r = ${f.watts(result.internalPower)}` },
    ],
    meter: copy.meter(emf, terminal, current),
    sketch: { emf: `E = ${emf}`, internal: `r = ${internal}`, load: `R_L = ${load}`, terminal: `V = ${terminal}`, current: `I = ${current}` },
    sketchLabel: copy.sketchLabel(emf, internal, load, terminal, current),
  };
}
