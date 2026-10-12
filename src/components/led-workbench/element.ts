// Browser side of the workbench: tabs, presets, and live recalculation through the same views the server used.
import { localeKeys, pick } from '../../config/locales';
import { createFormatter, type Formatter } from '../../lib/led-workbench/format';
import { batteryFields, ledFields, wireFields, type FieldSpec } from '../../lib/led-workbench/fields';
import { batteryPresets, ledPresets } from '../../lib/led-workbench/data';
import { sources } from '../../lib/led-workbench/sources';
import { eSeries, type SeriesName } from '../../lib/led-workbench/e-series';
import { solveLed } from '../../lib/led-workbench/led';
import { solveWire } from '../../lib/led-workbench/wire';
import { solveBattery } from '../../lib/led-workbench/battery';
import { commonCopy, type CommonCopy } from './copy/common';
import { ledCopy } from './copy/led';
import { wireCopy } from './copy/wire';
import { batteryCopy } from './copy/battery';
import { batteryView, ledView, unavailableView, wireView, type ScenarioView } from './views';
import { readBattery, readLed, readWire, viewFor, type FieldProblem, type Read } from './scenarios';

type Scenario = 'led' | 'wire' | 'battery';

// Preset id → the field values it sets, in SI units, plus its source.
const presets = {
  led: new Map(ledPresets.map((p) => [p.id, { source: p.source, values: { forwardVoltageTyp: p.forwardVoltageTyp, forwardVoltageMax: p.forwardVoltageMax, current: p.testCurrent, ratedCurrent: p.ratedCurrent } }])),
  battery: new Map(batteryPresets.map((p) => [p.id, { source: p.source, values: { emf: p.emf, internalResistance: p.internalResistance } }])),
};
const fieldSpecs: Record<Scenario, Record<string, FieldSpec>> = { led: ledFields, wire: wireFields, battery: batteryFields };

class LedWorkbench extends HTMLElement {
  connectedCallback(): void {
    if (this.dataset.ready === 'true') return;
    this.dataset.ready = 'true';
    const locale = localeKeys.find((key) => key === this.dataset.copyLocale);
    const language = this.dataset.language;
    if (!locale || !language) throw new Error('led-workbench needs data-copy-locale and data-language');

    const f = createFormatter(language);
    const common = pick(commonCopy, locale);
    const copies = { led: pick(ledCopy, locale), wire: pick(wireCopy, locale), battery: pick(batteryCopy, locale) };
    const solvers: Record<Scenario, (form: HTMLFormElement) => Read<ScenarioView>> = {
      led: (form) => {
        const series = eSeriesName(field(form, 'series'));
        return mapRead(readLed((name) => field(form, name), series), (input) => ledView(input, solveLed(input), copies.led, f));
      },
      wire: (form) => mapRead(readWire((name) => field(form, name)), (input) => wireView(input, solveWire(input), copies.wire, f)),
      battery: (form) => mapRead(readBattery((name) => field(form, name)), (input) => batteryView(input, solveBattery(input), copies.battery, f)),
    };

    for (const panel of this.querySelectorAll<HTMLElement>('[data-scenario]')) {
      const scenario = panel.dataset.scenario as Scenario;
      const form = panel.querySelector<HTMLFormElement>('form');
      if (!form) throw new Error(`Scenario ${scenario} has no form`);
      const readoutKeys = Object.keys(copies[scenario].readout);
      const sketchKeys = [...panel.querySelectorAll<SVGTextElement>('[data-sketch]')].map((text) => text.dataset.sketch ?? '');
      const update = () => {
        let message = '';
        const { view, problem } = viewFor(
          solvers[scenario](form),
          (solved) => solved,
          (found) => {
            message = problemMessage(form, found, fieldSpecs[scenario], common, f, copies.led.maxBelowTyp);
            return unavailableView(readoutKeys, sketchKeys, message);
          },
        );
        markProblem(form, problem, message);
        render(panel, view);
      };
      form.addEventListener('submit', (event) => event.preventDefault());
      form.addEventListener('input', (event) => {
        const target = event.target;
        if (target instanceof HTMLSelectElement && target.matches('[data-preset]')) applyPreset(form, scenario, target.value);
        else if (target instanceof HTMLInputElement && target.matches('[data-preset-bound]')) setCustom(form);
        update();
      });
      // Static values were the no-JS fallback; the live form replaces them.
      panel.querySelector<HTMLElement>('[data-static]')?.setAttribute('hidden', '');
      form.hidden = false;
    }
    this.setupTabs();
  }

