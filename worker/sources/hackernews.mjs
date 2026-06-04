/*
  Hacker News adapter. Pulls top stories via the public Firebase API and keeps
  the AI-relevant ones (title/text keyword gate, so we do not pay Claude to
  classify unrelated stories). Engagement is the HN score.
*/
const API = "https://hacker-news.firebaseio.com/v0";
const AI_RE = /\b(a\.?i\.?|llm|llms|gpt|claude|gemini|mistral|llama|qwen|openai|anthropic|deepmind|agent|agents|agentic|rag|transformer|diffusion|neural|machine learning|ml|fine-?tun|embedding|inference|reasoning|prompt|mcp|model|models)\b/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(u) {
  const r = await fetch(u, { headers: { "User-Agent": "ai-firehose/0.1" }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`hn ${r.status}`);
  return r.json();
}

export async function fetchHackerNews({ maxAgeDays = 100, limit = 40, scan = 150 } = {}) {
  // The topstories index is the seed for the whole adapter, so a transient failure
  // here would zero out all Hacker News items. Retry with backoff (same pattern as
  // arxiv.mjs); per-item fetches below stay individually guarded.
  let top = null;
  for (let i = 1; i <= 4; i += 1) {
    try {
      top = await getJson(`${API}/topstories.json`);
      break;
    } catch {
      /* retry */
    }
    await sleep(i * 1500);
  }
  if (!Array.isArray(top)) return [];
  const ids = top.slice(0, scan);
  const cutoff = Date.now() - maxAgeDays * 86400000;
  const items = [];
  for (const id of ids) {
    if (items.length >= limit) break;
    try {
      const s = await getJson(`${API}/item/${id}.json`);
      if (!s || s.type !== "story" || !s.title) continue;
      if (!AI_RE.test(`${s.title} ${s.text || ""}`)) continue;
      const published = new Date((s.time || 0) * 1000).toISOString();
      if (new Date(published).getTime() < cutoff) continue;
      items.push({
        source: "hackernews",
        source_id: String(id),
        url: s.url || `https://news.ycombinator.com/item?id=${id}`,
        title: s.title,
        summary_text: [s.title, (s.text || "").replace(/<[^>]+>/g, " ")].filter(Boolean).join("\n\n").slice(0, 3000),
        author_or_channel: s.by || "Hacker News",
        published_at: published,
        engagement: s.score || 0,
        source_authority_weight: 0.6,
        kind_bias: "mixed",
      });
    } catch {
      /* skip a flaky item */
    }
  }
  return items;
}
