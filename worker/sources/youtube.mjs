/*
  YouTube source adapter (primary source).

  Reads the curated registry (youtube_registry.mjs) and polls each active
  channel's free RSS feed for new uploads. No API key. Returns normalized raw
  items. Transcript enrichment (yt-dlp captions, Whisper fallback) is layered on
  in transcript.mjs; this adapter handles detection plus title and description.
*/
import { pathToFileURL } from "node:url";
import { activeChannels } from "./youtube_registry.mjs";

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
async function fetchFeed(id, attempts = 5) {
  let last = "";
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const r = await fetch(FEED(id), { headers: { "User-Agent": UA, "Accept-Language": "en-US,en" } });
      if (r.ok) return r.text();
      last = `HTTP ${r.status}`;
    } catch (e) {
      last = e.message;
    }
    if (i < attempts) await sleep(i * 1000);
  }
  throw new Error(last || "failed");
}

function parseEntries(xml, channel) {
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
  const items = [];
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
  // Optional transcript enrichment (Fly worker only; gated so it never runs
  // where yt-dlp is absent). Replaces title+description with the full transcript.
  if (process.env.ENABLE_TRANSCRIPTS === "1" && items.length) {
    const { transcribeYouTube } = await import("../pipeline/transcript.mjs");
    for (const it of items) {
      const t = await transcribeYouTube(it.url).catch(() => null);
      if (t) it.summary_text = `${it.title}\n\n${t}`.slice(0, 6000);
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
