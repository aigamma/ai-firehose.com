/*
  Phase 3 of the video-insights backfill: deterministically merge the per-video insights that
  the Phase 2 agents staged into worker/.cache/insights/<id>.json INTO the served per-video
  JSONs (public/data/videos/<id>.json). The agents only ever wrote to the staging cache, never
  the real artifacts, so this is the single, auditable place the corpus is touched.

  For each staged file it validates the shape, sanitizes the prose (strips em dashes, the
  project writing rule, since a model can slip one past a prompt), pulls the insights hash from
  the transcript cache, and writes key_points + chapters + insights + ih + the upgraded writeup
  back, preserving every other field (summary, concepts, similar, wh). Invalid staging files
  are skipped and reported, never merged. Idempotent and resumable.

  Run: node scripts/merge_video_insights.mjs
*/
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripEmDashes } from "../worker/lib/text.mjs";
import { VIDEO_INSIGHTS_PROMPT_VERSION } from "../worker/pipeline/prompts/video_insights.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const VIDEO_DIR = resolve(ROOT, "public/data/videos");
const IDIR = resolve(ROOT, "worker/.cache/insights");
const TDIR = resolve(ROOT, "worker/.cache/transcripts");
const MODEL = "claude-sonnet-4-6";
const GENERATED = process.env.INSIGHTS_DATE || "2026-06-13";

const clean = (s) => stripEmDashes(String(s || "").replace(/\s+/g, " ").trim());

// Validate + normalize one staged insights object. Returns the clean fields or null if the
// shape is unusable (so a bad agent output is skipped, never written into the corpus).
function normalize(raw) {
  if (!raw || typeof raw !== "object") return null;
  const writeup = clean(raw.writeup);
  if (writeup.length < 40) return null;
  const key_points = (Array.isArray(raw.key_points) ? raw.key_points : [])
    .map(clean)
    .filter((s) => s.length >= 8)
    .slice(0, 6);
  if (key_points.length < 2) return null;
  const chapters = (Array.isArray(raw.chapters) ? raw.chapters : [])
    .map((c) => ({ t: Math.max(0, Math.floor(Number(c?.t))), title: clean(c?.title) }))
    .filter((c) => Number.isFinite(c.t) && c.title.length > 0)
    .sort((a, b) => a.t - b.t)
    .filter((c, i, arr) => i === 0 || c.t !== arr[i - 1].t) // drop duplicate timestamps
    .slice(0, 10);
  return { writeup, key_points, chapters };
}

if (!existsSync(IDIR)) {
  console.log("no staged insights directory; nothing to merge.");
  process.exit(0);
}

const staged = readdirSync(IDIR).filter((f) => f.endsWith(".json"));
let merged = 0;
let skipped = 0;
const bad = [];

for (const f of staged) {
  const id = f.replace(/\.json$/, "");
  const videoPath = resolve(VIDEO_DIR, `${id}.json`);
  if (!existsSync(videoPath)) { skipped += 1; continue; }

  let stagedRaw;
  try {
    stagedRaw = JSON.parse(readFileSync(resolve(IDIR, f), "utf8"));
  } catch {
    bad.push(`${id} (unparseable staging)`);
    continue;
  }
  const norm = normalize(stagedRaw);
  if (!norm) { bad.push(`${id} (invalid shape)`); continue; }

  // The insights hash comes from the transcript cache (text + prompt version), the same gate
  // a future regeneration would compute. Fall back to a per-file marker if absent.
  let ih = "";
  try {
    ih = JSON.parse(readFileSync(resolve(TDIR, `${id}.json`), "utf8")).ih || "";
  } catch { /* leave blank */ }

  const v = JSON.parse(readFileSync(videoPath, "utf8"));
  v.writeup = norm.writeup;
  v.key_points = norm.key_points;
  v.chapters = norm.chapters;
  v.insights = { source: "captions", model: MODEL, prompt_version: VIDEO_INSIGHTS_PROMPT_VERSION, generated: GENERATED };
  if (ih) v.ih = ih;
  writeFileSync(videoPath, `${JSON.stringify(v, null, 2)}\n`);
  merged += 1;
}

console.log(`merged ${merged}, skipped ${skipped} (no video file), invalid ${bad.length}`);
if (bad.length) console.log("invalid:", bad.slice(0, 30).join(", "));
