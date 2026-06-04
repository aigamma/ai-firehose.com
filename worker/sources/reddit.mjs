/*
  Reddit adapter. Top posts from a few AI subreddits via the public JSON endpoint.
  Reddit can rate-limit or block datacenter IPs (403/429); the aggregator is
  tolerant, so a failure here just means no Reddit items this run.
*/
const SUBS = ["LocalLLaMA", "MachineLearning", "artificial", "singularity", "OpenAI", "StableDiffusion"];
const UA = "ai-firehose/0.1 (AI news aggregation; contact via ai-firehose.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchReddit({ maxAgeDays = 100, perSub = 12 } = {}) {
  const cutoff = Date.now() - maxAgeDays * 86400000;
  const out = [];
  for (const sub of SUBS) {
    try {
      const r = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=month&limit=${perSub}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) {
        console.log(`   reddit ${sub}: ${r.status}`);
        continue;
      }
      const j = await r.json();
      for (const c of j.data?.children || []) {
        const d = c.data;
        if (!d || !d.title) continue;
        const published = new Date((d.created_utc || 0) * 1000).toISOString();
        if (new Date(published).getTime() < cutoff) continue;
        out.push({
          source: "reddit",
          source_id: d.id,
          url: d.url_overridden_by_dest || `https://www.reddit.com${d.permalink}`,
          title: d.title,
          summary_text: [d.title, (d.selftext || "").slice(0, 1500)].filter(Boolean).join("\n\n"),
          author_or_channel: `r/${d.subreddit}`,
          published_at: published,
          engagement: d.score || 0,
          source_authority_weight: 0.55,
          kind_bias: "opinion",
        });
      }
    } catch (e) {
      console.log(`   reddit ${sub}: ${e.message}`);
    }
    await sleep(800);
  }
  return out;
}
