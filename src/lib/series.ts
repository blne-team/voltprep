// Series listings and a post's place in its series, per language (see series-order.ts for the rules).
import { locales, type SiteLocale } from '../config/locales';
import type { SeriesKey } from '../config/taxonomy';
import { getPosts, type Post } from './posts';
import { orderSeries, seriesPosition, type SeriesPosition } from './series-order';

/** The posts of one series in reading order. */
export async function getSeriesPosts(locale: SiteLocale, key: SeriesKey): Promise<Post[]> {
  const compare = (a: string, b: string) => a.localeCompare(b, locales[locale].language);
  return orderSeries((await getPosts(locale)).filter((post) => post.series === key), compare);
}

/** Where the post at `href` sits in its series, or null when it isn't in one. */
export async function getSeriesPlace(locale: SiteLocale, href: string): Promise<{ key: SeriesKey; position: SeriesPosition<Post> } | null> {
  const post = (await getPosts(locale)).find((candidate) => candidate.href === href);
  if (!post?.series) return null;
  return { key: post.series, position: seriesPosition(await getSeriesPosts(locale, post.series), href) };
}
