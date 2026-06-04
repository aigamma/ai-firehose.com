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
