/*
  The Watch-cycle digest: a cited, sanitized, Opus-written paraphrase of the most salient
  information across the latest educator videos, a complement to the 6-hour ingestion. It
  is idempotent: the result is cached on a hash of the latest-video set, so a cycle with no
  new videos reuses the last digest and pays nothing, matching the content-hash gating used
  across the pipeline and the daily briefing it mirrors (worker/pipeline/briefing.mjs).
  Recommended (inner-circle) videos are surfaced first so the model leads with them.

  Two entry points share one generator:
    - run.mjs calls generateWatchDigest(state) after the creators/directory build.
    - the CLI (node worker/pipeline/watch_digest.mjs) rebuilds state from the committed
      corpus (worker/.cache/items.json) plus the registry, and writes digests/watch.json,
      so the seed can be refreshed without the full pipeline.

  See docs/FEATURE_PLAYBOOK.md and the Citation Contract in docs/RAG.md.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { structured, MODELS } from "../lib/anthropic.mjs";
import { stripEmDashes } from "../lib/text.mjs";
import { loadCache, saveCache } from "../lib/cache.mjs";
import { hash16, slugify } from "../lib/hash.mjs";
import { WATCH_DIGEST_SYSTEM, WATCH_DIGEST_TOOL, buildWatchDigestPrompt } from "./prompts/watch_digest.mjs";

export const WATCH_DIGEST_PROMPT_VERSION = "v1-2026-06-09";
const MAX_VIDEOS = 14;
const humanize = (slug) => String(slug).replace(/-/g, " ");
const norm = (s) => String(s || "").trim().toLowerCase();

// The latest youtube videos from a corpus item list, newest first, each tagged with the
// inner-circle flag (the registry marks recommended by channel_id; the corpus item carries
// the channel name, so the join is by normalized name, as directory.mjs does). Pure.
export function recentVideos(items = [], registry = { channels: [] }, limit = 40) {
  const recByName = new Set(
    (registry.channels || []).filter((c) => c.recommended === true).map((c) => norm(c.name))
  );
  return (items || [])
    .filter((it) => it && it.source === "youtube" && it.title && it.url)
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
    .slice(0, limit)
    .map((it) => ({ ...it, recommended: recByName.has(norm(it.author_or_channel)) }));
}

// Normalize the latest videos into the compact state the model writes from, and build the
// concept vocabulary (real slugs plus labels) the digest may cite. Recommended videos sort
// first (so the model leads with the inner circle), then by recency; capped at MAX_VIDEOS.
export function buildWatchDigestState({ videos = [] } = {}) {
  const v = (videos || [])
    .map((it) => ({
      title: it.title || "",
      channel: it.author_or_channel || "",
      url: it.url || "",
      published_at: it.published_at || "",
      summary: it.summary || "",
      concepts: (Array.isArray(it.concepts) ? it.concepts : []).map((c) => slugify(c)).filter(Boolean),
      recommended: it.recommended === true,
    }))
    .filter((it) => it.title && it.url)
    .sort((a, b) => Number(b.recommended) - Number(a.recommended) || new Date(b.published_at || 0) - new Date(a.published_at || 0))
    .slice(0, MAX_VIDEOS);

  const vocab = new Map();
  for (const it of v) for (const slug of it.concepts) if (slug && !vocab.has(slug)) vocab.set(slug, humanize(slug));
  const concepts = [...vocab.entries()].slice(0, 32).map(([slug, label]) => ({ slug, label }));
  return { videos: v, concepts };
}

// Hash the video set (urls plus the inner-circle flag) and the prompt version, so the
// digest only regenerates when the latest videos change ("if applicable, because there are
// new videos"). An unchanged cycle returns the cached result with no model call.
export function stateHash(state) {
  const sig = JSON.stringify({
    v: state.videos.map((it) => [it.url, it.recommended ? 1 : 0]),
    pv: WATCH_DIGEST_PROMPT_VERSION,
  });
  return hash16(sig);
}

export async function generateWatchDigest(state, { model = MODELS.enduring } = {}) {
  const cache = loadCache("watch_digest");
  const h = stateHash(state);
  if (cache.hash === h && cache.result) return cache.result;

  // No videos: emit a quiet digest so the card stays honest and the renderer hides it.
  if (!state.videos.length) {
    const quiet = { headline: "", body: "", cited_concepts: [], cited_items: [], model: null, prompt_version: WATCH_DIGEST_PROMPT_VERSION };
    saveCache("watch_digest", { hash: h, result: quiet });
    return quiet;
  }

  let out;
  try {
    out = await structured({ model, system: WATCH_DIGEST_SYSTEM, prompt: buildWatchDigestPrompt(state), tool: WATCH_DIGEST_TOOL, maxTokens: 700 });
  } catch (e) {
    console.error(`watch digest: ${e.message}`);
    return cache.result || null;
  }

  const vocab = new Map(state.concepts.map((c) => [c.slug, c.label]));
  const headline = stripEmDashes(String(out.headline || "").replace(/\s+/g, " ").trim());
  const body = stripEmDashes(String(out.body || "").replace(/[ \t]+/g, " ").trim());
  const cited_concepts = (Array.isArray(out.concepts) ? out.concepts : [])
    .filter((slug) => vocab.has(slug))
    .filter((slug, i, arr) => arr.indexOf(slug) === i)
    .slice(0, 8)
    .map((slug) => ({ slug, label: vocab.get(slug) }));
  // Resolve the body's inline [n] markers (what the renderer actually shows) to their source
  // videos, in reading order. Deriving from the rendered body, not the model's optional
  // item_refs, guarantees every marker maps to a linked source. Dedup by url. `n` keeps the
  // original video index so the renderer's citeMap matches the marker.
  const bodyRefs = [];
  body.replace(/\[(\d+)\]/g, (_, d) => {
    const i = Number(d);
    if (!bodyRefs.includes(i)) bodyRefs.push(i);
    return _;
  });
  const seenUrl = new Set();
  const cited_items = bodyRefs
    .filter((i) => state.videos[i] && state.videos[i].url)
    .map((i) => ({ n: i, ...state.videos[i] }))
    .filter((it) => (seenUrl.has(it.url) ? false : seenUrl.add(it.url)))
    .slice(0, MAX_VIDEOS)
    .map((it) => ({ n: it.n, title: it.title, url: it.url, author_or_channel: it.channel }));

  const result = { headline, body, cited_concepts, cited_items, model, prompt_version: WATCH_DIGEST_PROMPT_VERSION };
  saveCache("watch_digest", { hash: h, result });
  return result;
}

// ----- CLI: rebuild state from the committed corpus + registry, write digests/watch.json -----

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, "../../public/data");
const ITEMS = resolve(HERE, "../.cache/items.json");
const REGISTRY = resolve(HERE, "../../sources/youtube_channels.json");
const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};

export async function writeWatchDigestFromCorpus({ generated } = {}) {
  const stamp = generated || new Date().toISOString().slice(0, 10);
  const store = readJson(ITEMS, {});
  const registry = readJson(REGISTRY, { channels: [] });
  const videos = recentVideos(Object.values(store), registry);
  const state = buildWatchDigestState({ videos });
  const result = await generateWatchDigest(state);
  if (result) {
    mkdirSync(resolve(DATA, "digests"), { recursive: true });
    writeFileSync(resolve(DATA, "digests/watch.json"), `${JSON.stringify({ generated: stamp, ...result }, null, 2)}\n`);
    console.log(`watch digest: ${result.headline || "(quiet)"}`);
  }
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  writeWatchDigestFromCorpus().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
