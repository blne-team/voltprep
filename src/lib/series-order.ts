// Reading order inside one series, and where a post sits in it. Pure: no Astro imports, so it can be tested directly.

export interface SeriesItem {
  title: string;
  href: string;
  seriesOrder?: number;
}

export interface SeriesPosition<T extends SeriesItem> {
  part: number; // 1-based, whatever number the first seriesOrder is
  total: number;
  previous: T | null;
  next: T | null;
}

/**
 * Posts with a seriesOrder come first, lowest first; posts without one follow, by title.
 * Two posts with the same seriesOrder would make the reading order ambiguous, so that stops the build.
 */
export function orderSeries<T extends SeriesItem>(items: T[], compareTitles: (a: string, b: string) => number): T[] {
  const byOrder = new Map<number, T>();
  for (const item of items) {
    if (item.seriesOrder === undefined) continue;
    const clash = byOrder.get(item.seriesOrder);
    if (clash) throw new Error(`Two posts share seriesOrder ${item.seriesOrder}: ${clash.title} and ${item.title}`);
    byOrder.set(item.seriesOrder, item);
  }
  return [...items].sort((a, b) => {
    if (a.seriesOrder !== undefined && b.seriesOrder !== undefined) return a.seriesOrder - b.seriesOrder;
    if (a.seriesOrder !== undefined) return -1;
    if (b.seriesOrder !== undefined) return 1;
    return compareTitles(a.title, b.title);
  });
}

export function seriesPosition<T extends SeriesItem>(ordered: T[], href: string): SeriesPosition<T> {
  const index = ordered.findIndex((item) => item.href === href);
  if (index === -1) throw new Error(`${href} is not in this series`);
  return {
    part: index + 1,
    total: ordered.length,
    previous: ordered[index - 1] ?? null,
    next: ordered[index + 1] ?? null,
  };
}
