/*
  YouTube channel registry manager.

  Lets Eric curate the primary source as he discovers stars, with no API key:
    node worker/sources/youtube_registry.mjs add @nicksaraev --weight=0.95 --kind=mixed
    node worker/sources/youtube_registry.mjs add @handleA @handleB --weight=0.85
    node worker/sources/youtube_registry.mjs remove @handle
    node worker/sources/youtube_registry.mjs list
    node worker/sources/youtube_registry.mjs resolve @handle   (print id, no write)

  It resolves a @handle, URL, or UC id to a channel_id by fetching the public
  channel page and extracting it, then writes sources/youtube_channels.json
  (idempotent: re-adding updates in place). The adapter polls each channel's free
  RSS feed: https://www.youtube.com/feeds/videos.xml?channel_id=<id>
*/
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FILE = resolve(dirname(fileURLToPath(import.meta.url)), "../../sources/youtube_channels.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const decodeHtml = (s) =>
  String(s).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export function load() {
  return JSON.parse(readFileSync(FILE, "utf8"));
}

export function save(data) {
  // Drop placeholder/empty entries and sort by name for a stable file.
  data.channels = (data.channels || [])
    .filter((c) => c.channel_id)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`);
}

function normalizeUrl(input) {
  const s = String(input).trim();
  if (/^UC[\w-]{22}$/.test(s)) return `https://www.youtube.com/channel/${s}`;
  if (s.startsWith("http")) return s;
  return `https://www.youtube.com/@${s.replace(/^@/, "")}`;
}

export async function resolveChannel(input) {
  const url = normalizeUrl(input);
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-US,en" }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`fetch ${r.status}`);
  const html = await r.text();
  // Prefer the authoritative RSS-alternate / canonical link; the first
  // "channelId" in the page blob is not always the channel's own.
  const idm =
    html.match(/rss\+xml"[^>]*href="[^"]*channel_id=(UC[\w-]{22})/) ||
    html.match(/rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})/) ||
    html.match(/"externalId":"(UC[\w-]{22})"/) ||
    html.match(/"channelId":"(UC[\w-]{22})"/);
  if (!idm) throw new Error("no channelId on page");
  const nameM = html.match(/<meta property="og:title" content="([^"]+)"/);
  const handleM = html.match(/"canonicalBaseUrl":"\/(@[\w.-]+)"/);
  return {
    channel_id: idm[1],
    name: nameM ? decodeHtml(nameM[1]) : String(input),
    handle: handleM ? handleM[1] : String(input).startsWith("@") ? String(input) : "",
  };
}

export async function addChannel(input, { weight = 0.85, kind = "mixed", hide } = {}) {
  const data = load();
  const info = await resolveChannel(input);
  data.channels = data.channels || [];
  const existing = data.channels.find((c) => c.channel_id === info.channel_id);
  // hide === true marks the channel track-only: ingested and rotation-weighted, but not
  // listed in the public Watch directory (logged and tracked, not endorsed). hide === false
  // clears the flag (endorse it); undefined leaves any existing flag untouched, so a plain
  // re-add never silently un-hides a track-only channel.
  const setHide = (entry) => {
    if (hide === true) entry.hide_from_directory = true;
    else if (hide === false) delete entry.hide_from_directory;
  };
  if (existing) {
    Object.assign(existing, { name: info.name, authority_weight: weight, kind_bias: kind, active: true });
    if (info.handle) existing.handle = info.handle;
    setHide(existing);
  } else {
    const entry = { channel_id: info.channel_id, name: info.name, handle: info.handle, authority_weight: weight, kind_bias: kind, active: true };
    if (hide === true) entry.hide_from_directory = true;
    data.channels.push(entry);
  }
  save(data);
  return info;
}

export function removeChannel(key) {
  const data = load();
  const k = String(key).replace(/^@/, "");
  const before = (data.channels || []).length;
  data.channels = (data.channels || []).filter(
    (c) => c.channel_id !== key && c.handle !== key && (c.handle || "").replace(/^@/, "") !== k
  );
  save(data);
  return before - (data.channels || []).length;
}

// Active channels for the adapter to poll.
export function activeChannels() {
  return (load().channels || []).filter((c) => c.active && c.channel_id);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || "").href;
if (isMain) {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = rest.filter((a) => !a.startsWith("--"));
  const flags = Object.fromEntries(
    rest.filter((a) => a.startsWith("--")).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    })
  );
  const hide = flags.hide || flags["track-only"] ? true : flags.endorse || flags.list ? false : undefined;
  const opts = { weight: flags.weight ? Number(flags.weight) : 0.85, kind: flags.kind || "mixed", hide };
  (async () => {
    if (cmd === "add") {
      for (const a of args) {
        try {
          const info = await addChannel(a, opts);
          console.log(`added ${info.name}  ${info.handle || ""}  ${info.channel_id}  w=${opts.weight} ${opts.kind}`);
        } catch (e) {
          console.log(`skip ${a}: ${e.message}`);
        }
      }
    } else if (cmd === "remove") {
      for (const a of args) console.log(`removed ${removeChannel(a)} for ${a}`);
    } else if (cmd === "list") {
      for (const c of load().channels || []) {
        console.log(`${c.active ? "*" : " "} ${c.name}  ${c.handle || ""}  ${c.channel_id}  w=${c.authority_weight} ${c.kind_bias}`);
      }
    } else if (cmd === "resolve") {
      for (const a of args) {
        try {
          console.log(JSON.stringify(await resolveChannel(a)));
        } catch (e) {
          console.log(`skip ${a}: ${e.message}`);
        }
      }
    } else {
      console.log("usage: node worker/sources/youtube_registry.mjs <add|remove|list|resolve> <@handle|url|UCid> [--weight=0.9] [--kind=mixed]");
    }
  })();
}
