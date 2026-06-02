/*
  arXiv adapter. Recent submissions in the core AI categories via the public Atom
  API. arXiv rate-limits aggressive callers (429), so retry with backoff and a
  descriptive User-Agent. Abstracts are rich, so these classify and embed well.
*/
const UA = "ai-firehose/0.1 (https://ai-firehose.com; research aggregation)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tag = (b, n) => {
  const m = b.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`));
  return m ? m[1].trim() : "";
};
const decode = (s) =>
  String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export async function fetchArxiv({ maxAgeDays = 100, limit = 30 } = {}) {
  const q = "cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL+OR+cat:cs.CV";
  const url = `http://export.arxiv.org/api/query?search_query=${q}&sortBy=submittedDate&sortOrder=descending&max_results=${limit}`;
  let xml = "";
  for (let i = 1; i <= 4; i += 1) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.ok) {
        xml = await r.text();
        break;
      }
    } catch {
      /* retry */
    }
    await sleep(i * 1500);
  }
  if (!xml) return [];
  const cutoff = Date.now() - maxAgeDays * 86400000;
  const entries = xml.split(/<entry>/).slice(1).map((e) => e.split(/<\/entry>/)[0]);
  const items = [];
  for (const e of entries) {
    const id = tag(e, "id");
    const title = decode(tag(e, "title")).replace(/\s+/g, " ").trim();
    const summary = decode(tag(e, "summary")).replace(/\s+/g, " ").trim();
    const published = tag(e, "published");
    const authors = [...e.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => m[1]).slice(0, 3).join(", ");
    if (!id || !title) continue;
    if (published && new Date(published).getTime() < cutoff) continue;
    items.push({
      source: "arxiv",
      source_id: (id.split("/abs/")[1] || id).trim(),
      url: id,
      title,
      summary_text: `${title}\n\n${summary}`.slice(0, 4000),
      author_or_channel: authors || "arXiv",
      published_at: published || null,
      engagement: 0,
      source_authority_weight: 0.7,
      kind_bias: "technique",
    });
  }
  return items;
}
