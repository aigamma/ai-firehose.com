/*
  Fast, gentle transcript fetch: ONE yt-dlp process over all remaining videos (-a batchfile)
  with --sleep-requests pacing, instead of one python process per video. Far faster (no
  per-video interpreter startup) and still gentle on YouTube's rate limiter. yt-dlp writes
  .vtt files into a raw staging dir; this script then parses each into the transcript cache
  (worker/.cache/transcripts/<id>.json, captions:true). Resumable: re-run to pick up any the
  rate limiter dropped (yt-dlp -i continues past errors). Free, no model, no paid API.

  Run: node scripts/batch_fetch_transcripts.mjs   (env SLEEP=seconds, default 1.5)
*/
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
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
mkdirSync(TDIR, { recursive: true });
mkdirSync(RAW, { recursive: true });

const cacheOk = (id) => { try { return JSON.parse(readFileSync(resolve(TDIR, `${id}.json`), "utf8")).captions === true; } catch { return false; } };
const hasInsights = (id) => { try { return !!JSON.parse(readFileSync(resolve(VIDEO_DIR, `${id}.json`), "utf8")).insights; } catch { return false; } };

const idx = JSON.parse(readFileSync(resolve(VIDEO_DIR, "index.json"), "utf8"));
const ids = (idx.videos || []).map((v) => v.id).filter((id) => !cacheOk(id) && !hasInsights(id));
console.log(`remaining to fetch: ${ids.length}`);
if (!ids.length) { console.log("nothing to do."); process.exit(0); }

const batchFile = resolve(RAW, "_urls.txt");
writeFileSync(batchFile, ids.map((id) => `https://www.youtube.com/watch?v=${id}`).join("\n"));

const args = [
  "-m", "yt_dlp", "-a", batchFile,
  "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*", "--sub-format", "vtt",
  "-o", join(RAW, "%(id)s.%(ext)s"),
  "--sleep-requests", SLEEP, "-i", "--no-warnings", "--no-progress",
];

console.log(`launching one yt-dlp process, --sleep-requests ${SLEEP}s ...`);
const child = spawn("python", args, { stdio: ["ignore", "inherit", "inherit"] });

child.on("close", (code) => {
  console.log(`yt-dlp exited (${code}). Parsing captions...`);
  let got = 0;
  const seen = new Set();
  for (const f of readdirSync(RAW)) {
    if (!f.endsWith(".vtt")) continue;
    const id = f.split(".")[0]; // YouTube ids carry no dots; filename is <id>.<lang>.vtt
    if (!id || seen.has(id) || cacheOk(id)) continue;
    // Prefer a manual .en.vtt over an auto -orig track when both exist for this id.
    const tracks = readdirSync(RAW).filter((x) => x.startsWith(`${id}.`) && x.endsWith(".vtt"));
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
    } catch { /* skip unparseable */ }
  }
  // Clean the raw vtt staging so a re-run starts fresh.
  try { rmSync(RAW, { recursive: true, force: true }); } catch { /* ignore */ }
  const remaining = ids.length - got;
  console.log(`DONE: +${got} captions parsed. ${remaining} still missing (rerun to retry; persistent misses are genuinely caption-less).`);
});
