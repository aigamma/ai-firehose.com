# Glossary: The Durable Knowledge Layer

The glossary has two layers with opposite lifecycles, and that split is the point.

- **Durable knowledge** (authored): foundational, advanced, and exotic AI, mathematics, and philosophy-of-mind concepts, written by a human and by Opus at full strength. It is the permanent learning resource, and it never expires.
- **Trending taxonomy** (corpus-derived): concepts the classifier discovers in the rolling-quarter firehose. It turns over every quarter by the retention contract.

The two meet on one surface: every concept, durable or trending, has a hub at `/technique/<slug>`, appears in the glossary index, and participates in the wiki-style auto-linking that meshes the whole site together.

## Authoring Durable Entries

Source of truth: `content/glossary/<category>/<slug>.md`, one Markdown file per concept, frontmatter plus body. The full format is in `content/glossary/README.md`; the canonical examples are `content/glossary/optimization/gradient-descent.md`, `geometry/geodesic.md`, and `transformers/self-attention.md`.

Authoring is interactive and Opus-authored: open a console (Claude Code) and ask, or dictate, and Opus writes the entry at full strength into `content/glossary/`. This is deliberate. The autonomous worker pipeline runs cheap models (Haiku classification, Sonnet briefing) for the transient layer; durable content that sticks gets the strongest model, because it is read for years, not a day. Width first, then enrichment: the first pass aims for broad coverage, and entries are deepened later with more passes, the author's own work, and images.

## Build: Content to Served Artifacts

`scripts/build_glossary.mjs` (`npm run glossary`, also a `prebuild` step) compiles the authored entries into the served glossary:

- Parses frontmatter and compiles the Markdown body to typed blocks (paragraph, heading, list, quote, code).
- Writes one `public/data/glossary/c/<slug>.json` hub per entry, MERGED with any corpus hub of the same slug: the authored definition, body, related mesh, and `durable: true` overlay the corpus `attention`, `rotation`, `neighbors`, and `top_items`.
- Merges every authored entry into `public/data/glossary/index.json` (the slim list and search payload), marked `durable: true` with its `category`.
- Idempotent and re-runnable.

The build is the self-healing mechanism for the durable layer: because `content/glossary` is the committed source of truth and `build_glossary` runs on every Netlify deploy (`prebuild`) and at the end of the worker's glossary step (`run.mjs`), a corpus rebuild can never permanently drop the authored entries. They are re-merged every time.

## Durability Contract

- Authored entries carry `durable: true` and `source: "authored"`. The retention prune (keyed on `published_at`) only touches corpus items and vectors; it never removes a durable hub. A durable concept with no items in the window simply shows no trending signal, not a deletion.
- A durable entry shares a slug with a corpus concept when the field is actively discussing it (for example `retrieval-augmented-generation`). The hub then shows both: the authored body, and the live momentum and recent items.

## Wiki-Style Auto-Linking (the deep mesh)

`src/lib/richtext.js` (pure, unit-tested) compiles the glossary index into one boundary-anchored, longest-first matcher over every concept label and alias. `src/components/RichText.jsx` renders prose (authored hub bodies and the daily briefing) with:

- inline Markdown (bold, italic, code, links),
- numbered `[n]` citations (the briefing),
- and a link on the first mention of any glossary term to its hub, Wikipedia-style, never linking a term to its own page.

Labels are authoritative: a concept's own name always wins the surface form over another concept's alias (`self-attention` links to its own hub even if `attention-mechanism` lists it as an alias). The matcher is fetched and compiled once for the whole app (`src/lib/useGlossary.js`), so the cost is one fetch and one regex no matter how many passages render.

## Adding a Category

Author entries under a new `content/glossary/<category>/` folder with a consistent `category:` frontmatter value. The Glossary page groups the Knowledge view by that value automatically, so no registry change is needed.
