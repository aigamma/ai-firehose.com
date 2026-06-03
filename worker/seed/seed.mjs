/*
  Synthetic seed generator.

  Writes plausible, clearly-labeled (synthetic: true) artifacts into public/data
  so the dashboard renders before the live Fly worker exists. Deterministic: a
  fixed PRNG seed means re-running produces identical files, matching the
  project's determinism ethos. Replace with real pipeline output in Phase 1+.

  Run: node worker/seed/seed.mjs
*/
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { quadrantOf } from "../../src/lib/rotation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const DATA = resolve(ROOT, "public/data");
const GENERATED = "2026-06-01";

// Deterministic PRNG (mulberry32) seeded from a string.
function seedFrom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const POOLS = {
  technique: [
    "Mixture of Experts", "Test-Time Compute", "Speculative Decoding", "RLVR",
    "Mamba and SSMs", "FlashAttention", "Low-Rank Adaptation", "Chain of Thought",
    "Retrieval Augmented Generation", "Quantization", "Diffusion Transformers",
    "KV-Cache Compression", "Sparse Attention", "Model Distillation",
  ],
  tool: [
    "vLLM", "llama.cpp", "Ollama", "LangGraph", "Unsloth", "SGLang",
    "Hugging Face Transformers", "ComfyUI", "Triton", "TensorRT-LLM",
    "PyTorch", "JAX", "MLX", "DSPy",
  ],
  opinion: [
    "Open vs Closed Weights", "Is Scaling Over", "Agent Hype Cycle",
    "AGI Timelines", "Safety vs Acceleration", "The Data Wall",
    "Moats in AI", "The Inference Cost Race", "Benchmarks Are Broken",
    "Small Models Win",
  ],
};

const SOURCES = ["youtube", "arxiv", "huggingface", "github", "hackernews", "blog", "reddit"];
const CHANNELS = ["Two Minute Papers", "Yannic Kilcher", "AI Explained", "ML Street Talk", "Sam Witteveen"];

const HORIZONS = ["day", "week", "month", "quarter"];
const KINDS = ["technique", "tool", "opinion"];

mkdirSync(resolve(DATA, "attention"), { recursive: true });
mkdirSync(resolve(DATA, "digests"), { recursive: true });

function buildEntities(kind, horizon) {
  const rng = seedFrom(`${kind}:${horizon}`);
  const names = POOLS[kind];
  return names.map((label, i) => {
    // Center ratio and momentum near 100 with a spread; a few clear leaders.
    const ratio = 100 + (rng() - 0.45) * 18;
    const momentum = 100 + (rng() - 0.45) * 18;
    const attention = Math.round(8 + rng() * 92);
    const sparkline = Array.from({ length: 8 }, () => Math.round(attention * (0.6 + rng() * 0.8)));
    const quadrant = quadrantOf(ratio, momentum);
    const breakout = momentum > 108;
    const newEntrant = rng() > 0.85;
    const quadrantJump = rng() > 0.88;
    return {
      id: `${kind}:${slug(label)}`,
      label,
      attention,
      rs: Math.round(ratio * 10) / 10,
      ratio: Math.round(ratio * 10) / 10,
      momentum: Math.round(momentum * 10) / 10,
      quadrant,
      sparkline,
      outlier: { breakout, new_entrant: newEntrant, quadrant_jump: quadrantJump },
      _rank: i,
    };
  }).sort((a, b) => b.momentum - a.momentum);
}

// Attention per kind per horizon.
for (const kind of KINDS) {
  for (const horizon of HORIZONS) {
    const entities = buildEntities(kind, horizon);
    writeFileSync(
      resolve(DATA, "attention", `${kind}_${horizon}.json`),
      JSON.stringify({ kind, horizon, generated: GENERATED, synthetic: true, entities }, null, 2)
    );
  }
}

// Digests per horizon: new items, top movers, outliers.
for (const horizon of HORIZONS) {
  const rng = seedFrom(`digest:${horizon}`);
  const allEntities = KINDS.flatMap((k) => buildEntities(k, horizon).map((e) => ({ ...e, kind: k })));
  const movers = [...allEntities].sort((a, b) => Math.abs(b.momentum - 100) - Math.abs(a.momentum - 100)).slice(0, 8);
  const outliers = allEntities.filter((e) => e.outlier.breakout || e.outlier.new_entrant).slice(0, 8);
  const newItems = Array.from({ length: 6 }, (_, i) => {
    const kind = KINDS[Math.floor(rng() * KINDS.length)];
    const label = POOLS[kind][Math.floor(rng() * POOLS[kind].length)];
    const source = SOURCES[Math.floor(rng() * SOURCES.length)];
    return {
      kind,
      title: `${label}: a new development`,
      source,
      author_or_channel: source === "youtube" ? CHANNELS[Math.floor(rng() * CHANNELS.length)] : undefined,
      published_at: GENERATED,
      url: "#",
      concepts: [slug(label)],
    };
  });
  writeFileSync(
    resolve(DATA, "digests", `${horizon}.json`),
    JSON.stringify({ horizon, generated: GENERATED, synthetic: true, new_items: newItems, movers, outliers }, null, 2)
  );
}

console.log("Seed written to public/data (synthetic: true). Horizons:", HORIZONS.join(", "));
