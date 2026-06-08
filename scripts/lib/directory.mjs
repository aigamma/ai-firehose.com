/*
  Creators Directory: the pure transform behind public/data/directory.json.

  Turns the ingestion registry (sources/youtube_channels.json) into a browseable,
  subscribe-ready roster, enriched from the committed corpus (worker/.cache/items.json)
  with what each educator covers (concept-hub chips), how active they are, and their
  kind lean. It is the browseable VIEW of the ingestion roster: every active channel
  the worker polls into the three-month RAG also appears here to subscribe to. Distinct
  from the curated Watch spotlight (sources/featured.json -> build_creators.mjs), which
  polls RSS for latest videos and soft-fails.

  Pure and deterministic on purpose (no network, no clock): the same registry plus the
  same committed corpus and glossary index always yield byte-identical output, so the
  build_directory.mjs runner is a HARD prebuild and generated-fresh gate. Unit-tested
  in scripts/lib/directory.test.mjs.
*/
import { slugify } from "../../worker/lib/hash.mjs";

const REAL_KINDS = new Set(["technique", "tool", "opinion"]);
const norm = (s) => String(s || "").trim().toLowerCase();

// The public channel URL, then the one-click subscribe URL (the sub_confirmation
// parameter opens YouTube's subscribe prompt). Mirrors build_creators.mjs:channelUrl.
const channelUrl = (c) =>
  c.handle
    ? `https://www.youtube.com/${c.handle.startsWith("@") ? c.handle : `@${c.handle}`}`
    : `https://www.youtube.com/channel/${c.channel_id}`;

// Index the corpus by channel name (exact, then normalized for case/whitespace), each
// list newest first. Mirrors the join in build_creators.mjs:corpusMaps so the directory
// and the spotlight read the corpus the same way.
function indexByChannel(items) {
  const byName = new Map();
  for (const it of items) {
    if (!it || it.source !== "youtube" || !it.source_id) continue;
    const name = it.author_or_channel || "";
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(it);
  }
  for (const list of byName.values()) {
    list.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  }
  const byNorm = new Map();
  for (const [name, list] of byName) byNorm.set(norm(name), list);
  return { byName, byNorm };
}

// Top concepts this channel covers, by frequency across its corpus items, filtered to
// slugs that resolve to a real glossary hub so every chip is a live /technique/<slug>
// link (the referential-integrity contract; see worker/pipeline/integrity.test.mjs). At
// equal frequency a durable, authored concept outranks a thin corpus tag, so the chips
// lead with the meatier, recognizable concepts (the durable layer is the crown jewel).
function topConcepts(items, glossarySlugs, durableSlugs, max = 6) {
  const counts = new Map(); // slug -> { slug, label, n }
  for (const it of items) {
    for (const raw of it.concepts || []) {
      const slug = slugify(raw);
      if (!slug || !glossarySlugs.has(slug)) continue;
      const cur = counts.get(slug) || { slug, label: String(raw), n: 0 };
      cur.n += 1;
      counts.set(slug, cur);
    }
  }
  const durableRank = (slug) => (durableSlugs.has(slug) ? 0 : 1);
  return [...counts.values()]
    .sort((a, b) => b.n - a.n || durableRank(a.slug) - durableRank(b.slug) || a.label.localeCompare(b.label))
    .slice(0, max)
    .map(({ slug, label }) => ({ slug, label }));
}

// The channel's dominant kind across its corpus items (the classifier's verdict),
// falling back to the registry kind_bias only when it names a real kind ("mixed" is a
// hint, not a kind, so it yields no badge).
function dominantKind(items, kindBias) {
  const counts = new Map();
  for (const it of items) {
    if (REAL_KINDS.has(it.kind)) counts.set(it.kind, (counts.get(it.kind) || 0) + 1);
  }
  if (counts.size) {
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  }
  return REAL_KINDS.has(kindBias) ? kindBias : null;
}

// Build the roster from the registry channels, the corpus items, and the set of
// resolvable glossary slugs. Active, non-hidden channels only; sorted by authority then
// name. A channel with no corpus items yet (just added, not ingested) still renders with
// registry-only fields, so the directory is useful the moment a handle is dropped.
export function buildRoster({ channels = [], items = [], glossarySlugs = new Set(), durableSlugs = new Set() } = {}) {
  const slugs = glossarySlugs instanceof Set ? glossarySlugs : new Set(glossarySlugs);
  const durable = durableSlugs instanceof Set ? durableSlugs : new Set(durableSlugs);
  const { byName, byNorm } = indexByChannel(items);

  const roster = channels
    .filter((c) => c && c.channel_id && c.active !== false && c.hide_from_directory !== true)
    .map((c) => {
      const list = byName.get(c.name) || byNorm.get(norm(c.name)) || [];
      const latest = list[0] || null;
      const url = channelUrl(c);
      return {
        channel_id: c.channel_id,
        name: c.name || "",
        handle: c.handle || "",
        channelUrl: url,
        subscribeUrl: `${url}?sub_confirmation=1`,
        authority_weight: typeof c.authority_weight === "number" ? c.authority_weight : 0.8,
        kind_bias: c.kind_bias || "mixed",
        kindLean: dominantKind(list, c.kind_bias),
        videoCount: list.length,
        latest: latest
          ? {
              videoId: latest.source_id,
              title: latest.title || "",
              published: latest.published_at || null,
              url: latest.url || `https://www.youtube.com/watch?v=${latest.source_id}`,
            }
          : null,
        concepts: topConcepts(list, slugs, durable),
      };
    });

  roster.sort((a, b) => b.authority_weight - a.authority_weight || a.name.localeCompare(b.name));
  return roster;
}

// The deterministic "data current as of" stamp: the newest corpus publish date. Derived
// from committed data (never the wall clock), so the served artifact and a regeneration
// are byte-identical and the hard gate cannot drift by date. "" when the corpus is empty.
export function corpusDate(items = []) {
  let max = "";
  for (const it of items) {
    const d = String(it?.published_at || "").slice(0, 10);
    if (d > max) max = d;
  }
  return max;
}
