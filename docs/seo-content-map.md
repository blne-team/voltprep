# SEO content map

This map gives every public page one primary search intent. Use the supporting concepts naturally in headings and copy; do not add a `meta keywords` tag or repeat exact phrases mechanically.

| Route | Primary search intent | Supporting concepts | Page role |
| --- | --- | --- | --- |
| `/` | personal learning notes | electrical, 3D printing, communications, computer science | List every post and every topic so visitors can choose where to start. |
| `/topics/electrical/` | all electrical notes | electrical guides, tools, equipment, experiments, exam review | Generated category listing of every electrical post, across all series. |
| `/series/electrical-theory/` | electrical theory explained | voltage, current, resistance, Ohm's law, power, circuits, in reading order | Generated series hub: concept explainers in reading order (Part 1, 2, …). |
| `/series/electrical-equipment/` | how electrical equipment works | transformers, motors, breakers, meters, everyday devices | Generated series hub: one device per post, theory first. Empty (noindex) until its first post. |
| `/series/electricity-experiments/` | famous electricity experiments | historical experiments, what was measured, what it proved | Generated series hub: experiments retold with their measurements. Empty (noindex) until its first post. |
| `/series/red-seal-electrician/` | Red Seal electrician theory review | exam key points, theory behind them, original prep tips, no affiliation | Generated series hub: theory review only, no code-specific instruction or reproduced exam text. Empty (noindex) until its first post. |
| `/tags/<tag>/` | posts about one subject (for example AC circuits) | the tag label | Generated listing across topics; keep tag names specific so each page has a distinct intent. |
| `/tools/` | electrical theory calculators | RLC circuit calculator, three-phase power calculator, LED resistor calculator | Help learners choose a focused, transparent theory model without field-design claims. |
| `/tools/series-rlc/` | series RLC circuit calculator | complex impedance, reactance, phase angle, RMS current, AC power | Provide an interactive ideal series-circuit model with formulas and assumptions in view. |
| `/tools/three-phase-power/` | three-phase power calculator | apparent power, real power, reactive power, power factor | Provide an interactive ideal balanced-system model with formulas and assumptions in view. |
| `/how-a-transformer-works/` | step up vs step down transformer | how does a transformer work (electrical), transformer turns ratio, turns ratio formula, step-down transformer, step-up transformer | Explain the shared-flux mechanism, compare step-up and step-down, and show why the grid uses high voltage, theory only. |
| `/tools/led-resistor-calculator/` | led resistor calculator | series resistor, forward voltage, E24 value, resistor wattage, voltage drop, internal resistance | Scenario workbench: size an LED's series resistor end to end (words, sketch, maths, meter check), with DC wire-run drop and battery sag as theory-only secondary scenarios. |
| `/ac-impedance/` | what is impedance | resistance, reactance, phase angle, impedance triangle, frequency | Explain AC opposition; the calculator stays with `/tools/series-rlc/`. |
| `/how-a-multimeter-works/` | how does a multimeter work | how to use a multimeter, analog vs digital multimeter, auto ranging vs manual, true RMS meaning, CAT III vs CAT IV | Explain the three measurements as Ohm's law inside the meter, show bench-level use, and compare meter features without product picks. |
| `/red-seal-electrician-exam-breakdown/` | red seal electrician exam breakdown | 100 questions, MWA weights, 2025 RSOS, pass mark, theory behind tasks | Official breakdown plus where the theory sits. |
| `/309a-vs-442a/` | 309a vs 442a | construction and maintenance electrician, industrial electrician, C of Q, ESA licence, Red Seal titles | Side-by-side official comparison. |
| `/three-phase-power-explained/` | three phase power | single phase vs three phase, line and phase voltage, √3, wye and delta, three-phase power formula | Explain where √3 comes from and compare single- and three-phase supply; the calculator stays with `/tools/three-phase-power/`. |
| `/how-a-circuit-breaker-trips/` | how a circuit breaker trips / thermal vs magnetic | bimetal overload, magnetic short-circuit, thermal-magnetic trip unit | Theory comparison of the two trip paths. |
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
