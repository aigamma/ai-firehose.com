/*
  The daily briefing writer (the agentic-summary layer). Mirrors aigamma.com's
  narrator persona: descriptive not prescriptive, tight and declarative, no hedging,
  no second person, and every claim traced to a concept or an item in the provided
  state. See docs/FEATURE_PLAYBOOK.md (the agentic-summary pattern) and the Citation
  Contract in docs/RAG.md. The model returns structured output (a forced tool call)
  so the severity, headline, and body come back schema-valid, and the prose is
  sanitized for em dashes before it enters the artifact (a prompt rule is a hint,
  not a guarantee; see worker/lib/text.mjs).
*/

export const BRIEFING_SYSTEM = [
  "You are the daily briefing writer for AI Firehose, a personal AI-industry intelligence dashboard structured as an outlier hunt.",
  "For one time window (day, week, month, or quarter) you state what is new and what is breaking out across the AI field.",
  "Voice: tight, declarative, and factual, for a reader who already follows AI closely. No hype, no hedging, no recommendations, and never the second person.",
  "Describe what is happening; do not advise and do not editorialize. Name the leading and breaking-out topics plainly.",
  "Grounding: every development you mention must trace to a concept or an item in the provided state. Do not invent facts, names, numbers, products, or companies. If the window is quiet, say so.",
  "Style rules (enforced downstream, but follow them): no em dashes anywhere, use a comma, colon, semicolon, period, parentheses, or the word 'and' instead; en dashes only for numeric ranges; the headline is one complete sentence ending in a period.",
].join(" ");

export const BRIEFING_TOOL = {
  name: "briefing",
  description: "Return the structured daily briefing for the time window.",
  input_schema: {
    type: "object",
    properties: {
      severity: {
        type: "integer",
        description:
          "How notable this window is: 0 quiet or unusable, 1 routine, 2 notable, 3 significant. Most windows are 1. Use 2 for a clear breakout or a sharp rotation, 3 only for a genuinely major shift.",
      },
      headline: {
        type: "string",
        description: "One complete sentence ending in a period that names the single most salient movement this window. No em dashes.",
      },
      body: {
        type: "string",
        description:
          "Two to four sentences describing what is new and what is breaking out, grounded in the provided movers, breakouts, and new items. Specific and concrete. No em dashes.",
      },
      concepts: {
        type: "array",
        items: { type: "string" },
        description: "The concept slugs, taken exactly from the Concepts list in the prompt, that this briefing discusses. Use the slug form, not the label.",
      },
      item_refs: {
        type: "array",
        items: { type: "integer" },
        description: "The [n] indices, from the New Items list in the prompt, of the items this briefing draws on.",
      },
    },
    required: ["severity", "headline", "body", "concepts"],
  },
};

// Compose the user prompt from the window's structured state. Concepts are listed
// with their exact slugs so the model cites real, linkable hub targets.
export function buildBriefingPrompt(state) {
  const mover = (e) => `- ${e.label} (${e.kind}, ${e.quadrant}, momentum ${Math.round(e.momentum)}, ratio ${Math.round(e.ratio)})`;
  const outlier = (e) => {
    const tags = [];
    if (e.outlier?.breakout) tags.push("breakout");
    if (e.outlier?.new_entrant) tags.push("new entrant");
    if (e.outlier?.quadrant_jump) tags.push("quadrant jump");
    return `- ${e.label} (${e.kind}${tags.length ? ", " + tags.join(", ") : ""})`;
  };
  const item = (it, i) => {
    const who = it.author_or_channel ? ` (${it.author_or_channel})` : "";
    const sum = it.summary ? `: ${it.summary}` : "";
    const cps = it.concepts?.length ? ` [concepts: ${it.concepts.join(", ")}]` : "";
    return `[${i}] ${it.title}${who}${sum}${cps}`;
  };
  const conceptList = state.concepts.map((c) => `- ${c.slug}: ${c.label}`).join("\n");

  return [
    `Time window: the past ${state.horizonLabel}.`,
    "",
    "Top movers (biggest rotation shifts):",
    state.movers.length ? state.movers.map(mover).join("\n") : "- (none)",
    "",
    "Breaking out (outliers and new entrants):",
    state.outliers.length ? state.outliers.map(outlier).join("\n") : "- (none)",
    "",
    "New items in the window:",
    state.newItems.length ? state.newItems.map(item).join("\n") : "- (none)",
    "",
    "Concepts you may cite (use these exact slugs in the concepts field):",
    conceptList || "- (none)",
    "",
    "Write the briefing for this window. Lead with the single most salient movement, then add the supporting context from the breakouts and new items. Cite the concepts you discuss by slug and reference the New Items by their [n] index.",
  ].join("\n");
}
