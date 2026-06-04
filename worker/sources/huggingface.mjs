/*
  Hugging Face adapter. The daily papers feed: a community-upvoted selection of
  recent papers, a clean complement to the raw arXiv firehose. (Trending models
  are skipped here because GitHub already covers new tools, and HF's all-time
  popular models are older than the retention window and would be pruned.)
*/
const UA = "ai-firehose/0.1";

export async function fetchHuggingFace({ maxAgeDays = 100, limit = 30 } = {}) {
  const cutoff = Date.now() - maxAgeDays * 86400000;
  const out = [];
  try {
    const r = await fetch(`https://huggingface.co/api/daily_papers?limit=${limit}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`hf ${r.status}`);
    const papers = await r.json();
    if (!Array.isArray(papers)) return out;
    for (const it of papers) {
      const paper = it.paper || it;
      const pub = it.publishedAt || paper.publishedAt;
      const published = pub ? new Date(pub).toISOString() : null;
      if (published && new Date(published).getTime() < cutoff) continue;
      if (!paper.title) continue;
      // No paper.id means no stable id and a dead /papers/ URL, so skip rather
      // than emit a title-keyed item with a broken link.
      if (!paper.id) continue;
      out.push({
        source: "huggingface",
        source_id: `paper:${paper.id}`,
        url: `https://huggingface.co/papers/${paper.id}`,
        title: String(paper.title).replace(/\s+/g, " ").trim(),
        summary_text: [paper.title, (paper.summary || "").replace(/\s+/g, " ").slice(0, 1500)].filter(Boolean).join("\n\n"),
        author_or_channel: "HF Papers",
        published_at: published,
        engagement: paper.upvotes || it.upvotes || 0,
        source_authority_weight: 0.72,
        kind_bias: "technique",
      });
    }
  } catch (e) {
    console.log(`   hf papers: ${e.message}`);
  }
  return out;
}
