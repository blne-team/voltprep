// The site's languages. `root` is the default (English, served at /); every other key is its URL prefix.
// To add a language: add it here, then add its text to site.json, menus.json and taxonomy.json
// (the build names anything missing). Pages without a translation show the English text with a notice.
export const locales = {
  root: {
    label: 'English (Canada)',
    shortLabel: 'EN',
    languageName: 'English',
    regionName: 'Canada',
    language: 'en-CA',
    openGraph: 'en_CA',
    giscus: 'en',
    homeHref: '/',
  },
  fr: {
    label: 'Français (Canada)',
    shortLabel: 'FR',
    languageName: 'Français',
    regionName: 'Canada',
    language: 'fr-CA',
    openGraph: 'fr_CA',
    giscus: 'fr',
    homeHref: '/fr/',
  },
  zh: {
    label: '简体中文',
    shortLabel: '中',
    languageName: '中文',
    regionName: '简体',
    language: 'zh-CN',
    openGraph: 'zh_CN',
    giscus: 'zh-CN',
    homeHref: '/zh/',
  },
} as const;

export type SiteLocale = keyof typeof locales;
export const defaultLocale: SiteLocale = 'root';
export const localeKeys = Object.keys(locales) as SiteLocale[];

/** URL prefix for a locale: '' for the default, '/fr' for French. */
export const localePrefix = (locale: SiteLocale) => (locale === defaultLocale ? '' : `/${locale}`);

/** The locale a URL path belongs to. */
export function getSiteLocale(pathname: string): SiteLocale {
  return localeKeys.find((key) => key !== defaultLocale && (pathname === `/${key}` || pathname.startsWith(`/${key}/`))) ?? defaultLocale;
}

/**
 * The language of the page's text, for components placed inside content (explainers, calculators).
 * It differs from the URL's locale on untranslated pages, which show the English text.
 */
export function getContentLocale(pathname: string, route?: { entryMeta?: { locale?: string } }): SiteLocale {
  if (!route?.entryMeta) return getSiteLocale(pathname);
  const locale = route.entryMeta.locale;
  return locale && locale in locales ? (locale as SiteLocale) : defaultLocale;
}

/** Text keyed by locale, falling back to the default language when a translation is missing. */
export const pick = <T>(copy: { root: T } & Partial<Record<SiteLocale, T>>, locale: SiteLocale): T => copy[locale] ?? copy.root;
