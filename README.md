# Fieldbook

A personal, multilingual (English, French, Simplified Chinese) site of learning notes (electrical, 3D printing, communications and computer science) built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

The public foundation library contains electrical theory calculators, publishing standards and a sharing guide. Technical lessons and practice questions remain unpublished until they meet the scope and review requirements in `AGENTS.md`.

## Develop

Use Node.js 24. The devcontainer already installs the expected version.

```bash
npm ci
npm run dev
```

Run the complete local check before handing off changes:

```bash
npm run verify
```

The generated site is written to `dist/` and must not be committed. The verification script checks page metadata, unique titles and descriptions, structured data, internal links, and production canonical/hreflang output.

## Project structure

- `src/content/docs/` contains published pages. Every page needs a unique title and description.
- `src/components/Homepage.astro` contains the homepage: a flat SVG notebook plate (a circuit sketch and its worked current), every post with a kind filter, and the topic list.
- Site settings and text live in data files under `src/config/`: `site.json` (brand, homepage, footer and interface text), `menus.json` (header menu and footer links) and `taxonomy.json` (topics and tags). Each has a `.schema.json` for editor hints and is checked at build time; see [docs/maintaining.md](docs/maintaining.md). Posts set `topic`, `kind` and `tags` in frontmatter; `/topics/<key>/` and `/tags/<key>/` listing pages are generated from them.
- `src/components/ToolDirectory.astro` presents the calculator index, while `src/components/ElectricalCalculator.astro` provides the focused browser-only RLC and balanced three-phase workbenches.
- `src/components/ads/AdsenseLoader.astro` loads the AdSense script from the shared head.
- `src/components/ads/AdSlot.astro` renders the `home` (listing pages) and `content` (reading and tool pages) ad placements.
- `src/components/Comments.astro` embeds giscus discussions on documentation pages when configured.
- `src/config/ads.ts` validates the AdSense publisher and slot IDs.
- `src/config/comments.ts` validates the public giscus repository and category identifiers.
- `src/content.config.ts` defines the Starlight content collections.
- `src/config/site.ts`, `menus.ts` and `taxonomy.ts` load and check those data files; the language list and the homepage drawing's text stay in `site.ts`.
- `src/styles/custom.css` contains the small visual layer applied over Starlight.
- `astro.config.mjs` wires Astro, Starlight, environment validation, and component overrides.
- `AGENTS.md` records the editorial and repository rules; `docs/maintaining.md` is the site manager's guide.
- `docs/seo-content-map.md` assigns one primary search intent to each public route so new pages do not compete with existing content.

Prefer Markdown for static study material. Use MDX only when a page needs a component, and add browser JavaScript only for a real interaction.

## Publishing and metadata

Without `SITE_URL`, builds intentionally emit `noindex`, block crawling in `robots.txt`, and omit canonical URLs. For an indexable production build, copy `.env.example` to `.env` and replace the sample value with the final HTTPS origin:

```dotenv
SITE_URL=https://your-real-domain.ca
```

Then run `npm run verify` and check the generated canonical URLs, `robots.txt`, and sitemap.

## Google AdSense

AdSense stays off until a production `SITE_URL` and the publisher ID are set. These are build-time variables: put them in `.env` for local builds, and in the Cloudflare build settings (Workers & Pages → the Worker → Settings → Build → Variables and secrets) for builds made from GitHub.

```dotenv
PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
PUBLIC_GOOGLE_ADSENSE_HOME_SLOT=0000000000
PUBLIC_GOOGLE_ADSENSE_CONTENT_SLOT=0000000000
```

`AdsenseLoader` (in the shared head) loads the AdSense script once and `src/pages/ads.txt.ts` generates `/ads.txt`. Ads appear in two fixed places, each a display ad unit created in AdSense whose slot ID goes in the matching variable:

- `home`: at the end of the homepage and of every topic and tag page that lists posts.
- `content`: after the text of every article and tool page, before the comments.

A placement without a slot ID renders nothing in production, and a unit Google leaves unfilled is hidden. The dev server shows a placeholder in each place. Pages with no content of their own (the 404 page, topics with no posts yet) never carry an ad.

## Community comments

Documentation pages can embed comments from GitHub Discussions through [giscus](https://giscus.app/). The homepage and 404 page never load the comments client, and an unconfigured build renders no comments UI.

To enable comments:

1. Use a public GitHub repository, enable Discussions, and install the giscus GitHub App for that repository.
2. Create or choose a discussion category intended for study-page conversations.
3. Enter the repository and category at `giscus.app`, select `pathname` mapping, and copy the four generated values into `.env` or the production build environment:

```dotenv
GISCUS_REPO=your-github-owner/your-public-repository
GISCUS_REPO_ID=R_your_repository_id
GISCUS_CATEGORY=Study discussions
GISCUS_CATEGORY_ID=DIC_your_category_id
```

All four variables must be supplied together. They are public identifiers, not credentials. Comments are lazy-loaded, follow the Starlight colour theme, and are labelled as unreviewed community contributions.

## Cloudflare

`wrangler.jsonc` serves `dist/` through Workers Static Assets, as the `faraday-fieldbook` Worker on `https://notes.tokenflake.com/`.

### Deploying

The Worker is connected to this GitHub repository through Cloudflare Workers Builds. Every push to `main` builds and deploys the site; merge work into `main` through a pull request.

- Build command `npm run verify`, so a failed check stops the deploy; deploy command `npx wrangler deploy`.
- `.env` is not committed, so Cloudflare builds read their settings from Workers & Pages → `faraday-fieldbook` → Settings → Build → Variables and secrets: `SITE_URL`, `PUBLIC_GOOGLE_ADSENSE_*` and `GISCUS_*`. These are build variables; the Worker's runtime variables have no effect on a static site. A new value applies from the next build.
- Node comes from `.nvmrc`.

After a deploy, check that the live homepage has a canonical URL and no `noindex`, and that `/robots.txt` and `/ads.txt` are filled in. A `noindex` page means the build ran without `SITE_URL`.

### Local scripts

Wrangler is pinned locally; use the repository scripts rather than a global installation. A local deploy uses `.env` and bypasses the GitHub flow, so keep it for emergencies.

```bash
npm run cf:check   # Verify and dry-run the package
npm run cf:dev     # Build and serve locally on port 8787
npm run cf:login   # Device authorization
npm run cf:whoami  # Confirm the active account
npm run cf:deploy  # Verify, build, and deploy
```

Confirm the target account and environment before any remote change. Keep credentials and account identifiers out of the repository.

“Fieldbook” is a placeholder working name (previously “Faraday Fieldbook”). Choose the final name, update `brand` in `src/config/site.json` and the content pages that mention it, and complete a professional trademark search before launch.
