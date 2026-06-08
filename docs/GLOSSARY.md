# Glossary: The Durable Knowledge Layer

The glossary has two layers with opposite lifecycles, and that split is the point.

- **Durable knowledge** (authored): foundational, advanced, and exotic AI, mathematics, and philosophy-of-mind concepts, written by a human and by Opus at full strength. It is the permanent learning resource, and it never expires.
- **Trending taxonomy** (corpus-derived): concepts the classifier discovers in the rolling-quarter firehose. It turns over every quarter by the retention contract.

The two meet on one surface: every concept, durable or trending, has a hub at `/technique/<slug>`, appears in the glossary index, and participates in the wiki-style auto-linking that meshes the whole site together.

## Authoring Durable Entries

Source of truth: `content/glossary/<category>/<slug>.md`, one Markdown file per concept, frontmatter plus body. The full format is in `content/glossary/README.md`; the canonical examples are `content/glossary/optimization/gradient-descent.md`, `geometry/geodesic.md`, and `transformers/self-attention.md`.

Authoring is interactive and Opus-authored: open a console (Claude Code) and ask, or dictate, and Opus writes the entry at full strength into `content/glossary/`. This is deliberate. The autonomous worker pipeline runs cheap models (Haiku classification, Sonnet briefing) for the transient layer; durable content that sticks gets the strongest model, because it is read for years, not a day. Width first, then enrichment: the first pass aims for broad coverage, and entries are deepened later with more passes, the author's own work, and images.

**Voice (earned vividness).** The writing rules in `content/glossary/README.md` define the content voice and are the contract every entry meets: open on the problem, tension, consequence, or reframing a concept resolves (never a copular dictionary definition like "X is a type of..."), present the mechanism as deliberate choices with reasons, carry exactly one memorable keeper (an analogy that explains, a surprising consequence, or an honestly named limit), and end on an insight rather than a list. The spare "no hype, no filler, no ornament" register used elsewhere in the project is the operational/engine voice and does not govern this content. A quality-elevation pass read all entries against this bar and rewrote the roughly twenty famous-foundational entries that had a formulaic dictionary treatment, leaving the rest untouched as already strong. The read-only `scripts/glossary_triage.mjs` is a prioritization hint (it flags thin and copular-lead entries by regex), not a verdict: most flagged entries turned out strong, so the judgment is always made by reading the prose.

**Sources sidecar.** `content/glossary/sources.json` maps a slug to the primary sources a rewrite consulted (paper, textbook, explainer such as 3Blue1Brown or the Stanford Encyclopedia of Philosophy), a committed head start for the human citation pass. It is not yet read by the build; it is a curation aid, the prose-sourcing analogue of the `content/glossary/images.json` figure sidecar.

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

`scripts/lib/atlas.mjs` is a pure, deterministic builder (no RNG, no `Date`, no I/O, so it satisfies the determinism-in-precompute contract and is unit-tested in `scripts/lib/atlas.test.mjs`). It runs inside `build_glossary` and emits `public/data/glossary/atlas.json`. The grain is the CATEGORY, not the concept, on purpose: 33 sized, linked category nodes are navigable where a 610-node hairball is not. For each category it records the concept count, kind mix, internal-link cohesion, and top concepts; it then walks the `related` mesh to weight undirected cross-category edges. Positions are precomputed on a unit circle (ordered by count, then name), so the client is a dumb plotter. The `related` cross-link gate (`check_glossary.mjs`) guarantees no dangling edges, so the graph is clean by construction.

`src/pages/Glossary.jsx` renders it as a fourth view alongside Knowledge, Trending, and All. The SVG constellation is the visual (nodes colored by a stable hue, sized by count; curved edges whose opacity and width scale with link weight; hovering cross-highlights a node and its edges). The readable, keyboard-accessible, clickable HTML legend below is the accessible equivalent and the filter control: clicking a category, in the legend or the constellation, drops into that category's focused Knowledge list. The map is desktop-first; on narrow screens the constellation scales down and the legend carries the interaction.

