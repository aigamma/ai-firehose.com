/*
  The Watch-cycle digest writer (an agentic-summary layer for the Watch surface).

  A complement to the 6-hour ingestion: when new videos land, it paraphrases the most
  salient information across the latest videos from the favorite AI educators, weighting
  the recommended inner circle. Same narrator discipline as the daily briefing
  (descriptive not prescriptive, declarative, cited, no second person, no em dashes) and
  the same forced-tool structured output, so the prose comes back schema-valid. The prose
  is sanitized for em dashes before it enters the artifact (worker/lib/text.mjs). See
  docs/FEATURE_PLAYBOOK.md (the agentic-summary pattern) and the Citation Contract in
  docs/RAG.md.
*/

export const WATCH_DIGEST_SYSTEM = [
  "You are the Watch digest writer for AI Firehose, a personal AI-industry intelligence dashboard.",
  "Across the latest videos from a curated set of favorite AI educators, you state the most salient developments this cycle: what they are teaching, building, demoing, and arguing.",
  "Voice: tight, declarative, and factual, for a reader who already follows AI closely. No hype, no hedging, no recommendations, and never the second person.",
  "Weight the channels marked RECOMMENDED, the carefully vetted inner circle, more heavily: lead with what they cover when it is salient.",
  "Grounding: every claim must trace to a video in the provided list. Do not invent titles, names, numbers, products, or companies. If the videos are thin or off topic, keep it short and factual.",
  "Style rules (enforced downstream, but follow them): no em dashes anywhere, use a comma, colon, semicolon, period, parentheses, or the word 'and' instead; en dashes only for numeric ranges; the headline is one complete sentence ending in a period.",
].join(" ");

export const WATCH_DIGEST_TOOL = {
  name: "watch_digest",
  description: "Return the structured digest of the latest educator videos this cycle.",
  input_schema: {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "One complete sentence ending in a period that names the single most salient thread across the latest videos. No em dashes.",
      },
      body: {
        type: "string",
        description:
          "Two to four sentences paraphrasing the most salient information across the videos, weighting the recommended channels. Specific and concrete, grounded only in the provided videos. Reference videos by their [n] index. No em dashes.",
      },
      concepts: {
        type: "array",
        items: { type: "string" },
        description: "The concept slugs, taken exactly from the Concepts list in the prompt, that this digest discusses. Use the slug form, not the label.",
      },
      item_refs: {
        type: "array",
        items: { type: "integer" },
        description: "The [n] indices, from the Videos list in the prompt, of the videos this digest draws on.",
      },
    },
    required: ["headline", "body", "concepts"],
  },
};

// Compose the user prompt from the latest-video state. Concepts are listed with their exact
// slugs so the model cites real, linkable hub targets, mirroring the briefing prompt.
export function buildWatchDigestPrompt(state) {
  const video = (v, i) => {
    const rec = v.recommended ? ", RECOMMENDED" : "";
    const sum = v.summary ? `: ${v.summary}` : "";
    const cps = v.concepts?.length ? ` [concepts: ${v.concepts.join(", ")}]` : "";
    return `[${i}] ${v.title} (${v.channel}${rec})${sum}${cps}`;
  };
  const conceptList = state.concepts.map((c) => `- ${c.slug}: ${c.label}`).join("\n");

  return [
    "The latest videos from the favorite educators this cycle (recommended inner circle first, then newest):",
    state.videos.length ? state.videos.map(video).join("\n") : "- (none)",
    "",
    "Concepts you may cite (use these exact slugs in the concepts field):",
    conceptList || "- (none)",
    "",
    "Write the digest. Lead with the single most salient thread across these videos, weighting the recommended channels, then add concrete supporting detail. Cite the concepts you discuss by slug and reference the videos by their [n] index.",
  ].join("\n");
}
