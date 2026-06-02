/*
  Text sanitizers for model-generated prose. The house rule (CLAUDE.md Writing
  Rules) forbids em dashes in all generative output. The prompts say so, but models
  disobey routinely, so this is the enforcement: strip em dashes from model text
  before it enters the corpus. En dashes (U+2013, numeric ranges) are allowed and
  left untouched; hyphens are untouched.
*/

// Replace an em dash (U+2014) and any surrounding spaces with a comma, the rule's
// default substitute, then tidy any doubled commas or spaces it produced.
export const stripEmDashes = (s) =>
  typeof s === "string"
    ? s
        .replace(/\s*—\s*/g, ", ")
        .replace(/,\s*,/g, ",")
        .replace(/\s{2,}/g, " ")
        .trim()
    : s;
