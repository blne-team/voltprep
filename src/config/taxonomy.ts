// Loads topics and tags from taxonomy.json (edit that file, not this one). Topics are categories:
// every post belongs to exactly one, and every topic gets a page. Tags cut across topics.
// The file is checked when the site builds, and post frontmatter is checked against it in content.config.ts.
import data from './taxonomy.json';
import { localeKeys, localePrefix, type SiteLocale } from './locales';

type Localized = Record<SiteLocale, string>;

/** A topic id from taxonomy.json, such as `electrical`. */
export type TopicKey = string;
/** A tag id from taxonomy.json, such as `ac-circuits`. */
export type TagKey = string;

const fail = (where: string, message: string): never => {
  throw new Error(`src/config/taxonomy.json → ${where}: ${message}`);
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function only(item: Record<string, unknown>, allowed: string[], where: string) {
  const unknown = Object.keys(item).filter((key) => !allowed.includes(key));
  if (unknown.length) fail(where, `unknown field "${unknown[0]}" (allowed: ${allowed.join(', ')})`);
}

function localized(value: unknown, where: string): Localized {
  if (!isObject(value)) return fail(where, `expected text for each language: ${localeKeys.join(', ')}`);
  only(value, localeKeys, where);
  for (const locale of localeKeys) {
    if (typeof value[locale] !== 'string' || !value[locale].trim()) fail(`${where}.${locale}`, 'expected some text');
  }
  return value as Localized;
}

function entries<T>(name: 'topics' | 'tags', fields: string[], parse: (item: Record<string, unknown>, where: string) => T): [string, T][] {
  const value = (data as Record<string, unknown>)[name];
  if (!Array.isArray(value)) return fail(name, 'expected a list');
  const seen = new Set<string>();
  return value.map((item, index) => {
    const where = `${name}[${index}]`;
    if (!isObject(item)) return fail(where, 'expected an object');
    only(item, fields, where);
    const id = item.id;
    if (typeof id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      return fail(`${where}.id`, `"${String(id)}" should use lowercase letters, digits and hyphens, such as 3d-printing`);
    }
    if (seen.has(id)) fail(`${where}.id`, `"${id}" is used twice`);
    seen.add(id);
    return [id, parse(item, where)];
  });
}

const topicEntries = entries('topics', ['id', 'name', 'summary'], (item, where) => ({
  name: localized(item.name, `${where}.name`),
  summary: localized(item.summary, `${where}.summary`),
}));
const tagEntries = entries('tags', ['id', 'name'], (item, where) => localized(item.name, `${where}.name`));
if (topicEntries.length === 0) fail('topics', 'add at least one topic');

/** Topic ids in display order. */
export const topicKeys = topicEntries.map(([id]) => id) as [TopicKey, ...TopicKey[]];
export const topics: Record<TopicKey, { name: Localized; summary: Localized }> = Object.fromEntries(topicEntries);

/** Tag ids in display order. */
export const tagKeys = tagEntries.map(([id]) => id) as TagKey[];
export const tags: Record<TagKey, Localized> = Object.fromEntries(tagEntries);

// Kinds stay in code: they change how a post is laid out (`tool` pages get the workbench frame), not just a label.
export const postKinds = ['guide', 'tool'] as const;
export type PostKind = (typeof postKinds)[number];

export const kindLabels: Record<PostKind, Localized> = {
  guide: { root: 'Guide', fr: 'Guide', zh: '指南' },
  tool: { root: 'Tool', fr: 'Outil', zh: '工具' },
};

export const topicHref = (key: TopicKey, locale: SiteLocale) => `${localePrefix(locale)}/topics/${key}/`;
export const tagHref = (key: TagKey, locale: SiteLocale) => `${localePrefix(locale)}/tags/${key}/`;
