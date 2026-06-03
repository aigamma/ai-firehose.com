/*
  The agentic daily briefing: a short, cited, sanitized prose summary of what is
  new and breaking out in each time window. This is the flagship agentic-summary
  feature, mirroring aigamma.com's narrator (Haiku for cheap passes, an Opus 4.8
  synthesis for the prose), grounded in the window's own movers, breakouts, and new
  items, and sanitized through worker/lib/text.mjs. It is idempotent: the result is
  cached on a hash of the window state, so a run with unchanged data reuses the last
  briefing and pays nothing, matching the content-hash gating used across the
  pipeline. See docs/FEATURE_PLAYBOOK.md and the Citation Contract in docs/RAG.md.

  Two entry points share one generator:
    - run.mjs calls generateBriefing(state) in the digest loop (richest state).
    - the CLI (node worker/pipeline/briefing.mjs) rebuilds state from the committed
      artifacts and writes the briefing_<horizon>.json files, so the seed can be
      refreshed without the full pipeline.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { structured, MODELS } from "../lib/anthropic.mjs";
import { stripEmDashes } from "../lib/text.mjs";
import { loadCache, saveCache } from "../lib/cache.mjs";
import { hash16 } from "../lib/hash.mjs";
import { HORIZONS, KINDS } from "../../src/data/registry.js";
import { BRIEFING_SYSTEM, BRIEFING_TOOL, buildBriefingPrompt } from "./prompts/briefing.mjs";

export const BRIEFING_PROMPT_VERSION = "v1-2026-06-02";

const humanize = (slug) => String(slug).replace(/-/g, " ");

// Normalize a window's raw movers, outliers, and new items into the compact state
// the model writes from, and build the concept vocabulary (real slugs plus labels)
// the briefing is allowed to cite.
export function buildBriefingState({ horizon, horizonLabel, movers = [], outliers = [], newItems = [] }) {
  const m = movers.map((e) => ({ id: e.id, kind: e.kind, label: e.label, ratio: e.ratio, momentum: e.momentum, quadrant: e.quadrant }));
  const o = outliers.map((e) => ({ id: e.id, kind: e.kind, label: e.label, outlier: e.outlier }));
  const n = newItems.map((it) => ({
    title: it.title,
    author_or_channel: it.author_or_channel || "",
    url: it.url || "",
    summary: it.summary || "",
    concepts: Array.isArray(it.concepts) ? it.concepts : [],
  }));

  const vocab = new Map();
  for (const e of [...m, ...o]) if (e.id && !vocab.has(e.id)) vocab.set(e.id, e.label || humanize(e.id));
  for (const it of n) for (const slug of it.concepts) if (slug && !vocab.has(slug)) vocab.set(slug, humanize(slug));
  const concepts = [...vocab.entries()].slice(0, 32).map(([slug, label]) => ({ slug, label }));

  return { horizon, horizonLabel, movers: m, outliers: o, newItems: n, concepts };
}

function stateHash(state) {
  const sig = JSON.stringify({
    m: state.movers.map((e) => [e.id, e.quadrant, Math.round(e.momentum || 0)]),
    o: state.outliers.map((e) => e.id),
    n: state.newItems.map((it) => it.url || it.title),
    v: BRIEFING_PROMPT_VERSION,
  });
  return hash16(sig);
}

// Generate (or reuse) the briefing for one window. Returns the result object, or
// null if the model call fails and there is no cached prior. Idempotent: identical
// state returns the cached result with no API call.
export async function generateBriefing(state, { model = MODELS.enduring } = {}) {
  const cache = loadCache("briefing");
  const h = stateHash(state);
  const prior = cache[state.horizon];
  if (prior && prior.hash === h && prior.result) return prior.result;

  // Nothing to say: skip the model, emit a quiet briefing so the card stays honest.
  if (!state.movers.length && !state.outliers.length && !state.newItems.length) {
    const quiet = { severity: 0, headline: "", body: "", cited_concepts: [], cited_items: [], model: null, prompt_version: BRIEFING_PROMPT_VERSION };
    cache[state.horizon] = { hash: h, result: quiet };
    saveCache("briefing", cache);
    return quiet;
  }

  let out;
  try {
    out = await structured({ model, system: BRIEFING_SYSTEM, prompt: buildBriefingPrompt(state), tool: BRIEFING_TOOL, maxTokens: 700 });
  } catch (e) {
    console.error(`briefing ${state.horizon}: ${e.message}`);
    return prior?.result || null;
  }

  const vocab = new Map(state.concepts.map((c) => [c.slug, c.label]));
  const severity = Math.max(0, Math.min(3, Math.round(Number(out.severity)) || 1));
  const headline = stripEmDashes(String(out.headline || "").replace(/\s+/g, " ").trim());
  const body = stripEmDashes(String(out.body || "").replace(/[ \t]+/g, " ").trim());
  const cited_concepts = (Array.isArray(out.concepts) ? out.concepts : [])
    .filter((slug) => vocab.has(slug))
    .filter((slug, i, arr) => arr.indexOf(slug) === i)
    .slice(0, 8)
    .map((slug) => ({ slug, label: vocab.get(slug) }));
  // Keep each cited item's original New Items index as `n`, so the renderer can map
  // the body's inline [n] markers to numbered, linked sources (the worldthought
  // citation pattern). Dedup by index and by url; cap at six.
  const seenUrl = new Set();
  const cited_items = (Array.isArray(out.item_refs) ? out.item_refs : [])
    .filter((i) => Number.isInteger(i) && state.newItems[i] && state.newItems[i].url)
    .filter((i, idx, arr) => arr.indexOf(i) === idx)
    .map((i) => ({ n: i, ...state.newItems[i] }))
    .filter((it) => (seenUrl.has(it.url) ? false : seenUrl.add(it.url)))
    .slice(0, 6)
    .map((it) => ({ n: it.n, title: it.title, url: it.url, author_or_channel: it.author_or_channel }));

  const result = { severity, headline, body, cited_concepts, cited_items, model, prompt_version: BRIEFING_PROMPT_VERSION };
  cache[state.horizon] = { hash: h, result };
  saveCache("briefing", cache);
  return result;
}

// ----- CLI: rebuild state from committed artifacts and write the briefings -----

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const KIND_KEYS = KINDS.map((k) => k.key);

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));
  } catch {
    return null;
  }
}

function writeJson(rel, obj) {
  const p = resolve(DATA, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

// Build a window's state from the committed attention boards (rich movers) plus the
// committed digest (outliers and new items), matching what the live run passes in.
function loadHorizonStateFromArtifacts(h) {
  const digest = readJson(`digests/${h.key}.json`) || {};
  const all = [];
  for (const k of KIND_KEYS) {
    const board = readJson(`attention/${k}_${h.key}.json`);
    if (board?.entities) for (const e of board.entities) all.push({ ...e, kind: e.kind || k });
  }
  const seen = new Set();
  const movers = all
    .filter((e) => !e.outlier?.new_entrant)
    .sort((a, b) => Math.abs((b.momentum ?? 100) - 100) - Math.abs((a.momentum ?? 100) - 100))
    .filter((e) => (seen.has(e.id) ? false : seen.add(e.id)))
    .slice(0, 8);
  return buildBriefingState({
    horizon: h.key,
    horizonLabel: h.label.toLowerCase(),
    movers,
    outliers: (digest.outliers || []).slice(0, 8),
    newItems: (digest.new_items || []).slice(0, 8),
  });
}

export async function writeBriefingsFromArtifacts({ generated } = {}) {
  const stamp = generated || new Date().toISOString().slice(0, 10);
  for (const h of HORIZONS) {
    const state = loadHorizonStateFromArtifacts(h);
    const result = await generateBriefing(state);
    if (result) {
      writeJson(`digests/briefing_${h.key}.json`, { horizon: h.key, generated: stamp, ...result });
      console.log(`briefing ${h.key}: sev ${result.severity}  ${result.headline || "(quiet)"}`);
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  writeBriefingsFromArtifacts().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
