/*
  YouTube transcript enrichment for the Fly worker. Captions via yt-dlp (fast, no
  model). Gated by ENABLE_TRANSCRIPTS so it never runs where yt-dlp is absent
  (for example this dev sandbox). Returns transcript text or null; callers fall
  back to title plus description. An audio plus Whisper fallback for caption-less
  videos can be added later (download audio with yt-dlp, transcribe with the
  OpenAI audio API); captions cover the common case.
*/
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
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

function vttToText(vtt) {
  return vtt
    .split(/\r?\n/)
    .filter((l) => l && !/-->/.test(l) && !/^WEBVTT/.test(l) && !/^\d+$/.test(l) && !/^(Kind|Language):/.test(l))
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function transcribeYouTube(url, { maxChars = 6000 } = {}) {
  if (!(await ytDlpAvailable())) return null;
  const dir = mkdtempSync(join(tmpdir(), "aifh-"));
  try {
    await exec(
      "yt-dlp",
      ["--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*", "--sub-format", "vtt", "-o", join(dir, "%(id)s.%(ext)s"), url],
      { timeout: 90000 }
    );
    const vtt = readdirSync(dir).find((f) => f.endsWith(".vtt"));
    return vtt ? vttToText(readFileSync(join(dir, vtt), "utf8")).slice(0, maxChars) : null;
  } catch {
    return null;
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}
