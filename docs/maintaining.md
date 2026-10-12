# Maintaining the site

This guide is for whoever runs the site day to day. Everyday changes (the site name, menus, topics, tags, homepage and footer text, and posts) are made in data and text files, so you don't need to change any code. Every change is checked automatically before it can go live.

## Where things are

| To change… | Edit |
| --- | --- |
| Site name, homepage headline and summary, footer text, button and label text | `src/config/site.json` |
| Header menu and footer links | `src/config/menus.json` |
| Topics and tags | `src/config/taxonomy.json` |
| A post or page | its file in `src/content/docs/` (translations are at the same path under `fr/` and `zh/`) |
| The homepage's search-engine title and description | `index.mdx` in `src/content/docs/`, `fr/` and `zh/` |

The site has three languages: English (`root`, at `/`), French (`fr`, at `/fr/`) and Simplified Chinese (`zh`, at `/zh/`). Every data file has a section for each, and the checks expect them to match, so change all three.

Pages don't have to be translated straight away. A page with no French or Chinese version shows the English text at `/fr/…` or `/zh/…`, with a "not yet translated" notice. Listings mark it with a small label, and search engines skip it. Once you add the translated file, the notice and the label disappear by themselves.

If you edit the `.json` files in VS Code, it suggests field names, explains each field when you hover over it, and underlines mistakes as you type.

## Common tasks

### Rename the site

Change `brand.name` and `brand.shortName` in `site.json`. Sentences that contain `{brand}` pick up the new name automatically. A few posts also mention the name in their text; search `src/content/docs/` for the old name and update those too.

### Change a menu

In `menus.json`, the `header` lists are the top-row menu, from left to right, and the `footer` lists are the links in the footer's "site" column. A header item can be:

- a link: `{ "label": "About", "href": "/about/" }`
- a link to another site: `{ "label": "GitHub", "href": "https://github.com/…", "external": true }`
- a dropdown: `{ "label": "Tools", "children": [ …links… ] }`. Add `"href"` and `"overview"` to show an overview link first.
- the topics dropdown: `{ "label": "Topics", "topics": true }`. It fills itself with every topic.

Links within the site start and end with `/`; French links start with `/fr/` and Chinese links with `/zh/`. Keep every language's menu in the same order as the English one, linking to the same pages.

### Add a topic or tag

Add an entry to `topics` or `tags` in `taxonomy.json`:

```json
{ "id": "robotics", "name": { "root": "Robotics", "fr": "Robotique", "zh": "机器人" }, "summary": { "root": "…", "fr": "…", "zh": "…" } }
```

The `id` appears in page addresses (`/topics/robotics/`), so use lowercase letters, digits and hyphens, and avoid changing it later. A new topic appears straight away in the topic bar, the Topics menu, the homepage and the footer, and gets its own page. Search engines ignore that page until its first post is published. A tag gets a page once a post uses it.

Topics are shown in the order they're listed.

### Publish a post

Create a `.md` file in `src/content/docs/`. Add translations at the same path under `src/content/docs/fr/` and `src/content/docs/zh/` when they're ready; until then, those languages show the English text. Start it with:

```yaml
---
title: A unique page title
description: One or two sentences, also unique, shown in search results.
topic: electrical          # an id from taxonomy.json
kind: guide                # guide or tool
tags: [ac-circuits]        # ids from taxonomy.json
published: 2026-10-12      # optional, only if you know the real date
---
```

The post appears on the homepage, its topic page and its tag pages automatically. Follow the accuracy rules in `AGENTS.md`: link factual claims to the organization responsible for them and label original questions and advice as original.

## Check and publish

1. Preview while editing: `npm run dev`, then open the address it prints.
2. Check everything: `npm run verify`. It type-checks, builds the site and checks every page: titles, links, menus, all three languages and the sitemap. GitHub runs the same check on every push.
3. Deploy: `npm run cf:deploy`. It runs the checks first and stops if any fail. The first time, sign in with `npm run cf:login`. Production builds need `SITE_URL` set (see `.env.example`).

### When a check fails

The message names the file and the exact field. For example:

```
src/config/menus.json → header.fr[1].children[0].href: "/tools/series-rlc/" is in the Français menu, so it should start with /fr/
src/config/site.json → text.fr.home: missing "topicTitle"
docs → tools/series-rlc: topic: Unknown topic "electric". Use one of: electrical, 3d-printing, communications, computer-science
```

Fix that field and run `npm run verify` again.

## What still needs a developer

- Adding a new language: one entry in `src/config/locales.ts`, then its text in the three data files (the checks list anything missing). Pages fall back to English until translated.
- Changing layout, colours or the homepage notebook drawing.
- Adding a new post kind beyond `guide` and `tool`, since kinds change how a page is laid out.
- New calculators or interactive explainers.
