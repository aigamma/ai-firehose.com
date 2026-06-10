/*
  One-time purge of YouTube Shorts already in the corpus.

  Going forward, Shorts never enter: the adapter filters them at ingest and run.mjs
  guards the store (worker/sources/youtube_shorts.mjs). This script cleans what landed
  BEFORE that filter existed, end to end:

    1. Probe every stored YouTube item via the cached /shorts/ redirect oracle and
       record verdicts in worker/.cache/shorts.json (the committed source of truth).
    2. Remove confirmed Shorts from the corpus (worker/.cache/items.json).
    3. Delete their vectors from Pinecone and the committed vector manifest (keyed).
    4. Scrub Shorts from the surfaces that list them AS ITEMS: the per-horizon digests'
       new_items, the RSS feed, then rebuild the Watch artifacts (creators, directory,
       per-video pages) and regenerate the briefing and Watch-cycle prose so no citation
       points at a removed Short.

  Aggregate, concept-level effects (board attention, glossary hub stats) are not
  scrubbed here: no Short appears there AS AN ITEM, and the next worker run reconciles
  them from the cleaned store. The deterministic, keyless steps (1, 2, 4-digests/RSS,
  creators, directory) always run; the keyed steps (Pinecone delete, video re-embed,
  briefing/Watch regeneration) run only with worker/.env.local and can be skipped.

  Usage:
    node --env-file=worker/.env.local scripts/remove_shorts.mjs --dry        # preview, write nothing
    node --env-file=worker/.env.local scripts/remove_shorts.mjs              # full purge
    node scripts/remove_shorts.mjs --no-pinecone --no-rebuild                # keyless deterministic part only
*/
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadCache, saveCache } from "../worker/lib/cache.mjs";
import { loadShortVerdicts, saveShortVerdicts, classifyShorts, shortIdSet } from "../worker/sources/youtube_shorts.mjs";
import { loadVectorManifest, saveVectorManifest, removeVectorIds } from "../worker/pipeline/vector_manifest.mjs";
import { corpusDate } from "./lib/directory.mjs";
import { HORIZONS } from "../src/data/registry.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, "../public/data");
const FEED = resolve(HERE, "../public/feed.xml");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const NO_PINECONE = args.includes("--no-pinecone");
const NO_REBUILD = args.includes("--no-rebuild");

const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};
const writeJsonPretty = (p, obj) => writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
const videoIdFromUrl = (url) => (String(url || "").match(/[?&]v=([\w-]{11})/) || [])[1] || "";

