/*
  GitHub adapter. New AI repositories created within the retention window, ranked
  by stars, via the public Search API. GitHub repo search does not support
  parenthesized topic OR, so we query a few topics separately and merge. New
  repos (not long-lived ones) are what counts as a fresh tool.
*/
const TOPICS = ["llm", "ai-agents", "generative-ai", "rag"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toItem(repo) {
  return {
    source: "github",
    source_id: String(repo.id),
    url: repo.html_url,
    title: repo.full_name,
    summary_text: [repo.full_name, repo.description || ""].filter(Boolean).join("\n\n").slice(0, 2000),
    author_or_channel: repo.owner?.login || "",
    published_at: repo.created_at,
    engagement: repo.stargazers_count || 0,
    source_authority_weight: 0.65,
    kind_bias: "tool",
  };
}

export async function fetchGitHub({ maxAgeDays = 100, limit = 25, perTopic = 12 } = {}) {
  const since = new Date(Date.now() - maxAgeDays * 86400000).toISOString().slice(0, 10);
  const byId = new Map();
  for (const topic of TOPICS) {
    const q = `topic:${topic} created:>=${since}`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${perTopic}`;
    try {
      const r = await fetch(url, { headers: { Accept: "application/vnd.github+json", "User-Agent": "ai-firehose/0.1" } });
      if (r.ok) {
        const j = await r.json();
        for (const repo of j.items || []) if (!byId.has(repo.id)) byId.set(repo.id, repo);
      }
    } catch {
      /* skip a flaky topic query */
    }
    await sleep(2000); // unauthenticated search rate limit is ~10/min
  }
  return [...byId.values()]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, limit)
    .map(toItem);
}
