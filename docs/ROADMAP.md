# AI Firehose: Roadmap and Backlog

The prioritized backlog of what to build next. This is the fuel for continuous, autonomous development. A build session (in-turn parallel subagents, or a `/schedule` cron) reads this file plus `CLAUDE.md` and `LESSONS_LEARNED.md`, pulls the top unblocked item, ships it end to end, verifies against oracles (`npm test` green, the three gate scripts exit 0, `npx vite build` clean), commits with a verbose message, then checks the item off here and adds anything it discovered. Run to completion: keep going until the unblocked list is empty or a hard blocker appears, and do not stop to ask between items.

Items that need Eric (credentials, deploys, pushes) are quarantined at the bottom and must not be done autonomously.

## P1: Unblocked Work (Ship Autonomously)

- [ ] Trim served-artifact payloads (the "ship only what a page renders" rule). DONE this session: the attention boards now ship only id, label, attention, delta, sparkline, and a two-flag outlier (`worker/pipeline/boards.mjs`), reshaped via `worker/pipeline/recompute_boards.mjs`, 49 percent smaller with no value drift. NOT viable: the digest `movers` and `outliers` are read by the MCP `whats_new` tool and the `integrity.test` referential check, so they are not dead weight (a reminder to audit every consumer, not just `src/`). REMAINING: split a slim wiki-link matcher index from the heavy glossary `index.json` so `def_snippet`, the largest single payload, does not load on every route.
- [ ] Scope the `riseIn` entrance animation in `src/styles/theme.css` to the Home page only, so it stops re-firing on every route navigation. Keep the reduced-motion handling.
- [ ] Expand worker test coverage: `transcript` caption parsing, `briefing` state-hash idempotency, each source adapter's normalized item shape, and `boards` versus `recompute_boards` parity.
- [ ] Regenerate `mcp/package-lock.json` to drop the `ai-firehose` file self-dependency that creates the node_modules symlink loop: from the `mcp/` directory, remove `node_modules` and the lockfile, then reinstall.
- [ ] Deepen and illustrate the durable glossary entries: more QA passes on the authored Markdown under `content/glossary/`, and expand the cited-image sidecar `content/glossary/images.json`. Parallelizable, one agent per category.

## P2: Unblocked, Judgment Calls

- [ ] Add doc-accuracy gates for model tiers and counts, made tolerant of phrasing so they do not false-positive on "over 450". Assert each `MODELS` tier name co-occurs with its tier word in `CLAUDE.md`; assert count claims match the durable count in the served glossary index and the category count in the served atlas.
- [ ] SEO: add a real 1200 by 630 social card image and reference it as `og:image` and `twitter:image`, then raise `twitter:card` to a large summary. The canonical link and the theme-color sync already shipped.
- [ ] Build an X (Twitter) source adapter following the uniform shape of the existing `worker/sources/` adapters (a stretch goal noted in `CLAUDE.md`). Respect rate limits and give it a low `source_authority_weight` so it enriches without distorting the trend ranking.

## Needs Eric (Do Not Do Autonomously)

- [ ] Deploy the Fly worker. This turns on the daily data refresh and is the single most important pending item. Needs a Fly account and secrets.
- [ ] Push `main` (which auto-deploys via Netlify) and publish or republish the `mcp` package to npm. Pushes are Eric's call under the push-sparingly rule.

## Recently Shipped

- Doc-drift and small-defect pass (commit 50aa0c0): the Python overstatement, the Sonnet versus Opus briefing comment, the stale 356 count, the removed `trail` field, the MCP `define` related-mesh bug, and the Explore spectrum-dot accessible name.
- Robustness and continuity batch: the `useData` empty-versus-error fix for the Netlify SPA fallback, theme-color that tracks the active theme, a canonical link, the Pinecone readiness guard, the Hugging Face id-less skip, the definitions-cache prune, the `publish.sh` required-env guard, the tree-to-doc anti-staleness gate, the `mcp/` subsystem documented, and this ROADMAP.
- Payload trim: the served attention boards now ship only the fields TrendBoard renders (`worker/pipeline/boards.mjs` plus the 12 reshaped board files), 49 percent smaller, with no value drift.
