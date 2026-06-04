import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/*
  Blogs and newsletters adapter. Reads a curated feed manifest (sources/blogs.json)
  and parses each RSS or Atom feed generically. Tolerant: a dead or moved feed is
  skipped, never sinks the run. Eric curates the manifest.
*/
const MANIFEST = resolve(dirname(fileURLToPath(import.meta.url)), "../../sources/blogs.json");

const tag = (b, n) => {
  const m = b.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`, "i"));
  return m ? m[1] : "";
};
const clean = (s) =>
  String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function parseFeed(xml, feed) {
  const isAtom = /<feed[\s>]/.test(xml) && !/<rss/i.test(xml);
  const splitOpen = isAtom ? /<entry[\s>]/ : /<item[\s>]/;
  const splitClose = isAtom ? /<\/entry>/ : /<\/item>/;
  const blocks = xml.split(splitOpen).slice(1).map((b) => b.split(splitClose)[0]);
  return blocks
    .map((b) => {
      const title = clean(tag(b, "title"));
      let link = "";
      if (isAtom) {
        const m = b.match(/<link[^>]*href="([^"]+)"/i);
        link = m ? m[1] : "";
      } else {
        link = clean(tag(b, "link"));
      }
      const date = tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date");
      const desc = clean(tag(b, "description") || tag(b, "summary") || tag(b, "content"));
      let published = null;
      const t = new Date(date).getTime();
      if (Number.isFinite(t)) published = new Date(t).toISOString();
      const id = (isAtom ? tag(b, "id") || link : clean(tag(b, "guid")) || link) || link || title;
      return {
        source: "blog",
        source_id: id,
        url: link || "#",
        title,
        summary_text: [title, desc].filter(Boolean).join("\n\n").slice(0, 3000),
        author_or_channel: feed.name,
        published_at: published,
        engagement: 0,
        source_authority_weight: feed.weight ?? 0.7,
        kind_bias: "opinion",
      };
    })
    .filter((x) => x.title);
}

export async function fetchBlogs({ maxAgeDays = 100, perFeed = 5 } = {}) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    return [];
  }
  const cutoff = Date.now() - maxAgeDays * 86400000;
  const out = [];
  for (const feed of manifest.feeds || []) {
    try {
      const r = await fetch(feed.url, { headers: { "User-Agent": "ai-firehose/0.1", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) {
        console.log(`   blog ${feed.name}: ${r.status}`);
        continue;
      }
      const recent = parseFeed(await r.text(), feed)
        .filter((it) => !it.published_at || new Date(it.published_at).getTime() >= cutoff)
        .slice(0, perFeed);
      out.push(...recent);
    } catch (e) {
      console.log(`   blog ${feed.name}: ${e.message}`);
    }
  }
  return out;
}