async function main() {
  console.log(`remove_shorts${DRY ? " (DRY RUN, no writes)" : ""}\n`);

  // 1. Inventory + probe -----------------------------------------------------
  const store = loadCache("items");
  const items = Object.values(store);
  const yt = items.filter((it) => it && it.source === "youtube" && it.source_id);
  console.log(`corpus: ${items.length} items, ${yt.length} youtube`);

  const verdicts = DRY ? { ...loadShortVerdicts() } : loadShortVerdicts();
  const uniqIds = [...new Set(yt.map((it) => it.source_id))];
  let done = 0;
  const stats = await classifyShorts(uniqIds, {
    verdicts,
    spacingMs: 150,
    onResult: () => {
      done += 1;
      if (done % 50 === 0) console.log(`   probed ${done}/${uniqIds.length}...`);
    },
  });
  console.log(`probe: ${stats.probed} requested, ${stats.shorts} new shorts, ${stats.errors} undetermined (left for retry)`);
  if (!DRY) saveShortVerdicts(verdicts);

  const shorts = shortIdSet(verdicts);
  const shortsInStore = yt.filter((it) => shorts.has(it.source_id));
  const removedInternalIds = new Set(shortsInStore.map((it) => it.id));
  const removedSourceIds = new Set(shortsInStore.map((it) => it.source_id));

  console.log(`\n${shortsInStore.length} Shorts in the corpus:`);
  for (const it of shortsInStore) console.log(`   ${it.source_id}  [${it.author_or_channel}] ${it.title}`);

  // Which of those have an owned vector in the manifest (and thus in Pinecone)?
  const manifest = loadVectorManifest();
  const vectorIds = [...removedInternalIds].filter((id) => manifest.vectors[id]);
  console.log(`\nvectors: ${vectorIds.length} of ${removedInternalIds.size} Shorts have a vector in the manifest`);

  if (DRY) {
    console.log(`\nDRY RUN: would remove ${shortsInStore.length} items, delete ${vectorIds.length} vectors, and rebuild the Watch + digest surfaces. Re-run without --dry.`);
    return;
  }
  if (!shortsInStore.length) {
    console.log("\nNo Shorts in the corpus. Nothing to remove.");
    return;
  }

  // 2. Remove from the corpus (items.json) -----------------------------------
  for (const it of shortsInStore) delete store[it.id];
  saveCache("items", store);
  console.log(`\nitems.json: removed ${shortsInStore.length}, ${Object.keys(store).length} remain`);
  const remaining = Object.values(store);
  const generated = corpusDate(remaining);

  // 3. Pinecone + manifest (keyed) -------------------------------------------
  if (NO_PINECONE) {
    console.log("pinecone: skipped (--no-pinecone)");
  } else if (!vectorIds.length) {
    console.log("pinecone: no Short vectors to delete");
  } else if (!process.env.PINECONE_API_KEY) {
    console.log(`pinecone: PINECONE_API_KEY not set; ${vectorIds.length} vectors NOT deleted (run with --env-file=worker/.env.local). Manifest left intact so a later run reconciles.`);
  } else {
    const { ensureIndex, deleteByIds } = await import("../worker/lib/pinecone.mjs");
    const host = await ensureIndex();
    await deleteByIds(host, vectorIds);
    saveVectorManifest(removeVectorIds(manifest, vectorIds));
    console.log(`pinecone: deleted ${vectorIds.length} Short vectors; manifest updated`);
  }

  // 4a. Scrub digest new_items (keyless) -------------------------------------
  for (const h of HORIZONS) {
    const p = resolve(DATA, `digests/${h.key}.json`);
    const d = readJson(p, null);
    if (!d || !Array.isArray(d.new_items)) continue;
    const before = d.new_items.length;
    d.new_items = d.new_items.filter((it) => !removedInternalIds.has(it.id) && !removedSourceIds.has(videoIdFromUrl(it.url)));
    if (d.new_items.length !== before) {
      writeJsonPretty(p, d);
      console.log(`digests/${h.key}.json: removed ${before - d.new_items.length} Short(s) from new_items`);
    }
  }

  // 4b. Scrub the RSS feed (keyless) -----------------------------------------
  if (existsSync(FEED)) {
    const xml = readFileSync(FEED, "utf8");
    const head = xml.split("    <item>")[0];
    const blocks = xml.split("    <item>").slice(1).map((b) => "    <item>" + b);
    const tail = blocks.length ? blocks[blocks.length - 1].split("</item>")[1] : "";
    const kept = blocks
      .map((b) => b.split("</item>")[0] + "</item>")
      .filter((b) => !removedSourceIds.has(videoIdFromUrl((b.match(/<link>([^<]+)<\/link>/) || [])[1])));
    const removedFeed = blocks.length - kept.length;
    if (removedFeed > 0) {
      writeFileSync(FEED, head + kept.join("\n") + tail);
      console.log(`feed.xml: removed ${removedFeed} Short item(s)`);
    }
  }

  // 4c. Refresh corpus stats (keyless count display on Methodology) ----------
  const statsP = resolve(DATA, "stats.json");
  const corpusStats = readJson(statsP, null);
  if (corpusStats) {
    const by_source = {};
    const by_kind = {};
    for (const it of remaining) {
      by_source[it.source] = (by_source[it.source] || 0) + 1;
      if (it.kind) by_kind[it.kind] = (by_kind[it.kind] || 0) + 1;
    }
    writeJsonPretty(statsP, { ...corpusStats, generated, total_items: remaining.length, by_source, by_kind });
    console.log(`stats.json: total_items ${corpusStats.total_items} -> ${remaining.length}`);
  }

  // 4d. Rebuild keyless Watch artifacts --------------------------------------
  const { buildCreators } = await import("./build_creators.mjs");
  await buildCreators();
  const { buildDirectory } = await import("./build_directory.mjs");
  await buildDirectory({ source: "remove_shorts" });
  console.log("rebuilt creators.json + directory.json");

  // 4e. Keyed regeneration: briefings, Watch digest, per-video pages ----------
  if (NO_REBUILD) {
    console.log("rebuild: skipped briefings/watch/videos (--no-rebuild)");
    return;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const { writeBriefingsFromArtifacts } = await import("../worker/pipeline/briefing.mjs");
    await writeBriefingsFromArtifacts({ generated });
    const { writeWatchDigestFromCorpus } = await import("../worker/pipeline/watch_digest.mjs");
    await writeWatchDigestFromCorpus({ generated });
  } else {
    console.log("briefings/watch: ANTHROPIC_API_KEY not set; left for the next worker run (they may still cite a removed Short until then)");
  }
  if (process.env.VOYAGE_API_KEY) {
    process.env.VIDEO_WRITEUP_MAX = process.env.VIDEO_WRITEUP_MAX || "0"; // re-embed for neighbors only; reuse committed write-ups (no Opus)
    const { writeVideos } = await import("../worker/pipeline/videos.mjs");
    await writeVideos({ generated });
  } else {
    console.log("videos: VOYAGE_API_KEY not set; left for the next worker run");
  }

  console.log("\nDONE.");
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((e) => {
    console.error("remove_shorts FAILED:", e.message);
    process.exit(1);
  });
}
