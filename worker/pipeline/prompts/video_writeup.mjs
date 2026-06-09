/*
  The per-video write-up writer (the agentic-summary layer for a video's own page).

  For one educator video it writes a short, substantive explainer, a few sentences richer
  than the classifier's one-line summary: what the video covers, why it matters, and the
  key takeaways, grounded ONLY in the provided title, channel, and summary (transcripts are
  off in production, so do not assume content beyond the summary). Same narrator discipline
  as the briefing and the Watch digest (descriptive not prescriptive, declarative, no second
  person, no em dashes) and the same forced-tool structured output. Prose is sanitized for em
  dashes downstream (worker/lib/text.mjs). See docs/FEATURE_PLAYBOOK.md and docs/RAG.md.
*/

export const VIDEO_WRITEUP_SYSTEM = [
  "You are writing a short explainer for a single video from a favorite AI educator, for a reader who already follows AI closely.",
  "Say what the video covers, why it matters, and the concrete takeaways. Tight, declarative, and factual. No hype, no hedging, no recommendations, and never the second person.",
  "Grounding: use only the provided title, channel, and summary. Transcripts are not available, so do not invent specifics, names, numbers, or claims beyond what the summary supports. If the summary is thin, keep the write-up short rather than padding it.",
  "Style rules (enforced downstream, but follow them): no em dashes anywhere, use a comma, colon, semicolon, period, parentheses, or the word 'and' instead; en dashes only for numeric ranges.",
].join(" ");

export const VIDEO_WRITEUP_TOOL = {
  name: "video_writeup",
  description: "Return a short, grounded explainer for the video.",
  input_schema: {
    type: "object",
    properties: {
      writeup: {
        type: "string",
        description:
          "Two to four sentences: what the video covers, why it matters, and the key takeaways, grounded only in the provided title and summary. Specific and concrete. No em dashes, no second person.",
      },
    },
    required: ["writeup"],
  },
};

export function buildVideoWriteupPrompt(video) {
  const cps = video.concepts?.length ? `\nConcepts: ${video.concepts.join(", ")}` : "";
  return [
    `Channel: ${video.channel}`,
    `Title: ${video.title}`,
    `Summary: ${video.summary || "(none)"}${cps}`,
    "",
    "Write the explainer for this video, grounded only in the above.",
  ].join("\n");
}
