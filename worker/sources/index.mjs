import { fetchYouTube } from "./youtube.mjs";
import { fetchHackerNews } from "./hackernews.mjs";
import { fetchArxiv } from "./arxiv.mjs";
import { fetchGitHub } from "./github.mjs";
import { fetchBlogs } from "./blogs.mjs";
import { fetchReddit } from "./reddit.mjs";
import { fetchHuggingFace } from "./huggingface.mjs";
import { decodeEntities } from "../lib/text.mjs";

/*
  Source aggregator. Runs every adapter, tolerant of any one failing (a flaky
  feed or a rate limit must not sink the run). YouTube is primary; arXiv and
  Hacker News add research and launch signal. New adapters register here.
*/
// Hard per-adapter wall-clock budget. The Promise.allSettled below rescues a
// rejected adapter but not a hung one (see docs/SOURCES.md): per-HTTP-call
// timeouts bound a single request, but an adapter that loops over many calls
// (YouTube feed retries, the per-video transcript loop) can still run for many
// minutes. This watchdog turns a stall into a clean, logged rejection so one slow
// or IP-blocked source cannot sink the daily run. It bounds wall-clock, not the
// underlying work, which is fine for a batch process that exits when the run ends.
export function withTimeout(promise, ms, name) {
  let timer;
  const guard = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${name} exceeded its ${ms}ms budget`)), ms);
  });
  return Promise.race([Promise.resolve(promise), guard]).finally(() => clearTimeout(timer));
}

export async function fetchAll({ maxAgeDays = 100 } = {}) {
  // Each entry is [name, fn, budgetMs]. YouTube is primary and may retry flaky
  // feeds (and enrich transcripts when enabled), so it gets the largest budget.
  const adapters = [
    ["youtube", () => fetchYouTube({ maxAgeDays, perChannel: 15 }), 480000],
    ["hackernews", () => fetchHackerNews({ maxAgeDays, limit: 40 }), 120000],
    ["arxiv", () => fetchArxiv({ maxAgeDays, limit: 30 }), 120000],
    ["github", () => fetchGitHub({ maxAgeDays, limit: 25 }), 120000],
    ["blogs", () => fetchBlogs({ maxAgeDays, perFeed: 5 }), 180000],
    ["reddit", () => fetchReddit({ maxAgeDays, perSub: 12 }), 90000],
    ["huggingface", () => fetchHuggingFace({ maxAgeDays, limit: 30 }), 120000],
  ];
  const results = await Promise.allSettled(adapters.map(([name, fn, ms]) => withTimeout(fn(), ms, name)));
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
  // Decode HTML/XML entities in the verbatim text fields once, here, so every adapter is
  // covered uniformly. The per-adapter decoders missed numeric (&#8217;) and hex (&#x2F;)
  // refs, leaking curly quotes and escaped slashes into the titles shown on the site. The
  // model summary is generated downstream from this decoded text. See worker/lib/text.mjs.
  return items.map((it) => ({
    ...it,
    title: decodeEntities(it.title),
    summary_text: decodeEntities(it.summary_text),
    author_or_channel: decodeEntities(it.author_or_channel),
  }));
}
