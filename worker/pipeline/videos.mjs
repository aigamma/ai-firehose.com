/*
  Per-video artifacts for the (video-first) Watch surface: a slim grid index and a per-video
  page payload (embed metadata, an agentic write-up, the concepts it covers, and the nearest
  videos by cosine similarity). This is the fully-RAG-integrated Watch path
  (docs/FEATURE_PLAYBOOK.md); the "Similar" rail is the embedding substrate applied to videos.

  - Similar (cosine): the retained videos are embedded in one Voyage batch and compared
    pairwise (reusing network.mjs:computeNeighbors), so each video links to its nearest peers.
  - Write-ups: a short Opus 4.8 explainer per video, richer than the classifier summary,
    REUSED from the committed per-video JSON when the video's content is unchanged (the
    served artifact is its own durable store, so a clone-fresh worker run does not re-pay for
    them) and capped at WRITEUP_MAX new generations per run, so the backfill is bounded and
    the scheduled runs complete it over time. Grounded and sanitized (worker/lib/text.mjs).

  Worker-only and keyed (Voyage + Opus): run by run.mjs after the creators/directory build,
  or via the CLI. NOT a keyless prebuild step (that would wipe write-ups and neighbors on
  every deploy), like the briefing and the Watch digest. Writes public/data/videos/index.json
  and public/data/videos/<id>.json.
*/
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { embed } from "../lib/voyage.mjs";
import { structured, MODELS } from "../lib/anthropic.mjs";
import { stripEmDashes } from "../lib/text.mjs";
import { hash16, slugify } from "../lib/hash.mjs";
import { computeNeighbors } from "./network.mjs";
import { loadShortIds } from "../sources/youtube_shorts.mjs";
import { VIDEO_WRITEUP_SYSTEM, VIDEO_WRITEUP_TOOL, buildVideoWriteupPrompt } from "./prompts/video_writeup.mjs";

export const VIDEO_WRITEUP_PROMPT_VERSION = "v1-2026-06-09";
const WRITEUP_MAX = Number(process.env.VIDEO_WRITEUP_MAX) || 40;
const SIMILAR_K = 6;
const norm = (s) => String(s || "").trim().toLowerCase();
const channelUrl = (handle) => (handle ? `https://www.youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}` : "");
// The content hash that gates a write-up regeneration: change the title, summary, concepts,
// or the prompt version and the explainer is rewritten; otherwise the committed one is reused.
const writeupHash = (v) => hash16(JSON.stringify([v.title, v.summary, v.concepts.map((c) => c.slug), VIDEO_WRITEUP_PROMPT_VERSION]));

// Retained youtube videos from the corpus, newest first, with concepts and the inner-circle
// flag joined from the registry (by normalized channel name, as directory.mjs joins).
export function selectVideos(items = [], registry = { channels: [] }, shortIds = new Set()) {
  const recByName = new Set((registry.channels || []).filter((c) => c.recommended === true).map((c) => norm(c.name)));
  const handleByName = new Map((registry.channels || []).map((c) => [norm(c.name), c.handle]));
  return (items || [])
    // Explicit Watch-layer guard: never surface a confirmed Short, even if one slipped
    // into the corpus (the store guard in run.mjs should already have dropped it).
    .filter((it) => it && it.source === "youtube" && it.source_id && it.title && !shortIds.has(it.source_id))
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
    .map((it) => ({
      id: it.source_id,
      title: it.title,
      channel: it.author_or_channel || "",
      channelUrl: channelUrl(handleByName.get(norm(it.author_or_channel))),
      published: it.published_at || null,
      kind: it.kind || null,
      summary: it.summary || "",
      concepts: (Array.isArray(it.concepts) ? it.concepts : []).map((c) => ({ slug: slugify(c), label: String(c) })).filter((c) => c.slug),
      recommended: recByName.has(norm(it.author_or_channel)),
    }));
}

// Per-video nearest neighbors by cosine over a fresh Voyage embedding of each video's text.
async function similar(videos) {
  if (videos.length < 2) return {};
  let vecs;
  try {
    vecs = await embed(videos.map((v) => `${v.title}\n\n${v.summary}`.trim()), "document");
  } catch (e) {
    console.error(`video similar: embed failed ${e.message}`);
    return {};
  }
  const nodes = videos.map((v, i) => ({ id: v.id, label: v.title, vec: vecs[i] })).filter((n) => Array.isArray(n.vec));
  const byId = new Map(videos.map((v) => [v.id, v]));
  const out = {};
  for (const [id, list] of Object.entries(computeNeighbors(nodes, { k: SIMILAR_K }))) {
    out[id] = list.map((n) => ({ id: n.id, title: byId.get(n.id)?.title || n.label, channel: byId.get(n.id)?.channel || "", score: n.score }));
  }
  return out;
}

