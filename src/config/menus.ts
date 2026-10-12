// Loads the header menu and footer links from menus.json (edit that file, not this one).
// The file is checked when the site builds, so a mistake stops the build with a readable message.
import data from './menus.json';
import { defaultLocale, localeKeys, locales, type SiteLocale } from './locales';
import { series, seriesHref, seriesKeys, topicHref, topicKeys, topics } from './taxonomy';

type LocaleKey = SiteLocale;

/**
 * Header navigation. A link has an `href`; a dropdown has `children` (and may also have an
 * `href` for an overview page, shown first in the menu with the `overview` label).
 */
export interface NavLink {
  label: string;
  href: string;
  /** Short line shown under the label inside dropdown menus. */
  description?: string;
  external?: boolean;
}

export interface NavGroup {
  label: string;
  children: readonly NavLink[];
  href?: string;
  overview?: string;
}

export type NavItem = NavLink | NavGroup;

export const isNavGroup = (item: NavItem): item is NavGroup => 'children' in item;

const fail = (where: string, message: string): never => {
  throw new Error(`src/config/menus.json → ${where}: ${message}`);
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function text(value: unknown, where: string, optional = false): string | undefined {
  if (value === undefined && optional) return undefined;
  if (typeof value !== 'string' || !value.trim()) return fail(where, 'expected some text');
  return value;
}

function href(value: unknown, where: string, locale: LocaleKey): string {
  const link = text(value, where)!;
  if (/^https:\/\//.test(link)) return link;
  if (!link.startsWith('/') || !link.endsWith('/')) return fail(where, `"${link}" should start and end with / (for example /tools/) or be a full https:// address`);
  const language = locales[locale].languageName;
  if (locale !== defaultLocale && !link.startsWith(`/${locale}/`)) return fail(where, `"${link}" is in the ${language} menu, so it should start with /${locale}/`);
  const other = localeKeys.find((key) => key !== defaultLocale && link.startsWith(`/${key}/`));
  if (locale === defaultLocale && other) return fail(where, `"${link}" is in the English menu but points to a ${locales[other].languageName} page`);
  return link;
}

function only(item: Record<string, unknown>, allowed: string[], where: string) {
  const unknown = Object.keys(item).filter((key) => !allowed.includes(key));
  if (unknown.length) fail(where, `unknown field "${unknown[0]}" (allowed: ${allowed.join(', ')})`);
}

function link(item: unknown, where: string, locale: LocaleKey): NavLink {
  if (!isObject(item)) return fail(where, 'expected { "label": …, "href": … }');
  only(item, ['label', 'href', 'description', 'external'], where);
  if (item.external !== undefined && typeof item.external !== 'boolean') fail(`${where}.external`, 'expected true or false');
  return {
    label: text(item.label, `${where}.label`)!,
    href: href(item.href, `${where}.href`, locale),
    description: text(item.description, `${where}.description`, true),
    external: item.external === true || undefined,
  };
}

const generated = {
  topics: { keys: topicKeys, entries: topics, href: topicHref },
  series: { keys: seriesKeys, entries: series, href: seriesHref },
};

function headerItem(item: unknown, where: string, locale: LocaleKey): NavItem {
  if (!isObject(item)) return fail(where, 'expected a menu item');
  // Dropdowns filled from taxonomy.json: `{ "label": …, "topics": true }` or `{ "label": …, "series": true }`.
  for (const [flag, source] of Object.entries(generated)) {
    if (!(flag in item)) continue;
    only(item, ['label', flag], where);
    if (item[flag] !== true) fail(`${where}.${flag}`, 'expected true');
    return {
      label: text(item.label, `${where}.label`)!,
      children: source.keys.map((key) => ({ label: source.entries[key].name[locale], href: source.href(key, locale) })),
    };
  }
  if (!('children' in item)) return link(item, where, locale);
  only(item, ['label', 'children', 'href', 'overview'], where);
  if (!Array.isArray(item.children) || item.children.length === 0) fail(`${where}.children`, 'expected a list with at least one link');
  if ((item.href === undefined) !== (item.overview === undefined)) fail(where, '"href" and "overview" go together: set both or neither');
  return {
    label: text(item.label, `${where}.label`)!,
    children: (item.children as unknown[]).map((child, index) => link(child, `${where}.children[${index}]`, locale)),
    href: item.href === undefined ? undefined : href(item.href, `${where}.href`, locale),
    overview: text(item.overview, `${where}.overview`, true),
  };
}

function list<T>(value: unknown, where: string, parse: (item: unknown, where: string) => T): T[] {
  if (!Array.isArray(value)) return fail(where, 'expected a list');
  return value.map((item, index) => parse(item, `${where}[${index}]`));
}

function section<T>(name: 'header' | 'footer', parse: (item: unknown, where: string, locale: LocaleKey) => T) {
  const value = (data as Record<string, unknown>)[name];
  if (!isObject(value)) return fail(name, `expected a list for each language: ${localeKeys.join(', ')}`);
  const unknown = Object.keys(value).find((key) => !localeKeys.includes(key as LocaleKey));
  if (unknown) fail(`${name}.${unknown}`, `unknown language (allowed: ${localeKeys.join(', ')})`);
  return Object.fromEntries(localeKeys.map((locale) => [
    locale,
    list(value[locale], `${name}.${locale}`, (item, where) => parse(item, where, locale)),
  ])) as Record<LocaleKey, T[]>;
}

// Every language's menus must mirror the English ones: same items, in the same order, to the same pages.
const sameTarget = (english: string, other: string, locale: LocaleKey) => english.startsWith('https://') || other === `/${locale}${english}`;
function mirror(english: NavLink[], other: NavLink[], where: string, locale: LocaleKey) {
  const language = locales[locale].languageName;
  if (english.length !== other.length) fail(where, `English has ${english.length} links but ${language} has ${other.length}; keep the lists in step`);
  english.forEach((item, index) => {
    if (!sameTarget(item.href, other[index]!.href, locale)) fail(`${where}[${index}]`, `English links to ${item.href} but ${language} links to ${other[index]!.href} (expected /${locale}${item.href})`);
  });
}

const header = section('header', headerItem);
const footer = section('footer', link);

for (const locale of localeKeys.filter((key) => key !== defaultLocale)) {
  const english = header[defaultLocale];
  const other = header[locale];
  if (english.length !== other.length) fail(`header.${locale}`, `English has ${english.length} items but ${locales[locale].languageName} has ${other.length}; keep the lists in step`);
  english.forEach((item, index) => {
    const match = other[index]!;
    const where = `header.${locale}[${index}]`;
    if (isNavGroup(item) !== isNavGroup(match)) fail(where, 'should be the same kind of item as the English menu at this position');
    if (isNavGroup(item) && isNavGroup(match)) {
      if ((item.href === undefined) !== (match.href === undefined)) fail(where, 'the dropdowns should all have an overview link, or none');
      if (item.href && match.href) mirror([{ label: '', href: item.href }], [{ label: '', href: match.href }], `${where}.href`, locale);
      mirror([...item.children], [...match.children], `${where}.children`, locale);
    } else {
      mirror([item as NavLink], [match as NavLink], where, locale);
    }
  });
  mirror(footer[defaultLocale], footer[locale], `footer.${locale}`, locale);
}

export const menus = { header, footer };
