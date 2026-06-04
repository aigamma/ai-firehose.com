/*
  Pure text-to-tokens engine behind RichText.jsx and the wiki-style auto-linking.
  Kept free of React so it can be unit-tested with node --test.

  buildMatcher(concepts) compiles the glossary index (every concept's label and
  aliases) into one boundary-anchored, longest-first regex plus a lookup, so any
  glossary term mentioned in prose can become a link to its hub, Wikipedia-style.

  parseInline(text, opts) tokenizes a run of prose into typed tokens: citation
  markers [n], Markdown links, inline code, bold, italic, and wiki-links for known
  glossary terms. The caller renders the tokens. First occurrence wins: a slug in
  `linked` is not linked again, matching the convention of linking a term once.
*/

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Markdown link hrefs come from MODEL-generated text (briefing body, item
// summaries), so a [x](javascript:...) could otherwise reach the DOM. Allow only
// http(s), mailto, and relative/internal targets; reject everything else so the
// link degrades to plain text. A leading "/" or "#" is internal; a bare relative
// path with no scheme (no "scheme:" prefix before any "/", "?", or "#") is also
// allowed. Anything with a disallowed scheme (javascript:, data:, vbscript:, ...)
// is rejected.
const SAFE_SCHEME = /^(https?|mailto):$/i;
export function isSafeHref(href) {
  const s = String(href || "").trim();
  if (!s) return false;
  if (s[0] === "/" || s[0] === "#") return true; // internal/anchor
  // A scheme is letters/digits/+/-/. then a colon, before any path delimiter.
  const m = s.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!m) return true; // no scheme: a relative path like "docs/x" is safe
  return SAFE_SCHEME.test(`${m[1]}:`);
}

// Compile concepts (the glossary index rows: {id|slug, label, aliases[]}) into a
// matcher. Terms are sorted longest-first so the alternation prefers "large language
// models" over "language". Very short or non-alphabetic terms are dropped to avoid
// noise (a one-letter alias would link half the page).
export function buildMatcher(concepts = []) {
  const map = new Map();
  const add = (surface, slug, label, kind) => {
    const key = String(surface || "").toLowerCase().trim();
    if (key.length < 3 || !/[a-z]/.test(key)) return; // skip 1-2 char or non-alpha noise
    if (!map.has(key)) map.set(key, { slug, label, kind });
  };
  // Pass 1: labels are authoritative. A concept's own name always wins the surface
  // form, even if another concept lists it as an alias (self-attention is its own
  // hub, not a synonym of attention-mechanism).
  for (const c of concepts) {
    const slug = c.id || c.slug;
    if (slug && c.label) add(c.label, slug, c.label, c.kind);
  }
  // Pass 2: aliases fill in only where no label already claimed the surface form.
  for (const c of concepts) {
    const slug = c.id || c.slug;
    if (!slug) continue;
    for (const a of Array.isArray(c.aliases) ? c.aliases : []) add(a, slug, c.label || a, c.kind);
  }
  const terms = [...map.keys()].sort((a, b) => b.length - a.length);
  const re = terms.length ? new RegExp(`\\b(${terms.map(esc).join("|")})\\b`, "gi") : null;
  return { re, map };
}

// Tokenize one run of plain prose into wiki-link and text tokens.
function wikiLink(text, matcher, currentSlug, linked) {
  if (!matcher || !matcher.re) return [{ t: "text", v: text }];
  const out = [];
  let last = 0;
  matcher.re.lastIndex = 0;
  let m;
  while ((m = matcher.re.exec(text))) {
    const surface = m[0];
    const info = matcher.map.get(surface.toLowerCase());
    if (!info || info.slug === currentSlug || linked.has(info.slug)) continue;
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    out.push({ t: "wiki", slug: info.slug, kind: info.kind, v: surface });
    linked.add(info.slug);
    last = m.index + surface.length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out.length ? out : [{ t: "text", v: text }];
}

const TOKEN = /\[(\d+)\]|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;

// Parse inline Markdown plus citations plus wiki-links into tokens. opts:
//   matcher, currentSlug, linked (a Set, mutated across a whole entry), withCitations
export function parseInline(text, { matcher, currentSlug = null, linked = new Set(), withCitations = false } = {}) {
  const src = String(text || "");
  const out = [];
  let last = 0;
  let m;
  TOKEN.lastIndex = 0;
  const pushPlain = (s) => {
    if (s) out.push(...wikiLink(s, matcher, currentSlug, linked));
  };
  while ((m = TOKEN.exec(src))) {
    if (m.index > last) pushPlain(src.slice(last, m.index));
    if (m[1] !== undefined) {
      if (withCitations) out.push({ t: "cite", n: m[1] });
      else pushPlain(m[0]);
    } else if (m[2] !== undefined) {
      // Drop the href for any disallowed scheme (javascript:, data:, ...) so it
      // never reaches the DOM; render the link text as plain prose instead.
      if (isSafeHref(m[3])) out.push({ t: "link", href: m[3], v: m[2] });
      else pushPlain(m[2]);
    } else if (m[4] !== undefined) {
      out.push({ t: "code", v: m[4] });
    } else if (m[5] !== undefined) {
      out.push({ t: "strong", v: m[5] });
    } else if (m[6] !== undefined) {
      out.push({ t: "em", v: m[6] });
    }
    last = m.index + m[0].length;
  }
  if (last < src.length) pushPlain(src.slice(last));
  return out;
}
