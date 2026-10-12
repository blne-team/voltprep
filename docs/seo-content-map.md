# SEO content map

This map gives every public page one primary search intent. Use the supporting concepts naturally in headings and copy; do not add a `meta keywords` tag or repeat exact phrases mechanically.

| Route | Primary search intent | Supporting concepts | Page role |
| --- | --- | --- | --- |
| `/` | personal learning notes | electrical, 3D printing, communications, computer science | List every post and every topic so visitors can choose where to start. |
| `/topics/electrical/` | electrical theory notes | electrical theory, AC circuits, theory calculators | Generated category listing of every electrical post. |
| `/tags/<tag>/` | posts about one subject (for example AC circuits) | the tag label | Generated listing across topics; keep tag names specific so each page has a distinct intent. |
| `/tools/` | electrical theory calculators | RLC circuit calculator, three-phase power calculator | Help learners choose a focused, transparent theory model without field-design claims. |
| `/tools/series-rlc/` | series RLC circuit calculator | complex impedance, reactance, phase angle, RMS current, AC power | Provide an interactive ideal series-circuit model with formulas and assumptions in view. |
| `/tools/three-phase-power/` | three-phase power calculator | apparent power, real power, reactive power, power factor | Provide an interactive ideal balanced-system model with formulas and assumptions in view. |
| `/publishing-method/` | electrical education publishing standards | source policy, technical review, code edition, jurisdiction, original practice questions | Establish trust and define what can be published. |
| `/share/` | share electrical knowledge | electrical questions, source suggestions, corrections, community discussion | Help contributors provide context that can be checked and improved. |

The `/fr/` routes target the equivalent French-language intent for Canada. Each English page has a matching French page at the same path below `/fr/`, which supports reciprocal `hreflang` links.

The `/zh/` routes target Simplified Chinese readers. The homepage, topic and tag listings are translated; other pages show the English text until a `zh/` page exists. Those untranslated pages are `noindex`, left out of the sitemap and of `hreflang`, so they don't compete with the English originals. When a page is translated, give it a Chinese title and description written for the Chinese search intent, not a literal copy.

## Content rules

- Keep the main phrase in the title, H1, opening paragraph, and one descriptive internal link when it reads naturally.
- Give every new page a distinct question to answer; expand an existing page when the intent is substantially the same.
- Link factual claims to the organization responsible for them (a provincial or territorial authority, a standards body or a manufacturer).
- Label site-created methods and questions as original.
- State code edition, jurisdiction, source, and qualified review status before publishing code-specific instruction.
- Prefer descriptive links such as “series RLC circuit calculator” over generic links such as “click here.”

## Planned topic clusters

Future material can grow under each topic:

1. **Electrical:** quantities and units, circuit relationships, energy and power, magnetism and induction, and reading representations, with practical procedures withheld until appropriately reviewed.
2. **3D printing:** materials, slicing, calibration and designing printable parts.
3. **Communications:** signals, modulation, radio and networks.
4. **Computer science:** algorithms, data structures, systems and the maths behind them.

Before adding a page, record its primary intent here and check that its title and description are unique.
