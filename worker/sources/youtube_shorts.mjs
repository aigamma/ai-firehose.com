/*
  YouTube Shorts detection.

  Shorts are low-value here: they take longer to open than to watch and read as a
  trick, so they are kept out of the corpus entirely (and therefore out of the Watch
  surface, the boards, search, and the vector store). The RSS feed the adapter polls
  carries NO duration and NO shorts marker (verified: yt:videoId, title,
  media:description, published, views only), so a Short cannot be told from a regular
  upload at parse time, and many Shorts do not carry "#shorts" in the title.

  The authoritative, keyless oracle is the canonical /shorts/ redirect behavior:
    GET https://www.youtube.com/shorts/<id>  (no auto-redirect)
      -> 200            the video IS a Short (served on the Shorts player)
      -> 30x /watch?v=  a regular video (Shorts URL redirects to the watch page)
  Empirically clean from a residential IP (200 for Shorts, 303 to /watch for regular,
  zero ambiguity), and unlike yt-dlp it is a normal lightweight web request, so it is
  the best option from the worker's datacenter IP too. It can still be rate-limited or
  fail; every consumer therefore FAILS OPEN (an undetermined video is treated as a
  regular video, never wrongly dropped), and the bounded, cached probing below keeps a
  transient failure cheap to retry.

  Verdicts are cached in worker/.cache/shorts.json (id -> boolean), COMMITTED durable
  state like items.json and the vector manifest: a Short is always a Short, the worker
  clones fresh each run, and a datacenter-IP probe is the expensive part, so the verdict
  must persist or every run re-probes the whole corpus. Only confident verdicts are
  cached; an errored probe is left unknown so a later run retries it.
*/
import { loadCache, saveCache } from "../lib/cache.mjs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const SHORTS_URL = (id) => `https://www.youtube.com/shorts/${id}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ----- Pure helpers (unit-tested in youtube_shorts.test.mjs) -----

// Map a /shorts/<id> HTTP status to a verdict: true = Short, false = regular video,
// null = undetermined (treat as regular, do not cache). 200 is the Shorts player; any
// 3xx is the redirect to the watch page; anything else (403/429/5xx/network) is unknown.
export function verdictFromStatus(status) {
  if (status === 200) return true;
  if (status >= 300 && status < 400) return false;
  return null;
}

// The set of video ids confidently known to be Shorts (verdict === true). Used by the
// ingest filter, the run.mjs store guard, and the Watch video selection.
export function shortIdSet(verdicts = {}) {
  return new Set(Object.keys(verdicts).filter((id) => verdicts[id] === true));
}

// Split ids against the verdict cache: known Shorts, known regular, and not-yet-probed.
export function partitionByVerdict(ids = [], verdicts = {}) {
  const shorts = [];
  const regular = [];
  const unknown = [];
  for (const id of ids) {
    const v = verdicts[id];
    if (v === true) shorts.push(id);
    else if (v === false) regular.push(id);
    else unknown.push(id);
  }
  return { shorts, regular, unknown };
}

// ----- Verdict cache IO (worker/.cache/shorts.json) -----

export function loadShortVerdicts() {
  const raw = loadCache("shorts");
  return raw && typeof raw === "object" ? raw : {};
}

export function saveShortVerdicts(verdicts) {
  saveCache("shorts", verdicts);
}

// Convenience for read-only consumers (the store guard, the Watch selection): the set
// of confirmed-Short ids from the committed cache. No network.
export function loadShortIds() {
  return shortIdSet(loadShortVerdicts());
}

// ----- The network probe -----

// Probe one id. Returns true (Short), false (regular), or null (undetermined). Never
// throws: a timeout or network error is null, so callers fail open.
export async function probeIsShort(id, { timeoutMs = 12000, ua = UA } = {}) {
  try {
    const r = await fetch(SHORTS_URL(id), {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": ua, "Accept-Language": "en-US,en" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    // A 200 streams the full Shorts watch page; we only need the status line, so
    // discard the body to avoid downloading it.
    try { await r.body?.cancel?.(); } catch {}
    return verdictFromStatus(r.status);
  } catch {
    return null;
  }
}

// Probe the not-yet-known ids in `ids`, up to `max`, filling and returning the verdict
// map. Confident verdicts (Short or regular) are cached; an errored probe is left
// unknown for a later run. Spaced to ease YouTube's rate mitigation. `onResult(id,
// verdict)` is an optional progress callback. Mutates and returns `verdicts`.
export async function classifyShorts(ids = [], { verdicts = {}, max = Infinity, spacingMs = 200, onResult } = {}) {
  const { unknown } = partitionByVerdict(ids, verdicts);
  let probed = 0;
  let found = 0;
  let errors = 0;
  for (const id of unknown) {
    if (probed >= max) break;
    const v = await probeIsShort(id);
    probed += 1;
    if (v === null) {
      errors += 1; // leave unknown: do not cache, retry next run
    } else {
      verdicts[id] = v;
      if (v === true) found += 1;
    }
    if (onResult) onResult(id, v);
    if (spacingMs) await sleep(spacingMs);
  }
  return { verdicts, probed, shorts: found, errors, remaining: Math.max(0, unknown.length - probed) };
}
