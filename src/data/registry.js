/*
  Single source of truth for ai-firehose.com.

  The glossary and source manifests derive navigation, routes, and the sitemap,
  the same pattern as worldthought.com's src/data/pages.js. Structural constants
  (kinds, horizons, quadrants, concept axes, retention) live here so every
  surface reads one definition.
*/

export const SITE = {
  name: "AI Firehose",
  domain: "ai-firehose.com",
  tagline: "The bleeding edge, organized.",
  description:
    "A daily outlier hunt across the AI industry. What is new in the past day, week, month, and quarter, ranked by relative rotation. A personal instrument for staying organized and courageous on the frontier.",
};

// Rolling-quarter retention. Nothing older than this is kept in Pinecone or the
// artifacts: in the fastest-growing industry, stale signal is noise. A quarter
// is about 90 days; the small grace buffer keeps the Quarter view fully
// populated right up to its edge. Tune here, document in docs/INGESTION.md.
export const RETENTION_DAYS = 100;

// The three kinds. Each rotates on its own board; the entity that rotates
// differs per kind. All three share one attention-and-rotation computation.
// Each kind also carries a marker `shape` for the unified rotation plane, where
// color alone cannot separate three kinds for a colorblind reader. The shape is a
// redundant encoding (technique circle, tool triangle, opinion square) drawn only
// on the head marker; tail dots stay circles (shape is illegible at 2.5px).
export const KINDS = [
  { key: "technique", label: "Techniques", singular: "Technique", entity: "concept", route: "/techniques", accentVar: "--kind-technique", badgeClass: "kind-technique", shape: "circle" },
  { key: "tool",      label: "Tools",      singular: "Tool",      entity: "product", route: "/tools",      accentVar: "--kind-tool",      badgeClass: "kind-tool",      shape: "triangle" },
  { key: "opinion",   label: "Opinions",   singular: "Opinion",   entity: "theme",   route: "/opinions",   accentVar: "--kind-opinion",   badgeClass: "kind-opinion",   shape: "square" },
];

// The four time depths. Each is a nested window inside the single retained
// quarter. The EMA window triples drive the relative-rotation math (port of
// aigamma's 63/13 daily and 26/5 weekly, extended to month and quarter).
// These are starting values, calibrated once real data accrues.
export const HORIZONS = [
  { key: "day",     label: "Day",     days: 1,  windows: { smooth: 2, slow: 7,  fast: 3 } },
  { key: "week",    label: "Week",    days: 7,  windows: { smooth: 3, slow: 14, fast: 5 } },
  { key: "month",   label: "Month",   days: 30, windows: { smooth: 5, slow: 26, fast: 8 } },
  { key: "quarter", label: "Quarter", days: 90, windows: { smooth: 8, slow: 63, fast: 13 } },
];

export const DEFAULT_HORIZON = "week";

// Rotation quadrants. ratio > 100 leads the discourse "market"; momentum > 100
// is gaining. See src/lib/rotation.js for quadrantOf().
export const QUADRANTS = {
  leading:   { key: "leading",   label: "Leading",   colorVar: "--q-leading",   badgeClass: "q-leading",   note: "Outperforming and gaining" },
  improving: { key: "improving", label: "Improving", colorVar: "--q-improving", badgeClass: "q-improving", note: "Trailing but gaining" },
  weakening: { key: "weakening", label: "Weakening", colorVar: "--q-weakening", badgeClass: "q-weakening", note: "Outperforming but fading" },
  lagging:   { key: "lagging",   label: "Lagging",   colorVar: "--q-lagging",   badgeClass: "q-lagging",   note: "Trailing and fading" },
};

// Identity palette for the rotation plane's trailing trajectories. The chart
// draws only the top 6 topics, so each trail is colored by IDENTITY (one hue per
// topic, assigned by plotted index) rather than by quadrant, which is easier to
// follow when tracking a single trajectory at low item counts. Chosen to stay
// clearly distinct from the quadrant palette (greens/blues/oranges/reds) and the
// kind accents, and from each other on the dark wash: violet, magenta, gold,
// cyan, lime, coral.
export const TRAIL_PALETTE = [
  "#a78bfa", // violet
  "#f472b6", // magenta
  "#fbbf24", // gold
  "#22d3ee", // cyan
  "#a3e635", // lime
  "#fb7185", // coral
];

