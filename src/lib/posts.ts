import { getCollection } from 'astro:content';
import { defaultLocale, localeKeys, localePrefix, locales, type SiteLocale } from '../config/locales';
import { topicKeys, type PostKind, type SeriesKey, type TagKey, type TopicKey } from '../config/taxonomy';

export interface Post {
  title: string;
  description: string;
  href: string;
  topic: TopicKey;
  tags: TagKey[];
  kind: PostKind;
  series?: SeriesKey;
  seriesOrder?: number;
  published?: Date;
  /** Not translated into this language yet: the page shows the English text. */
  untranslated: boolean;
}

const inLocale = (id: string, key: SiteLocale) => id === key || id.startsWith(`${key}/`);
const localeOf = (id: string, locale: SiteLocale) => (locale === defaultLocale
  ? !localeKeys.some((key) => key !== defaultLocale && inLocale(id, key))
  : inLocale(id, locale));

/**
 * Posts are docs entries with a `topic`. A language lists its own posts plus every English post it has
 * not translated yet (Starlight serves those at the language's URL with the English text and a notice).
 * Newest first when dated, then by title.
 */
export async function getPosts(locale: SiteLocale): Promise<Post[]> {
  const entries = await getCollection('docs', (entry) => Boolean(entry.data.topic));
  const own = entries.filter((entry) => localeOf(entry.id, locale));
  const translated = new Set(own.map((entry) => (locale === defaultLocale ? entry.id : entry.id.slice(locale.length + 1))));
  const fallback = locale === defaultLocale ? [] : entries.filter((entry) => localeOf(entry.id, defaultLocale) && !translated.has(entry.id));
  return [
    ...own.map((entry) => ({ entry, href: `/${entry.id}/`, untranslated: false })),
    ...fallback.map((entry) => ({ entry, href: `${localePrefix(locale)}/${entry.id}/`, untranslated: true })),
  ]
    .map(({ entry, href, untranslated }) => {
      if (entry.data.seriesOrder !== undefined && entry.data.series === undefined) {
        throw new Error(`${entry.filePath}: seriesOrder is set but series is not; add a series or remove seriesOrder`);
      }
      return {
      title: entry.data.title,
      description: entry.data.description ?? '',
      href,
      topic: entry.data.topic as TopicKey,
      tags: entry.data.tags,
      kind: entry.data.kind,
      series: entry.data.series,
      seriesOrder: entry.data.seriesOrder,
      published: entry.data.published,
      untranslated,
      };
    })
    .sort((a, b) => (b.published?.getTime() ?? 0) - (a.published?.getTime() ?? 0) || a.title.localeCompare(b.title, locales[locale].language));
}

export async function getTopicCounts(locale: SiteLocale): Promise<Record<TopicKey, number>> {
  const posts = await getPosts(locale);
  return Object.fromEntries(topicKeys.map((key) => [key, posts.filter((post) => post.topic === key).length])) as Record<TopicKey, number>;
}
