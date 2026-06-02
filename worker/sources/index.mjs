import { fetchYouTube } from "./youtube.mjs";
import { fetchHackerNews } from "./hackernews.mjs";
import { fetchArxiv } from "./arxiv.mjs";
import { fetchGitHub } from "./github.mjs";
import { fetchBlogs } from "./blogs.mjs";

/*
  Source aggregator. Runs every adapter, tolerant of any one failing (a flaky
  feed or a rate limit must not sink the run). YouTube is primary; arXiv and
  Hacker News add research and launch signal. New adapters register here.
*/
export async function fetchAll({ maxAgeDays = 100 } = {}) {
  const adapters = [
    ["youtube", () => fetchYouTube({ maxAgeDays, perChannel: 15 })],
    ["hackernews", () => fetchHackerNews({ maxAgeDays, limit: 40 })],
    ["arxiv", () => fetchArxiv({ maxAgeDays, limit: 30 })],
    ["github", () => fetchGitHub({ maxAgeDays, limit: 25 })],
    ["blogs", () => fetchBlogs({ maxAgeDays, perFeed: 5 })],
  ];
  const results = await Promise.allSettled(adapters.map(([, fn]) => fn()));
  const items = [];
  results.forEach((r, i) => {
    const name = adapters[i][0];
    if (r.status === "fulfilled") {
      items.push(...r.value);
      console.log(`   ${name}: ${r.value.length}`);
    } else {
      console.log(`   ${name} failed: ${r.reason?.message}`);
    }
  });
  return items;
}
