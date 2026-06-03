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
- Attaches a cited image to the hub when the slug appears in the `content/glossary/images.json` sidecar (see Cited Images).
- Emits `public/data/glossary/atlas.json`, the category-level knowledge graph (see The Atlas View), in the same pass, so the map can never drift from the hubs it summarizes.
- Idempotent and re-runnable.

The build is the self-healing mechanism for the durable layer: because `content/glossary` is the committed source of truth and `build_glossary` runs on every Netlify deploy (`prebuild`) and at the end of the worker's glossary step (`run.mjs`), a corpus rebuild can never permanently drop the authored entries. They are re-merged every time.

## The Atlas View (the category constellation)

The authored `related` mesh is a real knowledge graph, but it was only ever visible one hub at a time. The Atlas view makes the SHAPE of the whole knowledge base legible at a glance, which is the project's north star: turn a firehose into something navigable.

`scripts/lib/atlas.mjs` is a pure, deterministic builder (no RNG, no `Date`, no I/O, so it satisfies the determinism-in-precompute contract and is unit-tested in `scripts/lib/atlas.test.mjs`). It runs inside `build_glossary` and emits `public/data/glossary/atlas.json`. The grain is the CATEGORY, not the concept, on purpose: ~31 sized, linked category nodes are navigable where a 453-node hairball is not. For each category it records the concept count, kind mix, internal-link cohesion, and top concepts; it then walks the `related` mesh to weight undirected cross-category edges. Positions are precomputed on a unit circle (ordered by count, then name), so the client is a dumb plotter. The `related` cross-link gate (`check_glossary.mjs`) guarantees no dangling edges, so the graph is clean by construction.

`src/pages/Glossary.jsx` renders it as a fourth view alongside Knowledge, Trending, and All. The SVG constellation is the visual (nodes colored by a stable hue, sized by count; curved edges whose opacity and width scale with link weight; hovering cross-highlights a node and its edges). The readable, keyboard-accessible, clickable HTML legend below is the accessible equivalent and the filter control: clicking a category, in the legend or the constellation, drops into that category's focused Knowledge list. The map is desktop-first; on narrow screens the constellation scales down and the legend carries the interaction.

## Durability Contract

- Authored entries carry `durable: true` and `source: "authored"`. The retention prune (keyed on `published_at`) only touches corpus items and vectors; it never removes a durable hub. A durable concept with no items in the window simply shows no trending signal, not a deletion.
- A durable entry shares a slug with a corpus concept when the field is actively discussing it (for example `retrieval-augmented-generation`). The hub then shows both: the authored body, and the live momentum and recent items.

## Wiki-Style Auto-Linking (the deep mesh)

`src/lib/richtext.js` (pure, unit-tested) compiles the glossary index into one boundary-anchored, longest-first matcher over every concept label and alias. `src/components/RichText.jsx` renders prose (authored hub bodies and the daily briefing) with:

- inline Markdown (bold, italic, code, links),
- numbered `[n]` citations (the briefing),
- and a link on the first mention of any glossary term to its hub, Wikipedia-style, never linking a term to its own page.

Labels are authoritative: a concept's own name always wins the surface form over another concept's alias (`self-attention` links to its own hub even if `attention-mechanism` lists it as an alias). Aliases then fill in only the surfaces no label took, first writer wins, so an alias claimed by two or more concepts with NO label owner would auto-link that term to whichever concept sorts first, a silent, arbitrary mislink. `check_glossary.mjs` (`findAmbiguousAliases`) fails the suite on that case, so every surface form keeps one owner; when an acronym genuinely names two distinct concepts (ANN, SSL) it is dropped from both rather than linked to one. The matcher is fetched and compiled once for the whole app (`src/lib/useGlossary.js`), so the cost is one fetch and one regex no matter how many passages render.

The links are rendered bold and colored by the KIND of concept they point to (technique indigo, tool teal, opinion pink, the accent otherwise; the matcher carries each concept's `kind`). Dense prose then reads as a navigable colored mesh rather than a wall of grey terminal text, and the color encodes meaning, the project ethos. Concept hubs key their accent rail, serif definition, heading rails, and Related chips off the concept's kind color (`--tile-accent`).

## The Glossary in Retrieval (RAG)

The durable entries are embedded into the same Pinecone space as the corpus (`worker/pipeline/embed_glossary.mjs`, voyage-3, 1024-dim), so the live semantic search is aware of the knowledge layer. A query like "what is a geodesic" returns the Geodesic hub; "the free energy principle" blends the authored hub with any trending item on the topic, in one ranked list. Vectors use `glossary::<slug>` ids and carry `{ title, url: /technique/<slug>, kind, summary, durable, source: "glossary" }` metadata, so a result links straight into the hub (the search UI navigates internal `/technique/` urls in-app). The corpus retention reconcile in `run.mjs` skips the `glossary::` prefix, so the knowledge vectors persist with the durable layer instead of being pruned as "not in the retained store". The step runs in `run.mjs` right after the glossary merge, and standalone with `node --env-file=worker/.env.local worker/pipeline/embed_glossary.mjs`. Idempotent: stable ids, re-running overwrites in place.

## Cited Images

Visuals live in one curatable sidecar, `content/glossary/images.json`, mapping slug to `{ url, alt, credit, source }`, rather than in hundreds of frontmatters. The build attaches the record to the matching hub, and the hub renders a lead figure with the image on a white pad (so transparent or black-on-clear Wikimedia diagrams stay legible on the dark theme) and a caption that links to the `source` page: that link is the citation. Images are hotlinked from Wikimedia Commons, so `upload.wikimedia.org` is allowlisted in the `netlify.toml` CSP `img-src` (external images are otherwise blocked in production, the lesson from the Watch surface). Scaling coverage is just adding rows; an entry with no row simply has no figure. Sourced by querying the Wikipedia REST API for genuinely illustrative diagrams and keeping only the strong ones.

## Adding a Category

Author entries under a new `content/glossary/<category>/` folder with a consistent `category:` frontmatter value. The Glossary page groups the Knowledge view by that value automatically, so no registry change is needed.
