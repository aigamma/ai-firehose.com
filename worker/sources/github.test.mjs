import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { fetchGitHub } from "./github.mjs";

// fetchGitHub queries the GitHub repo Search API once per topic (llm, ai-agents,
// generative-ai, rag), merges the results deduped by repo id, sorts by stars, slices to
// limit, and normalizes each repo into the uniform corpus item shape via toItem. These
// tests mock global fetch with canned Search API JSON (no network), pinning the
// normalization the adapter owns: field mapping, the full_name + description summary,
// the star -> engagement mapping, dedup across topics, the sort, the per-topic and total
// caps, and the empty case. The recency cutoff is enforced server-side by the
// created:>=since query string, not client-side, so it is not re-checked here.
//
// Only the success path is exercised (every mocked response is ok: true); the failure
// path is swallowed per-topic by the adapter. The adapter also sleeps 2s after each of
// the 4 topic queries (~8s of real time), so the timer is mocked and ticked through,
// keeping the suite well under a second.

function withFetch(responder, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = responder;
  // Mock setTimeout so the adapter's `await sleep(2000)` between topic queries resolves
  // instantly; without this the suite would take ~8s of real wall-clock time.
  mock.timers.enable({ apis: ["setTimeout"] });
  // Drive the 4 sequential fetch/sleep pairs: flush microtasks (so each awaited fetch and
  // its sleep are scheduled) then fire every pending timer, repeating enough times to
  // cover all four topics plus margin.
  const pump = (async () => {
    for (let i = 0; i < 50; i++) {
      await Promise.resolve();
      mock.timers.runAll();
    }
  })();
  return Promise.resolve()
    .then(fn)
    .finally(async () => {
      await pump;
      mock.timers.reset();
      globalThis.fetch = real;
    });
}

// A canned ok response whose json() yields the GitHub Search API shape { items: [...] }.
const okJson = (items) => async () => ({ ok: true, json: async () => ({ items }) });

// Returns the same repo list for every topic query (url-agnostic). Because the adapter
// dedupes by repo id, a repo that appears under multiple topics collapses to one item.
const REPO = ({
  id = 1,
  full_name = "acme/cool-llm",
  description = "A cool LLM toolkit.",
  html_url = "https://github.com/acme/cool-llm",
  owner = "acme",
  created_at = "2099-01-01T00:00:00Z", // far-future; the cutoff is server-side anyway
  stargazers_count = 100,
} = {}) => ({
  id,
  full_name,
  description,
  html_url,
  owner: { login: owner },
  created_at,
  stargazers_count,
});

test("normalizes a GitHub repo into the uniform corpus item shape", async () => {
  await withFetch(okJson([REPO()]), async () => {
    const items = await fetchGitHub();
    assert.equal(items.length, 1, "one unique repo across the four topic queries");
    const it = items[0];
    assert.equal(it.source, "github");
    assert.equal(it.source_id, "1", "source_id is the stringified repo id");
    assert.equal(it.url, "https://github.com/acme/cool-llm");
    assert.equal(it.title, "acme/cool-llm", "title is the repo full_name");
    assert.match(it.summary_text, /acme\/cool-llm/);
    assert.match(it.summary_text, /A cool LLM toolkit\./);
    assert.equal(it.author_or_channel, "acme", "author is the owner login");
    assert.equal(it.published_at, "2099-01-01T00:00:00Z");
    assert.equal(it.engagement, 100, "engagement is the star count");
    assert.equal(it.source_authority_weight, 0.65);
    assert.equal(it.kind_bias, "tool");
  });
});

test("builds summary_text from full_name and description joined by a blank line", async () => {
  await withFetch(
    okJson([REPO({ full_name: "org/repo", description: "Does a thing." })]),
    async () => {
      const items = await fetchGitHub();
      assert.equal(items[0].summary_text, "org/repo\n\nDoes a thing.");
    }
  );
});

test("omits a missing description from summary_text (no trailing separator)", async () => {
  await withFetch(
    okJson([REPO({ full_name: "org/repo", description: null })]),
    async () => {
      const items = await fetchGitHub();
      assert.equal(items[0].summary_text, "org/repo", "no description means no \\n\\n tail");
    }
  );
});

test("defaults engagement to 0 when stargazers_count is missing", async () => {
  // Build a repo then drop the star field entirely (a default param of undefined would
  // be replaced by REPO's own default, so delete the key to truly omit it).
  const repo = REPO();
  delete repo.stargazers_count;
  await withFetch(okJson([repo]), async () => {
    const items = await fetchGitHub();
    assert.equal(items[0].engagement, 0);
  });
});

test("dedupes a repo that appears under multiple topic queries", async () => {
  // Every topic query returns the SAME single repo id; it must collapse to one item.
  await withFetch(okJson([REPO({ id: 42, full_name: "dup/repo" })]), async () => {
    const items = await fetchGitHub();
    assert.equal(items.length, 1, "the same id across all four topics is one item");
    assert.equal(items[0].source_id, "42");
  });
});

test("sorts merged repos by stars descending", async () => {
  await withFetch(
    okJson([
      REPO({ id: 1, full_name: "a/low", stargazers_count: 5 }),
      REPO({ id: 2, full_name: "b/high", stargazers_count: 9000 }),
      REPO({ id: 3, full_name: "c/mid", stargazers_count: 500 }),
    ]),
    async () => {
      const items = await fetchGitHub();
      assert.deepEqual(
        items.map((i) => i.title),
        ["b/high", "c/mid", "a/low"],
        "highest star count first"
      );
    }
  );
});

test("caps the merged result at the limit", async () => {
  const many = Array.from({ length: 10 }, (_, i) =>
    REPO({ id: i + 1, full_name: `org/repo-${i + 1}`, stargazers_count: (i + 1) * 100 })
  );
  await withFetch(okJson(many), async () => {
    const items = await fetchGitHub({ limit: 3 });
    assert.equal(items.length, 3, "sliced to limit after sort/dedupe");
    assert.deepEqual(
      items.map((i) => i.title),
      ["org/repo-10", "org/repo-9", "org/repo-8"],
      "the three highest-starred survive the cap"
    );
  });
});

test("merges distinct repos across topic queries (url-aware mock)", async () => {
  // A url-aware responder returns a different repo per topic, exercising the merge of
  // results from separate queries rather than dedup of one repeated repo.
  const byTopic = {
    "topic%3Allm": [REPO({ id: 1, full_name: "x/llm", stargazers_count: 10 })],
    "topic%3Aai-agents": [REPO({ id: 2, full_name: "x/agents", stargazers_count: 40 })],
    "topic%3Agenerative-ai": [REPO({ id: 3, full_name: "x/genai", stargazers_count: 20 })],
    "topic%3Arag": [REPO({ id: 4, full_name: "x/rag", stargazers_count: 30 })],
  };
  const responder = async (url) => {
    const key = Object.keys(byTopic).find((k) => url.includes(k));
    return { ok: true, json: async () => ({ items: key ? byTopic[key] : [] }) };
  };
  await withFetch(responder, async () => {
    const items = await fetchGitHub();
    assert.equal(items.length, 4, "one repo from each of the four topics");
    assert.deepEqual(
      items.map((i) => i.title),
      ["x/agents", "x/rag", "x/genai", "x/llm"],
      "merged then sorted by stars desc"
    );
  });
});

test("returns an empty list when no repos are found", async () => {
  await withFetch(okJson([]), async () => {
    assert.deepEqual(await fetchGitHub(), []);
  });
});