// The unified rotation plane (Home) plots all three kinds on one set of axes and
// must prune the boring long tail so the chart stays readable. These knobs are the
// single place to tune that pruning and the label declutter. Per kind: drop new
// entrants (surfaced separately), keep the top `perKind` by attention, then keep
// only the ones that are actually moving (`breakout` or `quadrant_jump`, or a
// ratio/momentum at least `rsMin`/`momMin` off the neutral 100), but never drop a
// kind to zero. Cap the whole plane at `maxTotal`. Label only the breakouts and the
// top `labelPerKind` per kind; the rest carry their name on hover. The single-kind
// chart (RotationChart, on the deep views) keeps its own HEAD_LIMIT and is untouched.
export const ROTATION = {
  perKind: 5,
  maxTotal: 15,
  momMin: 6,
  rsMin: 8,
  labelPerKind: 2,
  labelMinGap: 13, // px, the greedy vertical declutter spacing between head labels
};

// AI-discourse concept axes (v1). Pole anchors (the multi-sentence embedding
// text) live with the worker prompts; here we keep slugs and display titles.
// Editable: add an axis here and author its anchors in worker/pipeline/prompts.
export const AXES = [
  { slug: "open-closed",        title: "Open Weights vs Closed and Proprietary" },
  { slug: "scaling-efficiency", title: "Scaling and More Compute vs Efficiency and Small Models" },
  { slug: "capability-safety",  title: "Capabilities vs Safety and Alignment" },
  { slug: "research-product",   title: "Research and Theory vs Product and Applied" },
  { slug: "agents-assistive",   title: "Autonomy and Agents vs Assistive and Copilot" },
  { slug: "neural-symbolic",    title: "End-to-End Neural vs Structured, Symbolic, and Tool-Use" },
  { slug: "central-local",      title: "Frontier Labs and Centralized vs Local and Community" },
];

// Tags and concepts are an AI-grown taxonomy, not a fixed vocabulary. The
// classifier discovers candidate concepts in each item; the model coins a
// canonical name and a cited definition for genuinely new ones; and every
// candidate is then fitted LOOSELY to the existing taxonomy by embedding
// similarity (voyage-3 cosine), so near-duplicates collapse onto one concept
// with aliases instead of fragmenting. See docs/INGESTION.md (Concept resolution).
export const TAXONOMY = {
  // Injected into the resolver (worker/pipeline/concepts.mjs) each run.
  // Bind a candidate to an existing concept when cosine >= mergeThreshold.
  mergeThreshold: 0.86,
  // In [reviewFloor, mergeThreshold): bind only when a lexical signal agrees
  // (a shared significant token, or one label is an acronym of the other);
  // otherwise treat as distinct. This resolves the ambiguous band automatically.
  reviewFloor: 0.78,
  // Below reviewFloor: the model coins a NEW canonical concept, which currently
  // enters the taxonomy directly. A public/data/glossary/_proposed.json human
  // approval gate is intended but not yet implemented. Thresholds tuned as data accrues.
};

// Top navigation, derived where possible. Adding a kind above adds its nav item.
export const NAV = [
  { label: "Home", route: "/" },
  ...KINDS.map((k) => ({ label: k.label, route: k.route })),
  { label: "Watch", route: "/watch" },
  { label: "Glossary", route: "/glossary" },
  { label: "Explore", route: "/explore" },
  { label: "Methodology", route: "/methodology" },
];

export const getHorizon = (key) => HORIZONS.find((h) => h.key === key) || HORIZONS.find((h) => h.key === DEFAULT_HORIZON);
export const getKind = (key) => KINDS.find((k) => k.key === key);

// Safe quadrant lookup. A malformed artifact row (a missing or unknown
// `quadrant`) must not crash a board, so callers read through this instead of
// indexing QUADRANTS directly. Returns the same shape as a real entry, with a
// neutral fallback color and the raw value (or "unknown") as the label.
export const quadrantOf = (q) =>
  QUADRANTS[q] || { key: q || "unknown", label: q || "unknown", colorVar: "--muted", badgeClass: "", note: "" };
