/*
  Fold corpus-discovered concepts onto the durable glossary.

  The AI-grown taxonomy resolver (worker/pipeline/concepts.mjs) dedupes a newly
  discovered concept only against the CORPUS taxonomy, never against the durable
  authored layer, and build_glossary merges a corpus hub into an authored entry
  only on an EXACT slug match. So a discovered tag like "AI agents" spawns its own
  thin hub instead of collapsing onto the rich authored `ai-agent`, fragmenting both
  the glossary and the trend boards ("LLMs", "LLM", and "large language models" as
  three separate rows). This is the matcher that closes that gap: it maps a corpus
  concept onto a durable concept when their normalized surface forms agree, honoring
  the project's documented rule that near-duplicates collapse onto one concept.

  Precision over recall on purpose: a wrong merge fuses two distinct concepts, which
  is worse than a missed one. So matching is exact on a normalized key (case, spacing,
  punctuation, diacritics) plus a single conservative singular/plural fold, an
  ambiguous surface (claimed by two durable concepts) is never folded, and every
  fold is reported for audit. Pure and unit-tested (scripts/lib/fold.test.mjs).
*/

// Normalize a surface form to a comparison key: lowercase, strip diacritics, and
// collapse every run of non-alphanumeric characters (spaces, hyphens, slashes) to a
// single space. So "Vision-Language Models", "vision language models", and
// "vision_language models" all share a key.
export function normalizeSurface(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// One conservative plural-to-singular fold for matching only (never mutates content):
// "agents" -> "agent", "systems" -> "system", "workflows" -> "workflow",
// "llms" -> "llm", "boxes" -> "box". Leaves "ss" words ("loss", "bias") and short
// tokens alone. Applied to whole normalized keys, so it folds the trailing word.
export function depluralize(key) {
  const k = String(key || "");
  if (k.length < 4) return k;
  if (/(ses|xes|zes|ches|shes)$/.test(k)) return k.slice(0, -2);
  if (/[^s]s$/.test(k)) return k.slice(0, -1);
  return k;
}

const keysFor = (raw) => {
  const k = normalizeSurface(raw);
  if (!k) return [];
  return [...new Set([k, depluralize(k)])];
};

// Build the durable surface dictionary: every normalized surface form (slug-as-words,
// title, and each alias, plus their depluralized variants) mapped to its durable slug.
// A surface claimed by more than one durable concept is recorded as ambiguous and
// dropped from the lookup, so it can never drive an arbitrary fold.
export function buildDurableSurfaceMap(entries) {
  const owners = new Map(); // key -> Set(slug)
  const claim = (raw, slug) => {
    for (const k of keysFor(raw)) {
      if (!owners.has(k)) owners.set(k, new Set());
      owners.get(k).add(slug);
    }
  };
  for (const e of entries) {
    if (!e || !e.slug) continue;
    claim(String(e.slug).replace(/-/g, " "), e.slug);
    claim(e.title, e.slug);
    for (const a of e.aliases || []) claim(a, e.slug);
  }
  const surface = new Map();
  const ambiguous = [];
  for (const [k, slugs] of owners) {
    if (slugs.size === 1) surface.set(k, [...slugs][0]);
    else ambiguous.push({ key: k, slugs: [...slugs].sort() });
  }
  return { surface, ambiguous };
}

// Map each non-durable corpus concept onto a durable slug when their surfaces agree.
// Never folds a concept onto itself, and skips durable concepts (already authored).
export function buildFoldMap(surface, corpusConcepts) {
  const foldMap = {};
  const report = [];
  for (const c of corpusConcepts) {
    if (!c || c.durable || !c.id) continue;
    const keys = new Set();
    for (const raw of [c.label, c.id, String(c.id).replace(/-/g, " ")]) {
      for (const k of keysFor(raw)) keys.add(k);
    }
    let target = null;
    for (const k of keys) {
      if (surface.has(k)) { target = surface.get(k); break; }
    }
    if (target && target !== c.id) {
      foldMap[c.id] = target;
      report.push({ from: c.id, label: c.label || c.id, to: target, attention: c.attention || 0 });
    }
  }
  report.sort((a, b) => (b.attention || 0) - (a.attention || 0));
  return { foldMap, report };
}