// A short Opus explainer per video. Reuses the prior committed write-up when the content hash
// is unchanged; otherwise regenerates, capped at WRITEUP_MAX new generations per call.
async function writeups(videos, priorById, { model = MODELS.enduring } = {}) {
  let budget = WRITEUP_MAX;
  const out = {};
  for (const v of videos) {
    const h = writeupHash(v);
    const prior = priorById.get(v.id);
    if (prior && prior.writeup && prior.wh === h) {
      out[v.id] = prior.writeup;
      continue;
    }
    if (budget <= 0) {
      if (prior?.writeup) out[v.id] = prior.writeup; // keep the stale one until a later run rewrites it
      continue;
    }
    budget -= 1;
    try {
      const res = await structured({
        model,
        system: VIDEO_WRITEUP_SYSTEM,
        prompt: buildVideoWriteupPrompt({ title: v.title, channel: v.channel, summary: v.summary, concepts: v.concepts.map((c) => c.label) }),
        tool: VIDEO_WRITEUP_TOOL,
        maxTokens: 400,
      });
      const writeup = stripEmDashes(String(res.writeup || "").replace(/\s+/g, " ").trim());
      out[v.id] = writeup || prior?.writeup || "";
    } catch (e) {
      console.error(`video writeup ${v.id}: ${e.message}`);
      if (prior?.writeup) out[v.id] = prior.writeup;
    }
  }
  return out;
}

export async function buildVideos({ generated, items, registry, priorById = new Map(), live = true, shortIds = new Set() } = {}) {
  const stamp = generated || new Date().toISOString().slice(0, 10);
  const videos = selectVideos(items, registry, shortIds);
  const sim = live ? await similar(videos) : {};
  const writeupById = live ? await writeups(videos, priorById) : {};

  const index = videos.map((v) => ({
    id: v.id, title: v.title, channel: v.channel, channelUrl: v.channelUrl,
    published: v.published, kind: v.kind, summary: v.summary, recommended: v.recommended,
  }));
  const pages = videos.map((v) => ({
    id: v.id, title: v.title, channel: v.channel, channelUrl: v.channelUrl,
    published: v.published, kind: v.kind, recommended: v.recommended,
    summary: v.summary,
    writeup: writeupById[v.id] || "",
    wh: writeupHash(v), // gates the next run's reuse
    concepts: v.concepts,
    similar: sim[v.id] || [],
  }));
  return { index: { generated: stamp, count: index.length, videos: index }, pages };
}

// ----- IO: read priors, write the artifacts (worker run + CLI) -----
const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, "../../public/data");
const VIDEO_DIR = resolve(DATA, "videos");
const ITEMS = resolve(HERE, "../.cache/items.json");
const REGISTRY = resolve(HERE, "../../sources/youtube_channels.json");
const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};

// The committed per-video JSONs are the durable write-up store: load them so a clone-fresh
// run reuses prior write-ups (by content hash) instead of re-paying Opus for every video.
function loadPriors() {
  const map = new Map();
  try {
    for (const f of readdirSync(VIDEO_DIR)) {
      if (f.endsWith(".json") && f !== "index.json") {
        const p = readJson(resolve(VIDEO_DIR, f), null);
        if (p && p.id) map.set(p.id, { writeup: p.writeup, wh: p.wh });
      }
    }
  } catch {}
  return map;
}

export async function writeVideos(opts = {}) {
  const items = opts.items || Object.values(readJson(ITEMS, {}));
  const registry = opts.registry || readJson(REGISTRY, { channels: [] });
  const priorById = loadPriors();
  const shortIds = opts.shortIds || loadShortIds();
  const { index, pages } = await buildVideos({ generated: opts.generated, items, registry, priorById, live: opts.live !== false, shortIds });

  mkdirSync(VIDEO_DIR, { recursive: true });
  writeFileSync(resolve(VIDEO_DIR, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  const keep = new Set(["index.json"]);
  for (const p of pages) {
    writeFileSync(resolve(VIDEO_DIR, `${p.id}.json`), `${JSON.stringify(p, null, 2)}\n`);
    keep.add(`${p.id}.json`);
  }
  let pruned = 0;
  try {
    for (const f of readdirSync(VIDEO_DIR)) if (f.endsWith(".json") && !keep.has(f)) { rmSync(resolve(VIDEO_DIR, f)); pruned += 1; }
  } catch {}
  console.log(`videos: ${index.count} indexed, ${pages.filter((p) => p.writeup).length} with write-ups, ${pruned} pruned`);
  return { index, pages };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  writeVideos().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
