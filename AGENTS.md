# Repository guide

Fieldbook is a personal, multi-topic site of learning notes, built as a static Astro + Starlight site. Electrical (theory calculators) is the first open topic; 3D printing, Communications and Computer science are planned. Pages are multilingual: English at `/` (the default), French at `/fr/` and Simplified Chinese at `/zh/`. Languages are defined once in `src/config/locales.ts`; no code may assume a fixed set of languages (iterate `localeKeys`, use `localePrefix()` and `locales[key].language`). French is fully translated; Chinese has the interface translated and pages fall back to English (Starlight's fallback, marked `noindex`, left out of the sitemap and hreflang, and labelled in listings) until a `zh/` page exists.

## Commands

- `npm run dev`: local dev server.
- `npm run verify`: type check, build and `scripts/check-build.mjs` (one h1 per page, unique titles and descriptions, structured data, language alternates, internal links). Run it after every change.
- `npm run cf:check`: verify plus a Wrangler dry run. Run it before any deployment.
- Build output goes to `dist/`. Do not commit it.

## Project layout

- `src/content/docs/`: study pages, tools and their translations under `fr/` and `zh/`. Each page needs a unique title and description. Use `.md` unless the page imports a component, then use `.mdx`.
- `src/components/`: Starlight overrides (Head, Header, Footer, PageTitle, SiteTitle) and site components (Homepage, PostList, TaxonomyPage, NotePlate, ElectricalCalculator, ToolNotes, Comments).
- `src/components/explainers/`: interactive teaching components used inside reading pages.
- Editable settings are data, not code, so a site manager can maintain them (guide: `docs/maintaining.md`). Do not hard-code text, names or lists in components that belong in these files:
  - `src/config/site.json`: brand, structured-data subjects, and all homepage, footer, comments and interface text for every locale. Templates use `{brand}`, `{count}`, `{tag}` and `{topic}`. Keep the brand name only here (components read `siteConfig.brand`).
  - `src/config/menus.json`: header menu and footer links.
  - `src/config/taxonomy.json`: topics and tags.
  - Each has a `.schema.json` (editor hints, and for `site.json` the structure checked at build). `site.ts`, `menus.ts` and `taxonomy.ts` load and validate them with messages that name the file and field. When a component needs new text, add the field to both locales in `site.json` and to `site.schema.json`.
  - `src/config/site.ts` keeps what is structural: locales, `getSiteLocale()`, and the homepage plate text (it describes the fixed drawing).
- `src/config/taxonomy.ts`: loads `taxonomy.json`; post kinds (`guide`, `tool`) stay in code because they change page layout. `src/lib/`: post queries and the PCB backdrop geometry.
- `src/styles/custom.css`: palette tokens, typography and reading-page rhythm.
- `archive/`: unpublished pages kept for reference (the retired Red Seal study plan and electrical learning path, which held the Ohm’s law explainer). Nothing there is built or linked.
- `docs/seo-content-map.md`: one primary search intent per route. Update it when adding a page.

Keep Starlight as the foundation. Extend it through configuration, `custom.css` and small component overrides; do not copy its implementation.

## Topics, tags and posts

The site works like a blog: topics are categories, tags cut across topics, and listings are generated.

- A post is any docs page with `topic` in its frontmatter; it also sets `kind` (`guide` or `tool`), `tags`, and optionally `published` (only when the real date is known). Pages without a topic, such as the standards page, are site pages.
- Topics and tags are defined once, with a label per language, in `src/config/taxonomy.json`; the schema in `src/content.config.ts` only accepts those ids and names the valid ones in its error. Add a topic or tag there first.
- `src/lib/posts.ts` reads posts per locale. Topic pages (`/topics/<key>/`) and tag pages (`/tags/<key>/`) are generated in `src/pages/` (English) and `src/pages/[locale]/` (every other language), both rendering `TaxonomyRoute.astro`: every topic gets a page (one with no posts shows as planned, with an empty listing, so menu links always work); a tag gets a page once it has a post. Do not build bespoke landing pages per topic.
- `PostList.astro` is the one listing component (homepage, topic and tag pages): directory-style rows (entry, tags, topic, type) with a CSS-only kind filter. Post pages show their topic, kind and tags around the title (`PageTitle.astro`).
- The header has two rows: brand, site links and utilities, then a text-mode topic bar listing every topic with its post count. Keep the top row short; new topics belong in the topic bar automatically.
- Menus are data, not code: the header menu and the footer's site links live in `src/config/menus.json` (every locale; schema in `menus.schema.json` for editor hints). A header item is a link (`label`, `href`, optional `description`, `external`), a dropdown (`label`, `children`, optional `href` + `overview` for an overview link first), or `{ "label": …, "topics": true }`, a dropdown filled from the taxonomy. `src/config/menus.ts` validates the file at build time and requires every language's lists to mirror the English ones (same order, `/<locale>` paths). Dropdowns render as an ASCII-framed panel with tree-marked items and as an indented group in the mobile menu. Header menus are `<details>` elements managed by one script: opening one closes the others, and an outside click or Escape closes them. Site pages such as the publishing standards and sharing guide belong in the footer, not the top row.

## Page frame

- Every page shares one canvas width for title, content, comments and footer (`--sl-content-width`, set in `custom.css`). Nothing should align to a different edge.
- The empty Starlight sidebar is disabled in `src/routeData.ts`; navigation lives in the site header.
- Pages declare `pageType` in frontmatter (schema in `src/content.config.ts`):
  - `article` (default): a reading column (`--ff-article-width`) with a sticky table of contents inside the canvas at 72rem and wider, rendered by `src/components/frame/MarkdownContent.astro`. Narrower screens use Starlight's mobile table of contents.
  - `landing`: a full-bleed page whose component renders its own h1 (homepage, topic and tag listings). Wrap it in `.home-shell` and add `not-content`.
  - `tool`: a wide workbench canvas (`--ff-tool-width`) with no table of contents and an "All tools" link above the title. Use it for calculators and the tools directory.
- Tool pages follow one structure: a short intro, the full-width `ElectricalCalculator` workbench (controls, live diagram, readout), then `<ToolNotes>` with a `<section>` for model assumptions and one for theory checks.
- Frame overrides live in `src/components/frame/` and `src/components/PageTitle.astro`; style page types with `[data-page-type]`.

## Visual system

The colour palette is settled. Reuse the existing tokens in `src/styles/custom.css` and do not introduce new brand colours.

- Dark is the default theme; light is set on `:root[data-theme='light']`. Every component must work in both.
- Use `--ff-*` and `--sl-color-*` tokens, never raw hex, except inside a self-contained instrument panel that already defines local variables (see `ElectricalCalculator.astro`).
- Colours carry meaning in explainers: lime/green (`--ff-lime` in dark, `--ff-green` in light) is current or flow; copper (`--ff-copper`) is energy, heat, power or a prompt that needs attention; muted greys are structure.
- Type: Archivo (`--sl-font-heading`) for headings, numbers and readouts with tabular figures; Source Sans 3 (`--sl-font`) for body and UI; Source Serif 4 (`--ff-font-quote`) for plain-language sentences and maths variables; Martian Mono (`--ff-font-mono`) for the text-mode layer: ASCII art, topic bar, breadcrumbs, tags, counts and column labels. Do not set long reading text in mono.
- Site-wide art direction is text-mode / ASCII chrome around one hand-drawn illustration:
  - Use `src/components/ascii/AsciiBox.astro` (┌─ label ─┐ frames: `single`, `double`, `dashed` for planned or secondary) and `AsciiRule.astro` (`══ Heading ════ meta ══`) instead of CSS borders for section headings, panels and dividers on listing pages and the footer. Horizontal edges are real box-drawing characters in `--ff-font-box` (system mono, which includes U+2500); vertical sides are hairlines on the character centreline. Long fill runs must keep zero intrinsic width (`width: 0` on the fill) or they widen layouts on phones.
  - Lists read as a directory tree (`├──`, `└──`, `│`), filters as ASCII radios (`( )` / `(•)`), tag filters as `[#tag]`, the current item in inverse video.
  - The homepage hero is a flat, front-on notebook plate (`NotePlate.astro`), set directly in the hero with no frame: one ruled spiral-notebook page with a series LED circuit sketched on the left and its current worked out on the right (lines in `src/config/site.ts`). It is a few dozen hand-placed SVG shapes with no script and no filters; keep it light and representative rather than adding detail or objects.
  - Listing pages (homepage, topic, tag) carry a faint printed-circuit-board backdrop (`PcbBackground.astro`, generated in `src/lib/pcb-pattern.ts`): solder-mask traces with 45° bends, buses, footprints and silkscreen designators, plus copper pads and vias, applied as CSS masks over `--pcb-trace` and `--pcb-copper` so it follows the theme and fades out downwards. Keep it off reading pages.
  - Generate art at build time; do not add per-frame JavaScript rendering. Keep any new art derived from real content, maths or electronics, not decorative noise.
- Bordered panels use a 1px hairline and the site's hard offset shadow (`0.6rem 0.6rem 0`), not soft blurred shadows or rounded cards.
- Labels are sentence case (mono column labels are lowercase). Avoid all-caps eyebrows, decorative numbering and arrow-suffixed links.
- The `frontend-design` skill is available for design work; follow it within these constraints.

## Interactive explainers on reading pages

Reading pages should teach a concept by letting the reader change it, not only by describing it. Add an explainer where the interaction makes a relationship visible that prose alone cannot.

- Build each explainer as an Astro component in `src/components/explainers/` with a custom element and a scoped `<script>`. Do not add a UI framework for this.
- Render the initial state on the server so the page is complete and correct without JavaScript. Keep controls `hidden` until the script runs.
- Show several representations of one idea together (words, sketch, maths, measurement) and update them in sync. This is the site's teaching method; see `OhmsLawExplainer.astro`.
- Copy lives in the component, keyed by locale and chosen with `pick({ root, fr, … }, locale)` (missing locales fall back to English). Components inside page content use `getContentLocale(Astro.url.pathname, Astro.locals.starlightRoute)` so they match the page text on untranslated pages; site chrome uses `getSiteLocale()`. Format numbers with `Intl.NumberFormat(locales[locale].language)` and put a non-breaking space between number and unit. Add the explainer to every translated version of a page.
- Accessibility: real `<label>`s, `aria-valuetext` with units on sliders, an `aria-label` on SVG diagrams that describes the current state, visible keyboard focus, and phone-width layouts (use container queries).
- Motion only explains: animate only what carries meaning (such as current flow), pause it when off-screen, and stop it under `prefers-reduced-motion`.
- Put `class="not-content"` on the component root so Starlight's markdown styles do not leak in.
- Use `Predict.astro` (native `<details>`, no script) for predict-then-reveal prompts. Check every worked number in an answer against the explainer before publishing.
- Each explainer states that it is an original Fieldbook explainer and names its model assumptions.
- Tool pages hold calculators with full inputs and outputs; explainers belong on reading pages and stay focused on one idea.

## Content accuracy and safety

- Link factual claims to the organization responsible for them. Label original practice questions and study advice as original.
- Do not invent author credentials, trade review, pass rates or official affiliation.
- Keep explainers to theory (circuit relationships, units, representations). Do not publish code-specific electrical instruction without the applicable code edition, sources and qualified review, and confirm province/territory differences.
- "Fieldbook" is a placeholder working name chosen while the owner decides on a final name. It lives in `brand` in `src/config/site.json` and in a few content pages and README; change them together. A professional trademark search is still needed before launch.
- This is a personal site: do not invent an owner name, biography, credentials or affiliations.

## Comments

- `Comments.astro` renders an on-demand "Discuss this page" panel on article and tool pages. Giscus (GitHub Discussions) loads only after the reader selects "Show comments"; keep it that way so no third-party request happens on page load.
- Comments are configured through the `GISCUS_*` environment variables (`src/config/comments.ts`); the panel is hidden when they are not set.

## Cloudflare deployment

- Deployment is Workers Static Assets serving `dist/` (configured in `wrangler.jsonc`). Add server rendering or runtime bindings only when a feature requires them.
- Use the pinned local Wrangler through the `cf:*` npm scripts. `npm run cf:login` uses device authorization.
- Cloudflare MCP authentication is separate from Wrangler. Verify the account and environment before any remote change, and keep credentials out of the repository.
- With a configured `SITE_URL`, also check canonical URLs, `robots.txt` and the sitemap.
- Stop any test server you start before handing the terminal back.
