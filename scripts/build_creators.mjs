/*
  Featured-creators resolver for the Watch surface. Turns the curated presentation
  registry (sources/featured.json) into the served artifact public/data/creators.json.

  Fully RAG-integrated: each video is joined to its classified record in the corpus
  (worker/.cache/items.json), so it carries the model-written summary ("why it
  matters") and its concepts as links into the embedding-backed glossary hubs (the
  Citation Contract, docs/RAG.md). Freshness comes from each creator's free RSS feed
  (no API key, the parser reused from worker/sources/youtube.mjs); the corpus is both
  the enrichment source and a robust fallback, because it already holds each creator's
  recent uploads. So even when RSS is blocked (Netlify build IPs are datacenter IPs,
  and the feed is flaky from those), the section still resolves from the corpus, and a
  fully blocked build keeps the previously committed artifact rather than emptying.

  Reused by two callers: the build (a prebuild npm step) and the worker (run.mjs),
  writing the identical artifact so the two cannot drift. Runs without API keys.
  See docs/SOURCES.md (the curation workflow) and docs/FEATURE_PLAYBOOK.md.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchFeed, parseEntries } from "../worker/sources/youtube.mjs";
import { slugify } from "../worker/lib/hash.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FEATURED = resolve(HERE, "../sources/featured.json");
const OUT = resolve(HERE, "../public/data/creators.json");
const ITEMS = resolve(HERE, "../worker/.cache/items.json");

const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VID_RE = /^[\w-]{11}$/;
const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const channelUrl = (c) =>
  c.handle ? `https://www.youtube.com/${c.handle.startsWith("@") ? c.handle : `@${c.handle}`}` : `https://www.youtube.com/channel/${c.channel_id}`;
const stamp = () => new Date().toISOString().slice(0, 10);

function writeOut(obj) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(obj, null, 2)}\n`);
}

// Lookup maps from the committed corpus: videoId -> classified item, and channel
// name -> its videos newest first (the RSS fallback and enrichment source).
function corpusMaps() {
  const store = readJson(ITEMS, {});
  const byVideo = new Map();
  const byChannel = new Map();
  for (const it of Object.values(store)) {
    if (it.source !== "youtube" || !it.source_id) continue;
    byVideo.set(it.source_id, it);
    const name = it.author_or_channel || "";
    if (!byChannel.has(name)) byChannel.set(name, []);
    byChannel.get(name).push(it);
  }
  for (const list of byChannel.values()) {
    list.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  }
  return { byVideo, byChannel };
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

async function resolveCreator(c, defaults, corpus, prior) {
  const count = c.latest_count || defaults.latest_count || 4;
  let videos = [];
  let ok = false;
  try {
    const xml = await fetchFeed(c.channel_id);
    const entries = parseEntries(xml, { name: c.name }).filter((e) => e.source_id);
    videos = entries.slice(0, count).map((e) => toVideo(e.source_id, { title: e.title, published: e.published_at }, corpus));
    ok = videos.length > 0;
  } catch (e) {
    console.error(`creators ${c.name}: RSS ${e.message}`);
  }
  // Fallback to the corpus, which already holds the creator's recent uploads.
  if (!ok) {
    const fromCorpus = (corpus.byChannel.get(c.name) || []).slice(0, count).map((it) => toVideo(it.source_id, {}, corpus));
    if (fromCorpus.length) {
      videos = fromCorpus;
      ok = true;
    }
  }
  // Last resort: carry the previously published block so the section never empties.
  if (!ok && prior?.videos?.length) videos = prior.videos;

  return {
    channel_id: c.channel_id,
    name: c.name,
    handle: c.handle || "",
    channelUrl: channelUrl(c),
    blurb: c.blurb || "",
    videos,
    _ok: ok,
  };
}

export async function buildCreators({ source = "build" } = {}) {
  const featured = readJson(FEATURED, null);
  if (!featured) throw new Error(`cannot read ${FEATURED}`);
  const prior = readJson(OUT, { creators: [], pinned: [] });
  const priorByChannel = new Map((prior.creators || []).map((c) => [c.channel_id, c]));
  const priorPins = new Map((prior.pinned || []).map((p) => [p.videoId, p]));
  const corpus = corpusMaps();
  const defaults = featured.defaults || { latest_count: 4 };

  const creators = [];
  let anyLive = false;
  for (const c of (featured.creators || []).filter((c) => c.active !== false)) {
    const resolved = await resolveCreator(c, defaults, corpus, priorByChannel.get(c.channel_id));
    if (resolved._ok) anyLive = true;
    delete resolved._ok;
    creators.push(resolved);
    await sleep(300); // ease the feed endpoint's rate mitigation, as the adapter does
  }

  const pinned = (featured.pinned || [])
    .filter((p) => VID_RE.test(p.videoId || ""))
    .map((p) => {
      const v = toVideo(p.videoId, {}, corpus);
      return { ...v, title: v.title || priorPins.get(p.videoId)?.title || "", note: p.note || "" };
    });

  // If every creator fell back and a usable prior exists, keep it (stamped fallback)
  // rather than risk emptying the section on a fully blocked build.
  if (!anyLive && (prior.creators || []).length) {
    const out = { ...prior, source: "fallback" };
    writeOut(out);
    return out;
  }

  const out = { generated: stamp(), source, creators, pinned };
  writeOut(out);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  buildCreators()
    .then((o) => {
      const n = o.creators.reduce((a, c) => a + (c.videos?.length || 0), 0);
      console.log(`creators.json: ${o.creators.length} creators, ${n} videos, ${o.pinned.length} pinned, source=${o.source}`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
