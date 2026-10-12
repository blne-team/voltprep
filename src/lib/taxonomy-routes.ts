import { type SiteLocale } from '../config/locales';
import { seriesKeys, tagKeys, topicKeys } from '../config/taxonomy';
import { getPosts } from './posts';

// Every topic gets a page, so topic links work before anything is filed there.
export const topicPaths = (locales: SiteLocale[]) => locales.flatMap((locale) => topicKeys.map((topic) => ({ locale, topic })));

// Every series gets a hub, so the Series menu works before a series has posts (empty hubs are noindex).
export const seriesPaths = (locales: SiteLocale[]) => locales.flatMap((locale) => seriesKeys.map((series) => ({ locale, series })));

// A tag gets a page once a post in that language (or an untranslated English post) uses it.
export async function tagPaths(locales: SiteLocale[]) {
  const perLocale = await Promise.all(locales.map(async (locale) => {
    const posts = await getPosts(locale);
    return tagKeys.filter((tag) => posts.some((post) => post.tags.includes(tag))).map((tag) => ({ locale, tag }));
  }));
  return perLocale.flat();
}
