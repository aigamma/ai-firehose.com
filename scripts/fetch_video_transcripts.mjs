/*
  Phase 1 of the video-insights backfill: fetch and cache YouTube captions for the video
  library. Free (yt-dlp captions only, no model, no paid API) and resumable.

  YouTube rate-limits aggressively (HTTP 429 + "confirm you are not a bot") if hit too fast,
  which earlier produced false "no captions" results. So this runs GENTLY and is THROTTLE
  AWARE: concurrency 1 by default with a delay between requests, it inspects yt-dlp's stderr
  to tell a genuine no-subtitles video (yt-dlp exits clean, no .vtt) from a bot-block (429),
  and on a block it backs off and leaves the video uncached to retry on a later pass. Only a
  clean result is cached: { id, captions:true, compact, ih } or { id, captions:false }.

  Env: CONCURRENCY (default 1), DELAY_MS (default 1500), MAX (cap this run's attempts).
  Run: node scripts/fetch_video_transcripts.mjs
  Writes worker/.cache/transcripts/<id>.json (gitignored).
*/
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vttToSegments, compactTranscript } from "../worker/pipeline/transcript.mjs";
import { hash16 } from "../worker/lib/hash.mjs";
import { VIDEO_INSIGHTS_PROMPT_VERSION } from "../worker/pipeline/prompts/video_insights.mjs";

const exec = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const VIDEO_DIR = resolve(ROOT, "public/data/videos");
const TDIR = resolve(ROOT, "worker/.cache/transcripts");
mkdirSync(TDIR, { recursive: true });

const CONCURRENCY = Number(process.env.CONCURRENCY) || 1;
const DELAY_MS = Number(process.env.DELAY_MS) || 1500;
const MAX = Number(process.env.MAX) || Infinity;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cacheOk = (id) => {
  try {
    return JSON.parse(readFileSync(resolve(TDIR, `${id}.json`), "utf8")).captions === true;
  } catch {
    return false;
  }
};
const hasInsights = (id) => {
  try {
    return !!JSON.parse(readFileSync(resolve(VIDEO_DIR, `${id}.json`), "utf8")).insights;
  } catch {
    return false;
  }
};

// One gentle caption fetch. Returns "captions" | "none" | "blocked" | "error".
async function fetchOne(id) {
  const dir = mkdtempSync(join(tmpdir(), "aifh-c-"));
  try {
    try {
      await exec("python", ["-m", "yt_dlp", "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*", "--sub-format", "vtt", "-o", join(dir, "%(id)s.%(ext)s"), `https://www.youtube.com/watch?v=${id}`], { timeout: 90000 });
    } catch (e) {
      const msg = `${e.stderr || ""}${e.message || ""}`;
      if (/429|not a bot|Sign in to confirm/i.test(msg)) return "blocked";
      // A clean "no subtitles" can also throw in some yt-dlp versions; fall through to the file check.
    }
    const files = readdirSync(dir).filter((f) => f.endsWith(".vtt"));
    if (!files.length) return "none";
    const pick = files.find((f) => /\.en\.vtt$/.test(f)) || files.find((f) => !/-orig/.test(f)) || files[0];
    const segments = vttToSegments(readFileSync(join(dir, pick), "utf8"));
    if (!segments.length) return "none";
    const compact = compactTranscript(segments, { bucketSeconds: 30, maxChars: 12000 });
    const text = segments.map((s) => s.text).join(" ");
    writeFileSync(resolve(TDIR, `${id}.json`), JSON.stringify({ id, captions: true, compact, ih: hash16(text + VIDEO_INSIGHTS_PROMPT_VERSION) }));
    return "captions";
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

const idx = JSON.parse(readFileSync(resolve(VIDEO_DIR, "index.json"), "utf8"));
const ids = (idx.videos || []).map((v) => v.id).filter((id) => !cacheOk(id) && !hasInsights(id));
console.log(`to fetch (no captions cached yet): ${ids.length}, concurrency ${CONCURRENCY}, delay ${DELAY_MS}ms`);

let got = 0, none = 0, blocked = 0, done = 0;
let backoff = 0; // grows on blocks, shared across workers

async function run(queue) {
  while (queue.length && done < MAX) {
    const id = queue.shift();
    if (backoff) { await sleep(backoff); }
    let verdict;
    try { verdict = await fetchOne(id); } catch { verdict = "error"; }
    if (verdict === "captions") { got += 1; backoff = Math.max(0, backoff - 2000); }
    else if (verdict === "none") { writeFileSync(resolve(TDIR, `${id}.json`), JSON.stringify({ id, captions: false })); none += 1; }
    else if (verdict === "blocked") { blocked += 1; queue.push(id); backoff = Math.min(60000, (backoff || 5000) * 2); } // requeue + back off
    done += 1;
    if (done % 15 === 0) console.log(`  ${done} attempts (captions ${got}, none ${none}, blocked ${blocked}, backoff ${backoff}ms, queue ${queue.length})`);
    await sleep(DELAY_MS);
  }
}

const q = [...ids];
await Promise.all(Array.from({ length: CONCURRENCY }, () => run(q)));
console.log(`DONE: +${got} captions, ${none} genuinely none, ${blocked} block events. Rerun to continue any still blocked.`);
