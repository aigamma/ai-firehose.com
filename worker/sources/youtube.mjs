/*
  YouTube source adapter (primary source).

  Reads the curated registry (youtube_registry.mjs) and polls each active
  channel's free RSS feed for new uploads. No API key. Returns normalized raw
  items. Transcript enrichment (yt-dlp captions, Whisper fallback) is layered on
  in transcript.mjs; this adapter handles detection plus title and description.
*/
import { pathToFileURL } from "node:url";
import { activeChannels } from "./youtube_registry.mjs";
import { classifyShorts, loadShortVerdicts, saveShortVerdicts, shortIdSet } from "./youtube_shorts.mjs";

const FEED = (id) => `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;

const decode = (s) =>
  String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : "";
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The feed endpoint is flaky from datacenter IPs (intermittent 404 and 5xx even
// for valid channels). Retry with backoff; a few attempts reliably succeed.
export async function fetchFeed(id, attempts = 5) {
  let last = "";
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const r = await fetch(FEED(id), { headers: { "User-Agent": UA, "Accept-Language": "en-US,en" }, signal: AbortSignal.timeout(15000) });
      if (r.ok) return r.text();
      last = `HTTP ${r.status}`;
    } catch (e) {
      last = e.message;
    }
    if (i < attempts) await sleep(i * 1000);
  }
  throw new Error(last || "failed");
}

export function parseEntries(xml, channel) {
  return xml
    .split(/<entry>/)
    .slice(1)
    .map((chunk) => chunk.split(/<\/entry>/)[0])
    .map((e) => {
      const videoId = tag(e, "yt:videoId");
      const title = decode(tag(e, "title"));
      const desc = decode(tag(e, "media:description"));
      const published = tag(e, "published");
      const views = (e.match(/views="(\d+)"/) || [])[1];
      return {
        source: "youtube",
        source_id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        summary_text: [title, desc].filter(Boolean).join("\n\n").slice(0, 4000),
        author_or_channel: channel.name,
        published_at: published || null,
        engagement: views ? Number(views) : 0,
        source_authority_weight: channel.authority_weight ?? 0.8,
        kind_bias: channel.kind_bias || "mixed",
      };
    })
    .filter((x) => x.source_id);
}

export async function fetchYouTube({ maxAgeDays = 100, perChannel = 15 } = {}) {
  const cutoff = Date.now() - maxAgeDays * 86400000;
  let items = [];
  for (const ch of activeChannels()) {
    try {
      const xml = await fetchFeed(ch.channel_id);
      const recent = parseEntries(xml, ch)
        .filter((it) => !it.published_at || new Date(it.published_at).getTime() >= cutoff)
        .slice(0, perChannel);
      items.push(...recent);
    } catch (e) {
      console.error(`youtube ${ch.name}: ${e.message}`);
    }
    await sleep(400); // small spacing to ease the feed endpoint's rate mitigation
  }
  // Keep YouTube Shorts out of the corpus at the source. Shorts read as a trick here
  // (longer to open than to watch), so they never enter the store, the boards, search,
  // the Watch surface, or the vector store. Detection is the cached /shorts/ redirect
  // probe (youtube_shorts.mjs); only CONFIRMED shorts are dropped, so a probe failure
  // never loses a real video (fail open). Bounded per run (SHORTS_PROBE_MAX, default
  // 150) so a warm corpus probes only the few genuinely-new ids, and disabled entirely
  // by FILTER_SHORTS=0. The verdict cache is committed, so verdicts accumulate.
  if (process.env.FILTER_SHORTS !== "0" && items.length) {
    const verdicts = loadShortVerdicts();
    const max = Number(process.env.SHORTS_PROBE_MAX) || 150;
    const { probed, shorts, errors } = await classifyShorts(items.map((it) => it.source_id), { verdicts, max });
    if (probed) saveShortVerdicts(verdicts);
    const shortIds = shortIdSet(verdicts);
    const before = items.length;
    items = items.filter((it) => !shortIds.has(it.source_id));
    const dropped = before - items.length;
    if (dropped || probed) console.log(`   youtube shorts: ${dropped} dropped (${probed} probed, ${shorts} new shorts, ${errors} undetermined)`);
  }
  // Optional transcript enrichment (Fly worker only; gated so it never runs where
  // yt-dlp is absent). Best-effort and BOUNDED: yt-dlp is slow and is blocked or
  // rate-limited from datacenter IPs, so cap both the count (TRANSCRIPT_MAX) and
  // the total wall-clock (TRANSCRIPT_BUDGET_MS, default 3 min) and always return
  // the feed items regardless. Enrichment must never stall the run or drop the
  // videos already fetched from RSS; a video without a transcript keeps its
  // title-plus-description summary.
  if (process.env.ENABLE_TRANSCRIPTS === "1" && items.length) {
    const { transcribeYouTube } = await import("../pipeline/transcript.mjs");
    const maxVideos = Number(process.env.TRANSCRIPT_MAX) || items.length;
    const deadline = Date.now() + (Number(process.env.TRANSCRIPT_BUDGET_MS) || 180000);
    let enriched = 0;
    for (const it of items) {
      if (enriched >= maxVideos || Date.now() >= deadline) break;
      const t = await transcribeYouTube(it.url).catch(() => null);
      if (t) it.summary_text = `${it.title}\n\n${t}`.slice(0, 6000);
      enriched += 1;
    }
  }
  return items;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const days = Number(process.argv[2]) || 3650;
  fetchYouTube({ maxAgeDays: days, perChannel: 3 }).then((items) => {
    console.log(`fetched ${items.length} videos from the registry`);
    items.slice(0, 12).forEach((i) => console.log(`- [${i.author_or_channel}] ${i.title}  (${i.published_at})`));
  });
}
