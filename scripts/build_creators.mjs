/*
  Featured-creators resolver for the Watch surface. Turns the curated presentation
  registry (sources/featured.json) into the served artifact public/data/creators.json.

  Corpus-only and deterministic by default, exactly like its sibling build_directory.mjs:
  the same committed corpus (worker/.cache/items.json) plus the same featured.json always
  yield byte-identical output, with no network and no wall clock. Each video is joined to
  its classified record in the corpus, so it carries the model-written summary ("why it
  matters") and its concepts as links into the glossary hubs (the Citation Contract,
  docs/RAG.md). The "generated" stamp and the retention window are both anchored to the
  newest corpus item (never Date.now()), mirroring directory.mjs:corpusDate and the way
  recompute_boards.mjs anchors its windows, so the served artifact and a regeneration match
  and the generated-fresh gate cannot drift by date. Featured creators are also ingestion
  sources (sources/youtube_channels.json), so the worker keeps their recent, classified
  uploads in the corpus; corpus-only therefore loses no freshness and gains the enrichment.

  Live RSS is an explicit opt-in (buildCreators({ live: true }), or `--live` on the CLI):
  it polls each creator's free feed to surface a brand-new upload before the worker
  classifies it, at the cost of determinism (the video is unenriched and the output varies
  with the feed). It is OFF by default and unused by the build, the gate, and the worker,
  because the corpus is the better source in every deployed context (Netlify build IPs are
  datacenter IPs the feed blocks anyway). Use it only for a deliberately live preview.

  Reused by two callers: the build (a prebuild npm step) and the worker (run.mjs), writing
  the identical artifact so the two cannot drift. Runs without API keys. See docs/SOURCES.md
  (the curation workflow) and docs/FEATURE_PLAYBOOK.md.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchFeed, parseEntries } from "../worker/sources/youtube.mjs";
import { slugify } from "../worker/lib/hash.mjs";
import { RETENTION_DAYS } from "../src/data/registry.js";
import { corpusDate } from "./lib/directory.mjs";
import { prunePins } from "./lib/pins.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FEATURED = resolve(HERE, "../sources/featured.json");
const OUT = resolve(HERE, "../public/data/creators.json");
const ITEMS = resolve(HERE, "../worker/.cache/items.json");
const REGISTRY = resolve(HERE, "../sources/youtube_channels.json");

const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => String(s || "").trim().toLowerCase();
const VID_RE = /^[\w-]{11}$/;
const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const channelUrl = (c) =>
  c.handle ? `https://www.youtube.com/${c.handle.startsWith("@") ? c.handle : `@${c.handle}`}` : `https://www.youtube.com/channel/${c.channel_id}`;

// Parity with the corpus retention: no video flows in the Watch stream past the rolling
// quarter (docs/INGESTION.md), keyed on published_at. The committed corpus is itself already
// pruned to this window, and the cutoff is anchored to the NEWEST corpus item (not the wall
// clock), so the served artifact and any regeneration are byte-identical and the hard gate
// cannot drift by date. withinRetention is exported for its unit test (build_creators.test.mjs).
export const withinRetention = (publishedISO, cutoff) => {
  if (!publishedISO) return false;
  const t = new Date(publishedISO).getTime();
  return Number.isFinite(t) && t >= cutoff;
};
function retentionCutoff(items) {
  let max = 0;
  for (const it of items) {
    const t = new Date(it?.published_at || 0).getTime();
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max - RETENTION_DAYS * 86400000;
}

function writeOut(obj) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(obj, null, 2)}\n`);
}

// Lookup maps from the committed corpus: videoId -> classified item, channel name -> its
// videos newest first (the enrichment source and the default video source), plus the raw
// item list (for the deterministic stamp and the retention anchor).
function corpusMaps() {
  const store = readJson(ITEMS, {});
  const items = Object.values(store);
  const byVideo = new Map();
  const byChannel = new Map();
  for (const it of items) {
    if (it.source !== "youtube" || !it.source_id) continue;
    byVideo.set(it.source_id, it);
    const name = it.author_or_channel || "";
    if (!byChannel.has(name)) byChannel.set(name, []);
    byChannel.get(name).push(it);
  }
  for (const list of byChannel.values()) {
    list.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  }
  // Normalized index (trimmed, lowercased) so a featured.json name that differs from the
  // corpus channel name only in case or whitespace still matches.
  const byChannelNorm = new Map();
  for (const [name, list] of byChannel) byChannelNorm.set(norm(name), list);
  return { byVideo, byChannel, byChannelNorm, items };
}

// One resolved video, enriched from the corpus when the video is in it.
function toVideo(videoId, { title, published } = {}, corpus) {
  const item = corpus.byVideo.get(videoId);
  const concepts = (item?.concepts || [])
    .map((c) => ({ slug: slugify(c), label: String(c) }))
    .filter((c) => c.slug);
  return {
    videoId,
    title: title || item?.title || "",
    published: published || item?.published_at || null,
    url: watchUrl(videoId),
    thumbnail: thumb(videoId),
    kind: item?.kind || null,
    summary: item?.summary || "",
    concepts,
  };
}

async function resolveCreator(c, { count, cutoff, live, recommended }, corpus, prior) {
  let videos = [];
  let ok = false;
  // Opt-in only: surface a brand-new upload before the worker classifies it, at the cost of
  // determinism. Off by default; the corpus path below is the deterministic default source.
  if (live) {
    try {
      const xml = await fetchFeed(c.channel_id);
      const entries = parseEntries(xml, { name: c.name }).filter((e) => e.source_id && withinRetention(e.published_at, cutoff));
      videos = entries.slice(0, count).map((e) => toVideo(e.source_id, { title: e.title, published: e.published_at }, corpus));
      ok = videos.length > 0;
    } catch (e) {
      console.error(`creators ${c.name}: RSS ${e.message}`);
    }
  }
  // The corpus is the default source (and the fallback when live RSS is on but fails). It
  // already holds each featured creator's recent, classified uploads (featured channels are
  // ingestion sources too), pruned to the window, so this is fully deterministic: the same
  // corpus yields the same videos, with no network and no clock.
  if (!ok) {
    const list = (corpus.byChannel.get(c.name) || corpus.byChannelNorm.get(norm(c.name)) || []).filter((it) => withinRetention(it.published_at, cutoff));
    const fromCorpus = list.slice(0, count).map((it) => toVideo(it.source_id, {}, corpus));
    if (fromCorpus.length) {
      videos = fromCorpus;
      ok = true;
    }
  }
  // Last resort: carry the previously published block so the section never empties.
  if (!ok && prior?.videos?.length) videos = prior.videos.filter((v) => withinRetention(v.published, cutoff));

  return {
    channel_id: c.channel_id,
    name: c.name,
    handle: c.handle || "",
    channelUrl: channelUrl(c),
    // Editorial inner-circle flag, read from the ingestion registry by channel_id; only
    // emitted when true. Surfacing and ordering only, never the rotation math.
    ...(recommended ? { recommended: true } : {}),
    blurb: c.blurb || "",
    videos,
    _ok: ok,
  };
}

export async function buildCreators({ live = false } = {}) {
  const featured = readJson(FEATURED, null);
  if (!featured) throw new Error(`cannot read ${FEATURED}`);
  const prior = readJson(OUT, { creators: [], pinned: [] });
  const priorByChannel = new Map((prior.creators || []).map((c) => [c.channel_id, c]));
  const priorPins = new Map((prior.pinned || []).map((p) => [p.videoId, p]));
  const corpus = corpusMaps();
  const generated = corpusDate(corpus.items);
  const cutoff = retentionCutoff(corpus.items);
  const defaults = featured.defaults || { latest_count: 4 };
  // The inner circle: featured creators flagged `recommended` in the ingestion registry
  // (sources/youtube_channels.json) carry the badge into the spotlight too. Read by
  // channel_id from a committed file, so it stays deterministic.
  const registry = readJson(REGISTRY, { channels: [] });
  const recommendedIds = new Set((registry.channels || []).filter((c) => c.recommended === true).map((c) => c.channel_id));

  const creators = [];
  let anyResolved = false;
  for (const c of (featured.creators || []).filter((c) => c.active !== false)) {
    const count = c.latest_count || defaults.latest_count || 4;
    const resolved = await resolveCreator(c, { count, cutoff, live, recommended: recommendedIds.has(c.channel_id) }, corpus, priorByChannel.get(c.channel_id));
    if (resolved._ok) anyResolved = true;
    delete resolved._ok;
    creators.push(resolved);
    if (live) await sleep(300); // only space requests when actually polling RSS
  }

  // Never render a pin that has been on the site past its window, even if the record has not
  // been pruned yet (the worker prune commits the cleanup; this is the live guarantee). Pin
  // self-expiry (PIN_RETENTION_DAYS after pinned_at) is a deliberate wall-clock schedule, the
  // one intended time dependence here, and pinned[] is empty by default.
  const { kept: livePins } = prunePins(featured.pinned || [], Date.now());
  const pinned = livePins
    .filter((p) => VID_RE.test(p.videoId || ""))
    .map((p) => {
      const v = toVideo(p.videoId, {}, corpus);
      return { ...v, title: v.title || priorPins.get(p.videoId)?.title || "", note: p.note || "" };
    });

  // If nothing resolved (for example an empty corpus on a fresh clone) and a usable prior
  // exists, keep it rather than risk emptying the section on a degenerate build.
  if (!anyResolved && (prior.creators || []).length) {
    writeOut(prior);
    return prior;
  }

  const out = { generated, creators, pinned };
  writeOut(out);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const live = process.argv.includes("--live");
  buildCreators({ live })
    .then((o) => {
      const n = o.creators.reduce((a, c) => a + (c.videos?.length || 0), 0);
      console.log(`creators.json: ${o.creators.length} creators, ${n} videos, ${o.pinned.length} pinned, generated=${o.generated}${live ? " (live RSS)" : ""}`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
