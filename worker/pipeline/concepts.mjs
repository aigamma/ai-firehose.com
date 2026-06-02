import { slugify } from "../lib/hash.mjs";
import { embed } from "../lib/voyage.mjs";

/*
  Concept resolution: the AI-grown taxonomy. The classifier discovers candidate
  concepts; here near-duplicate surface forms collapse onto one canonical concept.
  The most frequent (then shortest) surface form is the canonical label; the rest
  become aliases.

  Short "AI ___" labels embed very close together, so pure cosine over-merges
  distinct ideas (self-improving AI vs generative AI). The rule therefore is:
  merge on very high cosine (near-identical, for example case variants), OR on
  moderate cosine PLUS a lexical signal (a shared significant token, or one label
  is an acronym of the other, for example LLM and large language models). This
  keeps the true merges while refusing the loose ones.
*/

const STOP = new Set(["ai", "the", "a", "an", "of", "for", "and", "to", "in", "on", "with", "vs", "based", "using", "your", "new"]);
const tokens = (s) =>
  String(s)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t));

function isAcronym(short, long) {
  const s = String(short).replace(/[^a-z]/gi, "").toLowerCase();
  const initials = tokens(long).map((t) => t[0]).join("");
  return s.length >= 2 && s === initials;
}

function lexicalRelated(a, b) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.length || !tb.length) return false;
  const sb = new Set(tb);
  if (ta.some((t) => sb.has(t))) return true; // shared significant token
  return isAcronym(a, b) || isAcronym(b, a);
}

const cosine = (a, b) => {
  let d = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    d += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return d / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

export async function canonicalizeConcepts(items, { high = 0.9, mid = 0.8 } = {}) {
  const freq = new Map();
  for (const it of items) {
    for (const c of it.concepts || []) {
      const key = String(c || "").trim();
      if (key) freq.set(key, (freq.get(key) || 0) + 1);
    }
  }
  const labels = [...freq.keys()];
  if (!labels.length) return { canon: [], remap: (x) => x || [] };

  const vecs = await embed(labels, "document");
  const vecByLabel = new Map(labels.map((l, i) => [l, vecs[i]]));
  const order = [...labels].sort((a, b) => freq.get(b) - freq.get(a) || a.length - b.length);

  const canon = []; // { id, label, vec, aliases: [] }
  const labelToCanon = new Map();
  for (const l of order) {
    const v = vecByLabel.get(l);
    let best = null;
    let bestSim = -1;
    for (const c of canon) {
      const s = cosine(v, c.vec);
      if (s > bestSim) {
        bestSim = s;
        best = c;
      }
    }
    const lexical = best && (lexicalRelated(l, best.label) || best.aliases.some((a) => lexicalRelated(l, a)));
    if (best && (bestSim >= high || (bestSim >= mid && lexical))) {
      best.aliases.push(l);
      labelToCanon.set(l, best);
    } else {
      const c = { id: slugify(l), label: l, vec: v, aliases: [] };
      canon.push(c);
      labelToCanon.set(l, c);
    }
  }

  const remap = (concepts = []) => {
    const out = new Set();
    for (const c of concepts) {
      const cc = labelToCanon.get(String(c || "").trim());
      if (cc) out.add(cc.label);
    }
    return [...out];
  };

  return { canon, remap, high, mid };
}