## Durability Contract

- Authored entries carry `durable: true` and `source: "authored"`. The retention prune (keyed on `published_at`) only touches corpus items and vectors; it never removes a durable hub. A durable concept with no items in the window simply shows no trending signal, not a deletion.
- A durable entry shares a slug with a corpus concept when the field is actively discussing it (for example `retrieval-augmented-generation`). The hub then shows both: the authored body, and the live momentum and recent items.

## Folding Discovered Duplicates onto the Durable Layer

The AI-grown resolver dedupes a discovered concept only against the corpus taxonomy, and `build_glossary` merges a corpus hub into an authored entry only on an exact slug match, so surface variants of a durable concept ("AI agents", "LLMs", "multi-agent systems") spawn their own thin hubs and fragment the trend boards. `scripts/fold_corpus_concepts.mjs` closes that gap on the committed snapshot: for each non-durable corpus concept whose normalized surface (case, spacing, punctuation, and one conservative plural fold) matches a durable concept's slug, title, or alias, it merges the duplicate's attention and items into the authored hub, leaves a redirect stub at the old slug (the client follows `redirect` in `src/pages/TechniqueHub.jsx`), drops the duplicate from the index, and de-fragments the boards so one concept is one row. The matcher (`scripts/lib/fold.mjs`) is pure and unit-tested (`scripts/lib/fold.test.mjs`), favors precision over recall (an ambiguous surface claimed by two durable concepts is never folded), and reports every fold for audit. It is idempotent (a removed duplicate is never reprocessed), and `build_glossary` preserves the folded state on every rebuild. The durable fix, making the worker resolve discovered concepts against the durable layer so future runs do not re-fragment, is tracked in `docs/ROADMAP.md`.

## Wiki-Style Auto-Linking (the deep mesh)

`src/lib/richtext.js` (pure, unit-tested) compiles the glossary index into one boundary-anchored, longest-first matcher over every concept label and alias. `src/components/RichText.jsx` renders prose (authored hub bodies and the daily briefing) with:

- inline Markdown (bold, italic, code, links),
- numbered `[n]` citations (the briefing),
- and a link on the first mention of any glossary term to its hub, Wikipedia-style, never linking a term to its own page.

Labels are authoritative: a concept's own name always wins the surface form over another concept's alias (`self-attention` links to its own hub even if `attention-mechanism` lists it as an alias). Aliases then fill in only the surfaces no label took, first writer wins, so an alias claimed by two or more concepts with NO label owner would auto-link that term to whichever concept sorts first, a silent, arbitrary mislink. `check_glossary.mjs` (`findAmbiguousAliases`) fails the suite on that case, so every surface form keeps one owner; when an acronym genuinely names two distinct concepts (ANN, SSL) it is dropped from both rather than linked to one. The matcher is fetched and compiled once for the whole app (`src/lib/useGlossary.js`), so the cost is one fetch and one regex no matter how many passages render.

