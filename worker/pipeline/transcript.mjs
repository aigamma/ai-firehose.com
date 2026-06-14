/*
  YouTube transcript enrichment for the Fly worker. Two paths, both via yt-dlp:
  captions first (fast, no model), then an audio plus OpenAI transcription
  fallback for caption-less videos. Gated by ENABLE_TRANSCRIPTS so it never runs
  where yt-dlp is absent (for example this dev sandbox). Returns transcript text
  or null; callers fall back to title plus description.
*/
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const exec = promisify(execFile);

async function ytDlpAvailable() {
  try {
    await exec("yt-dlp", ["--version"], { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

export function vttToText(vtt) {
  const lines = vtt
    .split(/\r?\n/)
    .filter((l) => l && !/-->/.test(l) && !/^WEBVTT/.test(l) && !/^\d+$/.test(l) && !/^(Kind|Language):/.test(l))
    .map((l) => l.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  // Auto-generated captions repeat each line as the rolling window advances; drop a
  // line identical to its predecessor so the transcript (and its token cost) stays lean.
  return lines.filter((l, i) => l !== lines[i - 1]).join(" ").replace(/\s+/g, " ").trim();
}

// Parse a VTT into timestamped, de-duplicated segments [{ t, text }] (t in whole seconds
// from the cue start). Strips the word-level <00:00:00.000><c> tags auto-captions carry and
// drops the rolling-window repeats (each line restated as the caption builds), keeping a line
// at its earliest timestamp. The timed counterpart to vttToText, for chapter anchoring.
export function vttToSegments(vtt) {
  const out = [];
  let curT = 0;
  for (const raw of String(vtt).split(/\r?\n/)) {
    const m = raw.match(/^(\d\d):(\d\d):(\d\d)[.,](\d{3})\s*-->/);
    if (m) {
      curT = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
      continue;
    }
    if (/^WEBVTT/.test(raw) || /^(Kind|Language):/.test(raw) || /^\d+$/.test(raw.trim()) || !raw.trim()) continue;
    const text = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (out.length && out[out.length - 1].text === text) continue; // rolling-window repeat
    out.push({ t: Math.floor(curT), text });
  }
  return out;
}

const mmss = (s) => {
  const sec = Math.max(0, Math.floor(s));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

// Fold timestamped segments into coarse [mm:ss] buckets for a model prompt: one line per
// bucket, prefixed with its start time, capped at maxChars to bound the token cost. The
// markers let the insights model anchor chapters to real positions instead of inventing them.
export function compactTranscript(segments, { bucketSeconds = 30, maxChars = 12000 } = {}) {
  if (!segments?.length) return "";
  const buckets = new Map();
  for (const s of segments) {
    const key = Math.floor(s.t / bucketSeconds);
    if (!buckets.has(key)) buckets.set(key, { t: s.t, parts: [] });
    buckets.get(key).parts.push(s.text);
  }
  const lines = [...buckets.values()]
    .sort((a, b) => a.t - b.t)
    .map((b) => `[${mmss(b.t)}] ${b.parts.join(" ")}`.replace(/\s+/g, " ").trim());
  const out = lines.join("\n");
  return out.length > maxChars ? `${out.slice(0, maxChars)}\n[transcript truncated]` : out;
}

// Normalize the yt-dlp invocation: a string command (default "yt-dlp" on PATH), or an array
// like ["python","-m","yt_dlp"] for a local backfill where the binary is not on PATH.
function resolveYtDlp(ytDlp) {
  if (Array.isArray(ytDlp)) return { cmd: ytDlp[0], pre: ytDlp.slice(1) };
  if (ytDlp && typeof ytDlp === "object" && ytDlp.cmd) return { cmd: ytDlp.cmd, pre: ytDlp.pre || [] };
  return { cmd: ytDlp || "yt-dlp", pre: [] };
}

// Audio plus OpenAI transcription. Best-effort; respects the 25 MB API limit.
async function audioFallback(url, dir, maxChars) {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    await exec("yt-dlp", ["-x", "--audio-format", "mp3", "--audio-quality", "5", "-o", join(dir, "%(id)s.%(ext)s"), url], { timeout: 240000 });
    const mp3 = readdirSync(dir).find((f) => f.endsWith(".mp3"));
    if (!mp3) return null;
    const path = join(dir, mp3);
    if (statSync(path).size > 25 * 1024 * 1024) return null;
    const form = new FormData();
    form.append("file", new Blob([readFileSync(path)]), mp3);
    form.append("model", "whisper-1");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return (j.text || "").slice(0, maxChars) || null;
  } catch {
    return null;
  }
}

export async function transcribeYouTube(url, { maxChars = 6000 } = {}) {
  if (!(await ytDlpAvailable())) return null;
  const dir = mkdtempSync(join(tmpdir(), "aifh-"));
  try {
    try {
      await exec(
        "yt-dlp",
        ["--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*", "--sub-format", "vtt", "-o", join(dir, "%(id)s.%(ext)s"), url],
        { timeout: 90000 }
      );
    } catch {
      /* no captions; fall through to audio */
    }
    const vtt = readdirSync(dir).find((f) => f.endsWith(".vtt"));
    if (vtt) return vttToText(readFileSync(join(dir, vtt), "utf8")).slice(0, maxChars);
    return await audioFallback(url, dir, maxChars);
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

// Fetch English captions and return them as timestamped segments. Captions ONLY (no audio
// or Whisper fallback): the on-site chapters need per-line timestamps, which only the caption
// track carries. `ytDlp` lets a caller point at a non-PATH binary (e.g. a local backfill with
// ["python","-m","yt_dlp"]); the worker default is yt-dlp on PATH. Returns { segments, text }
// or null (no captions, or yt-dlp unavailable). Prefers a manual track over the auto one.
export async function transcribeYouTubeTimed(url, { ytDlp, maxChars = 16000 } = {}) {
  const { cmd, pre } = resolveYtDlp(ytDlp);
  const dir = mkdtempSync(join(tmpdir(), "aifh-t-"));
  try {
    try {
      await exec(
        cmd,
        [...pre, "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*", "--sub-format", "vtt", "-o", join(dir, "%(id)s.%(ext)s"), url],
        { timeout: 90000 }
      );
    } catch {
      return null;
    }
    const files = readdirSync(dir).filter((f) => f.endsWith(".vtt"));
    if (!files.length) return null;
    const pick = files.find((f) => /\.en\.vtt$/.test(f)) || files.find((f) => !/-orig/.test(f)) || files[0];
    const segments = vttToSegments(readFileSync(join(dir, pick), "utf8"));
    if (!segments.length) return null;
    return { segments, text: segments.map((s) => s.text).join(" ").slice(0, maxChars) };
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}
