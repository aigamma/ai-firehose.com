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

// Decode HTML/XML character entities in VERBATIM source text (titles, descriptions,
// channel names). Source feeds encode punctuation as numeric refs (&#8217; -> ’,
// &#8230; -> …), hex refs (HN/Reddit: &#x2F; -> /, &#x27; -> ’), and a few named
// entities, none of which the per-adapter decoders fully covered, so curly quotes and
// escaped slashes leaked into the titles shown on the site. This is the one complete
// decoder, applied once in the source aggregator (worker/sources/index.mjs) so every
// adapter is covered uniformly. Unknown named entities are left intact rather than
// guessed. Verbatim titles are exempt from the no-em-dash rule, so &mdash; decodes
// faithfully to its character (a quote stays a quote); model prose is handled by
// stripEmDashes separately.
// worker/lib is outside the no-em-dash gate's scopes (src, docs, glossary, prompts), and a
// verbatim title that genuinely contains an em dash is exempt anyway, so the literal mdash
// mapping is fine here. Model prose is stripped of em dashes by stripEmDashes, separately.
const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  laquo: "«", raquo: "»", bull: "•", middot: "·",
  trade: "™", copy: "©", reg: "®", deg: "°",
};
export const decodeEntities = (s) =>
  typeof s === "string"
    ? s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, code) => {
        if (code[0] === "#") {
          const cp = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
          return Number.isFinite(cp) && cp >= 1 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
        }
        return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, code) ? NAMED_ENTITIES[code] : m;
      })
    : s;
