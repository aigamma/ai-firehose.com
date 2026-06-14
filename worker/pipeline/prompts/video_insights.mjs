/*
  The transcript-grounded video insights writer: the on-site "study notes" for one
  educator video, so a reader gets the substance without leaving the site or scrubbing
  the whole talk. Unlike the metadata-only video_writeup (title + one-line summary),
  this reads the actual TRANSCRIPT and returns three things:

    - writeup:    a 2 to 4 sentence overview, grounded in what is actually said.
    - key_points: 3 to 6 concrete takeaways a sharp viewer would write down.
    - chapters:   4 to 8 timestamped section markers ({seconds, title}), so the
                  on-site player can deep-link into each part of the talk.

  Same narrator discipline as the briefing and the Watch digest: descriptive not
  prescriptive, declarative, no second person, no em dashes (also sanitized downstream
  in worker/lib/text.mjs). Forced-tool structured output. The transcript is supplied
  with [mm:ss] markers (compactTranscript in transcript.mjs) so the chapter seconds are
  anchored to real positions, never invented. See docs/SOURCES.md and docs/FEATURE_PLAYBOOK.md.
*/

export const VIDEO_INSIGHTS_PROMPT_VERSION = "v1-2026-06-13";

export const VIDEO_INSIGHTS_SYSTEM = [
  "You are writing the on-site study notes for a single video from a favorite AI educator, for a reader who already follows AI closely and wants the substance fast.",
  "You are given the video's transcript, segmented with [mm:ss] time markers. Read it and extract what genuinely matters.",
  "Grounding is absolute: every statement, key point, and chapter must come ONLY from the transcript. Do not invent names, numbers, claims, or sections that are not actually there. If the transcript is thin, noisy, or auto-captioned into nonsense, return fewer key points and chapters rather than padding or guessing.",
  "key_points are the concrete things a smart viewer would write down: the actual argument, the specific tools or numbers or results named, the real conclusion. Not meta-description ('the video discusses X'); the points themselves, stated plainly.",
  "chapters mark the real section boundaries of the talk. Each seconds value must be a time that appears in the transcript markers (use the [mm:ss] you are given), strictly ascending, the first at or near the start. Titles are short, Title Case, and describe that section.",
  "Voice: tight, declarative, factual. No hype, no hedging, no recommendations, never the second person.",
  "Style rules (enforced downstream, but follow them): no em dashes anywhere; use a comma, colon, semicolon, period, parentheses, or the word 'and' instead. En dashes only for numeric ranges.",
].join(" ");

export const VIDEO_INSIGHTS_TOOL = {
  name: "video_insights",
  description: "Return grounded study notes (overview, key points, and timestamped chapters) for one video, from its transcript.",
  input_schema: {
    type: "object",
    properties: {
      writeup: {
        type: "string",
        description:
          "Two to four sentences: what the video covers, why it matters, and the through-line, grounded only in the transcript. Specific and concrete. No em dashes, no second person.",
      },
      key_points: {
        type: "array",
        description:
          "Three to six concrete takeaways from the transcript, each a single substantive sentence or strong fragment. The actual points, named specifics included, not meta-description.",
        items: { type: "string" },
        minItems: 3,
        maxItems: 6,
      },
      chapters: {
        type: "array",
        description:
          "Four to eight section markers in ascending time order, each anchored to a [mm:ss] marker present in the transcript. Omit if the transcript is too short or formless to chapter honestly.",
        items: {
          type: "object",
          properties: {
            seconds: { type: "integer", description: "Start time of the section in whole seconds, taken from a transcript [mm:ss] marker." },
            title: { type: "string", description: "Short Title Case label for the section. No em dashes." },
          },
          required: ["seconds", "title"],
        },
      },
    },
    required: ["writeup", "key_points"],
  },
};

export function buildVideoInsightsPrompt({ title, channel, transcript }) {
  return [
    `Channel: ${channel || "(unknown)"}`,
    `Title: ${title || "(untitled)"}`,
    "",
    "Transcript (segmented with [mm:ss] markers):",
    transcript,
    "",
    "Write the study notes for this video, grounded only in the transcript above.",
  ].join("\n");
}
