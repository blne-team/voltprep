import { readdir, readFile, access } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import assert from 'node:assert/strict';
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(join(dir, e.name)) : join(dir, e.name)))).flat();
}
const htmlFiles = (await files('dist')).filter(file => file.endsWith('.html'));
let checked = 0;
let productionBuild = false;
const titles = new Map();
const descriptions = new Map();
const canonicalUrls = new Set();
const indexablePaths = new Set();
const noindexPaths = new Set();
const alternateLinks = [];
let fallbackPages = 0;
// Series navigation found on posts, grouped by page language and series: the parts must run 1…total.
const seriesParts = new Map();
const taxonomy = JSON.parse(await readFile('src/config/taxonomy.json', 'utf8'));

function addUnique(map, value, file, label) {
  assert.ok(value, `${file}: missing ${label}`);
  assert.ok(!map.has(value), `${file}: duplicate ${label} also used by ${map.get(value)}`);
  map.set(value, file);
}

function pagePath(file) {
  const outputPath = relative('dist', file).split(sep).join('/');
  if (outputPath === 'index.html') return '/';
  return `/${outputPath.replace(/index\.html$/, '').replace(/\.html$/, '/')}`;
}

for (const file of htmlFiles) {
  if (file.endsWith('404.html') || file.includes(`${sep}404${sep}`)) continue;
  const html = await readFile(file, 'utf8');
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${file}: expected one h1`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  // An untranslated page (Starlight fallback) shows English content under another language's URL:
  // the page language and the <main> content language differ. It repeats the English title and description.
  const pageLanguage = html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1];
  const contentLanguage = html.match(/<main\b[^>]*\blang="([^"]+)"/)?.[1];
  const fallback = Boolean(pageLanguage && contentLanguage && pageLanguage !== contentLanguage);
  if (fallback) fallbackPages++;
  if (!fallback) {
    addUnique(titles, title, file, 'title');
    addUnique(descriptions, description, file, 'description');
  }

  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
  assert.ok(schemas.length >= 1, `${file}: missing structured data`);
  assert.ok(schemas.some(schema => schema['@graph']?.some(item => ['CollectionPage', 'WebPage'].includes(item['@type']))), `${file}: missing WebPage structured data`);

  const production = !html.includes('noindex, nofollow');
  productionBuild ||= production;
  if (production) {
    const canonicalUrl = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonicalUrl, `${file}: missing canonical`);
    assert.equal(new URL(canonicalUrl).pathname, pagePath(file), `${file}: canonical path mismatch`);
    assert.ok(!canonicalUrls.has(canonicalUrl), `${file}: duplicate canonical ${canonicalUrl}`);
    canonicalUrls.add(canonicalUrl);
    const noindex = /<meta name="robots" content="noindex/.test(html);
    (noindex ? noindexPaths : indexablePaths).add(pagePath(file));
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(([, language, href]) => ({ language, href }));
    if (fallback) assert.ok(noindex, `${file}: untranslated page should be noindex`);
    if (noindex) {
      assert.equal(alternates.length, 0, `${file}: a noindex page should have no language alternates`);
    } else {
      // Alternates name this page's own language and x-default, and every alternate must be a real, indexable page (checked below).
      for (const language of [pageLanguage, 'x-default']) {
        assert.ok(alternates.some(alternate => alternate.language === language), `${file}: missing ${language} alternate`);
      }
      alternateLinks.push(...alternates.map(alternate => ({ file, ...alternate })));
    }
  } else {
    assert.doesNotMatch(html, /rel="canonical"/, `${file}: local canonical should be omitted`);
    assert.doesNotMatch(html, /<link rel="alternate" hreflang=/, `${file}: local head hreflang should be omitted`);
  }
  for (const [, series, part, total] of html.matchAll(/<nav class="series-nav[^"]*"[^>]*data-series="([^"]+)" data-part="(\d+)" data-total="(\d+)"/g)) {
    const key = `${pageLanguage} ${series}`;
    if (!seriesParts.has(key)) seriesParts.set(key, []);
    seriesParts.get(key).push({ file, part: Number(part), total: Number(total) });
  }
  for (const match of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = match[1].replace(/&amp;/g, '&');
    if (/^(?:[a-z]+:|\/\/)/i.test(href)) continue;
    const path = href.split(/[?#]/)[0];
    if (!path) continue;
    const target = path.startsWith('/') ? join('dist', decodeURIComponent(path)) : join(dirname(file), decodeURIComponent(path));
    await access(path.endsWith('/') ? join(target, 'index.html') : target).catch(() => { throw new Error(`${file}: broken link ${href}`); });
  }
  checked++;
}
assert.ok(checked >= 1, 'Expected at least one content page');
// Every series has a hub (English only for now, site-profile hard rule 6a); the Series menu links to each.
for (const { id } of taxonomy.series) await access(join('dist', 'series', id, 'index.html'));
for (const [key, parts] of seriesParts) {
  const total = parts[0].total;
  assert.ok(parts.every(item => item.total === total), `series ${key}: pages disagree on the number of parts`);
  assert.deepEqual(parts.map(item => item.part).sort((a, b) => a - b), Array.from({ length: total }, (_, i) => i + 1), `series ${key}: parts should run 1…${total} once each (${parts.map(item => item.file).join(', ')})`);
}
if (productionBuild) {
  const robots = await readFile('dist/robots.txt', 'utf8');
  assert.match(robots, /^User-agent: \*\nAllow: \/\nSitemap: https:\/\/.+\/sitemap-index\.xml\n$/, 'robots.txt: invalid production directives');
  await access('dist/sitemap-index.xml');
  const sitemapXml = await Promise.all((await readdir('dist')).filter(name => /^sitemap-\d+\.xml$/.test(name)).map(name => readFile(join('dist', name), 'utf8')));
  const sitemapPaths = new Set(sitemapXml.flatMap(xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname)));
  for (const path of noindexPaths) assert.ok(!sitemapPaths.has(path), `sitemap: noindex page ${path} should be omitted`);
  for (const path of indexablePaths) assert.ok(sitemapPaths.has(path), `sitemap: missing ${path}`);
  for (const { file, language, href } of alternateLinks) {
    assert.ok(indexablePaths.has(new URL(href).pathname), `${file}: ${language} alternate ${href} is not an indexable page`);
  }
}
console.log(`Verified ${checked} content pages (${fallbackPages} untranslated): unique metadata, headings, structured data, language alternates, internal links, ${taxonomy.series.length} series hubs and ${seriesParts.size} series sequences.`);
