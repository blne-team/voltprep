// Site settings and text are edited in site.json, menus in menus.json, topics and tags in taxonomy.json.
// This file loads and checks them; the build stops with a readable message if something is missing.
import data from './site.json';
import schema from './site.schema.json';
import { menus } from './menus';
import { defaultLocale, getSiteLocale, localeKeys, locales, type SiteLocale } from './locales';

export { isNavGroup, type NavGroup, type NavItem, type NavLink } from './menus';
export { getContentLocale, getSiteLocale, localeKeys, localePrefix, pick, type SiteLocale } from './locales';


// The homepage notebook drawing's text stays in code: it describes the fixed drawing in NotePlate.astro.
const plates: Record<SiteLocale, { label: string; notes: string[] }> = {
  root: {
    label:
      'Drawing of a spiral notebook page in pencil. On the left, a schematic of a 9 volt battery, a 330 ohm resistor, an LED and an ammeter in series; on the right, the worked current: (9 − 2) volts across 330 ohms gives about 21.2 milliamperes, assuming a 2 volt LED drop, ticked as checked.',
    notes: ['I = (V − Vf) / R', '= (9 − 2) V / 330 Ω', '≈ 21.2 mA'],
  },
  fr: {
    label:
      'Dessin d’une page de carnet à spirale, au crayon. À gauche, le schéma d’une pile de 9 volts, d’une résistance de 330 ohms, d’une DEL et d’un ampèremètre en série; à droite, le courant calculé : (9 − 2) volts aux bornes de 330 ohms donnent environ 21,2 milliampères, en supposant une chute de 2 volts dans la DEL, coché comme vérifié.',
    notes: ['I = (V − Vf) / R', '= (9 − 2) V / 330 Ω', '≈ 21,2 mA'],
  },
  zh: {
    label:
      '铅笔绘制的螺旋笔记本页面。左侧是 9 伏电池、330 欧电阻、LED 和电流表串联的电路图；右侧是算出的电流：(9 − 2) 伏加在 330 欧上，约为 21.2 毫安，假设 LED 压降为 2 伏，并已打勾核对。',
    notes: ['I = (V − Vf) / R', '= (9 − 2) V / 330 Ω', '≈ 21.2 mA'],
  },
};

// Check site.json against site.schema.json (the subset the schema uses: objects, lists, text, $ref).
type Schema = { type?: string; required?: string[]; properties?: Record<string, Schema>; items?: Schema; minItems?: number; $ref?: string };
function check(value: unknown, rule: Schema, where: string): void {
  const fail = (message: string): never => { throw new Error(`src/config/site.json → ${where || '(top)'}: ${message}`); };
  if (rule.$ref) return check(value, (schema.$defs as Record<string, Schema>)[rule.$ref.replace('#/$defs/', '')]!, where);
  if (rule.type === 'string' && (typeof value !== 'string' || !value.trim())) fail('expected some text');
  if (rule.type === 'array') {
    if (!Array.isArray(value) || value.length < (rule.minItems ?? 0)) fail('expected a list with at least one item');
    (value as unknown[]).forEach((item, index) => check(item, rule.items!, `${where}[${index}]`));
  }
  if (rule.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return fail('expected an object');
    const fields = rule.properties ?? {};
    for (const key of rule.required ?? []) if (!(key in value)) fail(`missing "${key}"`);
    for (const [key, item] of Object.entries(value)) {
      if (!(key in fields)) fail(`unknown field "${key}" (allowed: ${Object.keys(fields).join(', ')})`);
      if (key !== '$schema') check(item, fields[key]!, where ? `${where}.${key}` : key);
    }
  }
}
check(data, schema as Schema, '');

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

for (const locale of localeKeys) {
  const { home } = data.text[locale];
  const needs: [string, string, string[]][] = [
    ['home.count.one', home.count.one, ['count']],
    ['home.count.other', home.count.other, ['count']],
    ['home.tagTitle', home.tagTitle, ['tag']],
    ['home.tagDescription', home.tagDescription, ['tag']],
    ['home.topicTitle', home.topicTitle, ['topic']],
    ['home.seriesTitle', home.seriesTitle, ['series']],
    ['series.part', data.text[locale].series.part, ['part', 'series']],
  ];
  for (const [where, template, keys] of needs) {
    for (const key of keys) {
      if (!template.includes(`{${key}}`)) throw new Error(`src/config/site.json → text.${locale}.${where}: should include {${key}}`);
    }
  }
}

const brand = data.brand;

function localize(locale: SiteLocale) {
  const text = data.text[locale];
  const plural = new Intl.PluralRules(locales[locale].language);
  return {
    ...text,
    home: {
      ...text.home,
      plate: plates[locale],
      count: (count: number) => fill(plural.select(count) === 'one' ? text.home.count.one : text.home.count.other, { count }),
      tagTitle: (tag: string) => fill(text.home.tagTitle, { tag, brand: brand.name }),
      tagDescription: (tag: string) => fill(text.home.tagDescription, { tag, brand: brand.name }),
      topicTitle: (topic: string) => fill(text.home.topicTitle, { topic, brand: brand.name }),
      seriesTitle: (series: string) => fill(text.home.seriesTitle, { series, brand: brand.name }),
    },
    series: {
      ...text.series,
      part: (part: number, series: string) => fill(text.series.part, { part, series }),
    },
    navigation: menus.header[locale],
    footer: {
      ...text.footer,
      links: menus.footer[locale],
      statement: fill(text.footer.statement, { brand: brand.name }),
    },
  };
}

const localized = Object.fromEntries(localeKeys.map((locale) => [locale, localize(locale)])) as Record<SiteLocale, ReturnType<typeof localize>>;

export const siteConfig = {
  brand,
  defaultLocale,
  locales,
  localeKeys,
  localized,
  structuredData: { about: data.about },
  sidebar: [],
} as const;

export function getLocalizedSiteConfig(pathname: string) {
  return localized[getSiteLocale(pathname)];
}

export function getLocalizedPath(pathname: string, targetLocale: SiteLocale): string {
  const currentLocale = getSiteLocale(pathname);
  const pathWithoutLocale = currentLocale === siteConfig.defaultLocale
    ? pathname
    : pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), '') || '/';

  if (targetLocale === siteConfig.defaultLocale) return pathWithoutLocale;
  return pathWithoutLocale === '/' ? `/${targetLocale}/` : `/${targetLocale}${pathWithoutLocale}`;
}
