import { defineConfig, envField } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { siteConfig } from './src/config/site.ts';
import { seriesKeys, topicKeys } from './src/config/taxonomy.ts';
if (existsSync('.env')) process.loadEnvFile('.env');
const site = process.env.SITE_URL;
if (site && (!site.startsWith('https://') || new URL(site).pathname !== '/')) throw new Error('SITE_URL must be an HTTPS origin, e.g. https://your-domain.ca');

// Pages kept out of the sitemap (they also carry `noindex`):
// - untranslated pages, which Starlight serves at /fr/…, /zh/… with the English text (see Head.astro);
// - topic and series hubs with no posts yet, built so menu links work (see TaxonomyRoute.astro).
// Reads page files and the `topic:` and `series:` lines of their frontmatter.
const docsDir = 'src/content/docs';
const otherLocales = siteConfig.localeKeys.filter((key) => key !== siteConfig.defaultLocale);
const docs = readdirSync(docsDir, { recursive: true })
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => {
    const locale = otherLocales.find((key) => file.startsWith(`${key}/`)) ?? siteConfig.defaultLocale;
    const slug = (locale === siteConfig.defaultLocale ? file : file.slice(locale.length + 1)).replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
    const source = readFileSync(`${docsDir}/${file}`, 'utf8');
    const field = (name) => source.match(new RegExp(`^---[\\s\\S]*?^${name}:\\s*['"]?([\\w-]+)`, 'm'))?.[1];
    return { locale, slug, topic: field('topic'), series: field('series') };
  });
const localePath = (locale, slug) => `${locale === siteConfig.defaultLocale ? '' : `/${locale}`}/${slug ? `${slug}/` : ''}`;
const hasDoc = (locale, slug) => docs.some((doc) => doc.locale === locale && doc.slug === slug);
const fallbackPaths = otherLocales.flatMap((locale) => docs
  .filter((doc) => doc.locale === siteConfig.defaultLocale && doc.slug !== '404' && !hasDoc(locale, doc.slug))
  .map((doc) => localePath(locale, doc.slug)));
// A language lists its own posts plus untranslated English ones, so English posts count everywhere.
const emptyHubPaths = (keys, field, segment) => siteConfig.localeKeys.flatMap((locale) => keys
  .filter((key) => !docs.some((doc) => doc[field] === key && (doc.locale === locale || doc.locale === siteConfig.defaultLocale)))
  .map((key) => localePath(locale, `${segment}/${key}`)));
// Series copy is English only for now (site-profile hard rule 6a): other languages' hubs are untranslated pages.
const untranslatedSeriesPaths = otherLocales.flatMap((locale) => seriesKeys.map((key) => localePath(locale, `series/${key}`)));
const unlisted = new Set([...fallbackPaths, ...emptyHubPaths(topicKeys, 'topic', 'topics'), ...emptyHubPaths(seriesKeys, 'series', 'series'), ...untranslatedSeriesPaths]);

export default defineConfig({
  ...(site ? { site } : {}),
  trailingSlash: 'always',
  env: {
    schema: {
      SITE_URL: envField.string({ context: 'server', access: 'public', optional: true, url: true }),
      PUBLIC_GOOGLE_ADSENSE_CLIENT_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        length: 23,
        startsWith: 'ca-pub-',
      }),
      PUBLIC_GOOGLE_ADSENSE_HOME_SLOT: envField.string({ context: 'client', access: 'public', optional: true, min: 1, max: 20 }),
      PUBLIC_GOOGLE_ADSENSE_CONTENT_SLOT: envField.string({ context: 'client', access: 'public', optional: true, min: 1, max: 20 }),
      GISCUS_REPO: envField.string({ context: 'server', access: 'public', optional: true, min: 3 }),
      GISCUS_REPO_ID: envField.string({ context: 'server', access: 'public', optional: true, min: 1 }),
      GISCUS_CATEGORY: envField.string({ context: 'server', access: 'public', optional: true, min: 1 }),
      GISCUS_CATEGORY_ID: envField.string({ context: 'server', access: 'public', optional: true, min: 1 }),
    },
  },
  integrations: [sitemap({
    // Mirrors Starlight's own sitemap setup, which it skips when this integration is present.
    i18n: {
      defaultLocale: siteConfig.defaultLocale,
      locales: Object.fromEntries(Object.entries(siteConfig.locales).map(([key, locale]) => [key, locale.language])),
    },
    filter: (page) => !unlisted.has(new URL(page).pathname),
  }), starlight({
    title: siteConfig.brand.name,
    description: siteConfig.brand.description,
    defaultLocale: siteConfig.defaultLocale,
    locales: Object.fromEntries(Object.entries(siteConfig.locales).map(([key, locale]) => [
      key,
      { label: locale.label, lang: locale.language },
    ])),
    customCss: ['./src/styles/custom.css'],
    routeMiddleware: './src/routeData.ts',
    components: {
      Head: './src/components/Head.astro',
      Header: './src/components/Header.astro',
      Footer: './src/components/Footer.astro',
      PageTitle: './src/components/PageTitle.astro',
      MarkdownContent: './src/components/frame/MarkdownContent.astro',
      PageSidebar: './src/components/frame/PageSidebar.astro',
      TwoColumnContent: './src/components/frame/TwoColumnContent.astro',
      SiteTitle: './src/components/SiteTitle.astro',
    },
    sidebar: siteConfig.sidebar,
  })],
});