The links are rendered bold and colored by the KIND of concept they point to (technique indigo, tool teal, opinion pink, the accent otherwise; the matcher carries each concept's `kind`). Dense prose then reads as a navigable colored mesh rather than a wall of grey terminal text, and the color encodes meaning, the project ethos. Concept hubs key their accent rail, serif definition, heading rails, and Related chips off the concept's kind color (`--tile-accent`).

## The Glossary in Retrieval (RAG)

The durable entries are embedded into the same Pinecone space as the corpus (`worker/pipeline/embed_glossary.mjs`, voyage-3, 1024-dim), so the live semantic search is aware of the knowledge layer. A query like "what is a geodesic" returns the Geodesic hub; "the free energy principle" blends the authored hub with any trending item on the topic, in one ranked list. Vectors use `glossary::<slug>` ids and carry `{ title, url: /technique/<slug>, kind, summary, text, durable, source: "glossary", content_hash }` metadata, so a result links straight into the hub (the search UI navigates internal `/technique/` urls in-app) and Voyage rerank can score the full trimmed entry text rather than only the definition snippet. The step runs in `run.mjs` right after the glossary merge, and standalone with `node --env-file=worker/.env.local worker/pipeline/embed_glossary.mjs`.

The daily sync is hash-gated by `worker/.cache/vector_manifest.json`. New or changed durable entries embed and upsert, metadata-only changes call Pinecone update, unchanged entries skip Voyage, and stale durable ids are deleted only when they disappear from the committed glossary. The old pattern, re-embedding every durable entry or listing the whole Pinecone index every run, is reserved for manual recovery because it can waste Voyage spend and Pinecone read units.

## Cited Images

Each hub can carry a cited, illustrative figure, chosen to teach the concept's defining insight (a geodesic shown as a great circle on a sphere, the curved analogue of a straight line), not to decorate. The hub is a centered reading column (`.hub-page`, worldthought.com style) rather than prose pinned to the left of a wide shell.

**Self-hosted, not hotlinked.** Visuals are downloaded into `public/images/glossary/<slug>.<ext>` and served same-origin, the worldthought pattern. Self-hosting is what lets the project source from a wide variety of open providers (rather than only the Wikipedia article lead image) and means an image can never break from a host's hotlink protection or link rot. Because images are same-origin, the CSP needs no per-host grant (the legacy `upload.wikimedia.org` grant in `netlify.toml` is now harmless, not load-bearing).

**The sidecar.** One curatable file, `content/glossary/images.json`, maps slug to `{ file, alt, caption, credit, license, license_url, source, provider }`. The build (`scripts/build_glossary.mjs`, `resolveImage`) attaches the record to the matching hub and resolves the served `src` (`/images/glossary/<file>`, with a legacy `url` as fallback). An entry with no row simply has no figure; scaling coverage is adding rows.

**The component.** `src/components/GlossaryFigure.jsx` renders the figure centered on a white pad (so transparent or dark-on-clear diagrams stay legible on the dark theme), with a teaching `caption` and a credit line that names the `provider`, `credit` (author), and `license` (linked to its deed) and points to the `source` page: that is the citation, satisfying CC attribution. Click or keyboard-enter enlarges it in a lightbox; a missing file renders nothing rather than a broken image.

**The toolchain (`scripts/glossary_images.mjs`).** A committed, idempotent CLI: `search <query>` queries Wikimedia Commons (File namespace) and prints license-filtered candidates with a direct `download_url`, author, and license; `fetch <url> <out>` downloads one candidate for visual inspection; `finalize` merges `images.json` with any `content/glossary/_img_stage/*.json` staging files (written by the curation subagents), downloads each chosen image, validates it is real image bytes of a sane size (magic-byte sniff, 1.2KB to 4.5MB), and rewrites `images.json` with `file` pointers. `finalize` is the non-LLM oracle behind the figures: a row is a claim, a validated file on disk is the evidence. Idempotent (an unchanged, on-disk, valid file is not re-fetched).

**Variety and licensing.** Source from many open providers: Wikimedia Commons searched deeply (animations, plots, schematics, historical drawings, photos), plus scikit-learn (BSD), Our World in Data (CC BY), public-domain and government archives, and CC-licensed papers. Only redistributable licenses are accepted (public domain, CC0, CC BY, CC BY-SA); non-commercial, no-derivatives, and non-free are rejected (`licenseOk`). The `provider` field records the spread so coverage variety is auditable. External author names are em-dash-sanitized (`cleanCredit`) so provider metadata cannot trip the writing-rule gate; authored captions and alt are scanned by the gate (`content/glossary/images.json` is in `scripts/check_no_emdash.mjs`).

## Adding a Category

Author entries under a new `content/glossary/<category>/` folder with a consistent `category:` frontmatter value. The Glossary page groups the Knowledge view by that value automatically, so no registry change is needed.