  private setupTabs(): void {
    const tablist = this.querySelector<HTMLElement>('[data-tabs]');
    if (!tablist) return;
    const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[data-tab]')];
    const select = (chosen: HTMLButtonElement, focus: boolean) => {
      for (const tab of tabs) {
        const active = tab === chosen;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = this.querySelector<HTMLElement>(`[data-scenario="${tab.dataset.tab}"]`);
        if (panel) panel.hidden = !active;
      }
      if (focus) chosen.focus();
    };
    tablist.addEventListener('click', (event) => {
      const tab = (event.target as Element).closest<HTMLButtonElement>('[data-tab]');
      if (tab) select(tab, false);
    });
    tablist.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      const current = tabs.findIndex((tab) => tab.tabIndex === 0);
      select(tabs[(current + step + tabs.length) % tabs.length], true);
      event.preventDefault();
    });
    tablist.hidden = false;
    select(tabs[0], false);
  }
}

const field = (form: HTMLFormElement, name: string) => String(new FormData(form).get(name) ?? '');

function eSeriesName(value: string): SeriesName {
  if (!(value in eSeries)) throw new Error(`Unknown resistor series ${value}`);
  return value as SeriesName;
}

function mapRead<T, U>(read: Read<T>, map: (input: T) => U): Read<U> {
  return read.ok ? { ok: true, input: map(read.input) } : read;
}

function applyPreset(form: HTMLFormElement, scenario: Scenario, id: string): void {
  const source = form.querySelector<HTMLElement>('[data-source]');
  const preset = scenario === 'led' || scenario === 'battery' ? presets[scenario].get(id) : undefined;
  if (source) source.hidden = !preset;
  if (!preset) return;
  for (const [name, si] of Object.entries(preset.values)) {
    const input = form.elements.namedItem(name) as HTMLInputElement;
    input.value = String(si * fieldSpecs[scenario][name].scale);
  }
  const link = form.querySelector<HTMLAnchorElement>('[data-source-link]');
  if (link) {
    link.href = sources[preset.source].url;
    link.textContent = sources[preset.source].title;
  }
}

function setCustom(form: HTMLFormElement): void {
  const select = form.querySelector<HTMLSelectElement>('[data-preset]');
  if (!select || select.value === 'custom') return;
  select.value = 'custom';
  const source = form.querySelector<HTMLElement>('[data-source]');
  if (source) source.hidden = true;
}

function problemMessage(form: HTMLFormElement, problem: FieldProblem, specs: Record<string, FieldSpec>, common: CommonCopy, f: Formatter, maxBelowTyp: string): string {
  const input = form.elements.namedItem(problem.field) as HTMLInputElement;
  const label = input.dataset.label ?? problem.field;
  const spec = specs[problem.field];
  return problem.reason === 'max-below-typ' ? maxBelowTyp
    : problem.reason === 'empty' ? common.invalid.empty(label)
    : problem.reason === 'not-a-number' ? common.invalid.notNumber(label)
    : common.invalid.range(label, f.exact(spec.min, spec.unit), f.exact(spec.max, spec.unit));
}

function markProblem(form: HTMLFormElement, problem: FieldProblem | null, message: string): void {
  for (const input of form.querySelectorAll('input')) input.removeAttribute('aria-invalid');
  if (problem) (form.elements.namedItem(problem.field) as HTMLInputElement).setAttribute('aria-invalid', 'true');
  const error = form.querySelector<HTMLElement>('[data-error]');
  if (!error) return;
  error.hidden = problem === null;
  error.textContent = message;
}

function render(panel: HTMLElement, view: ScenarioView): void {
  for (const out of panel.querySelectorAll<HTMLElement>('[data-out]')) out.textContent = view.readout[out.dataset.out ?? ''];
  for (const text of panel.querySelectorAll<SVGTextElement>('[data-sketch]')) text.textContent = view.sketch[text.dataset.sketch ?? ''];
  panel.querySelector('[data-sketch-svg]')?.setAttribute('aria-label', view.sketchLabel);
  const words = panel.querySelector('[data-view="words"]');
  if (words) words.textContent = view.words;
  const meter = panel.querySelector('[data-view="meter"]');
  if (meter) meter.textContent = view.meter;

  const flags = panel.querySelector<HTMLElement>('[data-flags]');
  if (flags) {
    const items = view.flags.length ? view.flags.map((text) => item(text)) : [item(flags.dataset.allClear ?? '', 'clear')];
    flags.replaceChildren(...items);
  }
  panel.querySelector('[data-steps]')?.replaceChildren(
    ...view.steps.map((step) => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = step.label;
      const maths = document.createElement('code');
      maths.textContent = step.maths;
      li.append(label, maths);
      return li;
    }),
  );
}

function item(text: string, className?: string): HTMLLIElement {
  const li = document.createElement('li');
  li.textContent = text;
  if (className) li.className = className;
  return li;
}

if (!customElements.get('led-workbench')) customElements.define('led-workbench', LedWorkbench);
