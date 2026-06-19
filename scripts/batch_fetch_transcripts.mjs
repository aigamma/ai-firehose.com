/*
  Fast, gentle, crash-resilient transcript fetch: paced yt-dlp over the remaining videos, in
  CHUNKS, instead of one python process per video (slow) or one giant process (a native yt-dlp
  crash, exit 0xC0000005 on the android_vr extraction path, kills the whole batch). Each chunk
  is one yt-dlp process with --sleep-requests pacing; a crash loses only that chunk and the loop
  continues. The android_vr player client is excluded to dodge the crash. yt-dlp writes .vtt
  into a raw staging dir; after each chunk this parses them into the transcript cache
  (worker/.cache/transcripts/<id>.json, captions:true). Resumable, free, no model, no paid API.

  Run: node scripts/batch_fetch_transcripts.mjs   (env SLEEP=seconds default 1.5, CHUNK default 40)
*/
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vttToSegments, compactTranscript } from "../worker/pipeline/transcript.mjs";
import { hash16 } from "../worker/lib/hash.mjs";
import { VIDEO_INSIGHTS_PROMPT_VERSION } from "../worker/pipeline/prompts/video_insights.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const VIDEO_DIR = resolve(ROOT, "public/data/videos");
const TDIR = resolve(ROOT, "worker/.cache/transcripts");
const RAW = resolve(ROOT, "worker/.cache/vtt_raw");
const SLEEP = process.env.SLEEP || "1.5";
const CHUNK = Number(process.env.CHUNK) || 40;
mkdirSync(TDIR, { recursive: true });

const cacheOk = (id) => { try { return JSON.parse(readFileSync(resolve(TDIR, `${id}.json`), "utf8")).captions === true; } catch { return false; } };
const hasInsights = (id) => { try { return !!JSON.parse(readFileSync(resolve(VIDEO_DIR, `${id}.json`), "utf8")).insights; } catch { return false; } };

const idx = JSON.parse(readFileSync(resolve(VIDEO_DIR, "index.json"), "utf8"));
const remaining = (idx.videos || []).map((v) => v.id).filter((id) => !cacheOk(id) && !hasInsights(id));
console.log(`remaining to fetch: ${remaining.length}, chunk ${CHUNK}, --sleep-requests ${SLEEP}s`);
if (!remaining.length) { console.log("nothing to do."); process.exit(0); }

const runChunk = (urls) =>
  new Promise((res) => {
    rmSync(RAW, { recursive: true, force: true });
    mkdirSync(RAW, { recursive: true });
    const batchFile = resolve(RAW, "_urls.txt");
    writeFileSync(batchFile, urls.join("\n"));
    const child = spawn("python", [
      "-m", "yt_dlp", "-a", batchFile,
      "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*", "--sub-format", "vtt",
      "-o", join(RAW, "%(id)s.%(ext)s"),
      "--extractor-args", "youtube:player_client=default,-android_vr",
      "--sleep-requests", SLEEP, "-i", "--no-warnings", "--no-progress",
    ], { stdio: ["ignore", "inherit", "inherit"] });
    child.on("close", () => res());
    child.on("error", () => res());
  });

function parseRaw() {
  let got = 0;
  const seen = new Set();
  let files = [];
  try { files = readdirSync(RAW).filter((f) => f.endsWith(".vtt")); } catch { return 0; }
  for (const f of files) {
    const id = f.split(".")[0];
    if (!id || seen.has(id) || cacheOk(id)) continue;
    const tracks = files.filter((x) => x.startsWith(`${id}.`));
    const pick = tracks.find((x) => /\.en\.vtt$/.test(x)) || tracks.find((x) => !/-orig/.test(x)) || tracks[0];
    try {
      const segments = vttToSegments(readFileSync(join(RAW, pick), "utf8"));
      if (segments.length) {
        const compact = compactTranscript(segments, { bucketSeconds: 30, maxChars: 12000 });
        const text = segments.map((s) => s.text).join(" ");
        writeFileSync(resolve(TDIR, `${id}.json`), JSON.stringify({ id, captions: true, compact, ih: hash16(text + VIDEO_INSIGHTS_PROMPT_VERSION) }));
        got += 1;
        seen.add(id);
      }
    } catch { /* skip */ }
  }
  return got;
}

let total = 0;
for (let i = 0; i < remaining.length; i += CHUNK) {
  const chunk = remaining.slice(i, i + CHUNK).filter((id) => !cacheOk(id));
  if (!chunk.length) continue;
  await runChunk(chunk.map((id) => `https://www.youtube.com/watch?v=${id}`));
  const got = parseRaw();
  total += got;
  console.log(`  chunk ${i / CHUNK + 1}: +${got} captions (running total ${total} / ${remaining.length})`);
}
try { rmSync(RAW, { recursive: true, force: true }); } catch { /* ignore */ }
console.log(`DONE: +${total} captions this run. Rerun for any still missing; persistent misses are genuinely caption-less.`);
