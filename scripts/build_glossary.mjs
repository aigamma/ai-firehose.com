import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/*
  Build the DURABLE glossary layer.

  Compiles the hand-authored and Opus-authored entries under content/glossary/ into
  the served glossary artifacts (public/data/glossary/index.json plus one
  c/<slug>.json hub per concept), MERGED non-destructively with the corpus-derived
  concepts already there. Authored entries are marked `durable: true` so the worker's
  retention prune never removes them: they are the permanent learning layer that
  sticks while the rolling-quarter trending corpus decays.

  Idempotent and re-runnable: it preserves any corpus data (attention, rotation,
  neighbors, top_items) on a hub that an authored entry shares a slug with, and only
  overlays the authored definition, body, related mesh, and durable flag. Runs as a
  `prebuild` step and standalone via `npm run glossary`.

  The Markdown body is compiled to BLOCK-level typed nodes (paragraph, heading, list,
  quote, code). Inline markup (emphasis, code, links) and the wiki-style auto-linking
  of glossary terms are applied in the client (src/components/RichText.jsx), which has
  the live glossary index to match against.
*/

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CONTENT = resolve(ROOT, "content/glossary");
const DATA = resolve(ROOT, "public/data/glossary");

const splitList = (v) =>
  String(v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".md") && name.toLowerCase() !== "readme.md") out.push(p);
  }
  return out;
}

// Parse a frontmatter-plus-Markdown entry into a normalized record, or null if it is
// missing the fence or the required title/slug. Tolerant: a bad file is skipped, not
// fatal, because this runs over many independently authored files.
export function parseEntry(raw) {
  const text = String(raw).replace(/^﻿/, "");
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return null;
  const fm = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\s*\n/, "");
  const meta = {};
  for (const line of fm.split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  if (!meta.slug || !meta.title) return null;
  return {
    slug: meta.slug.trim(),
    title: meta.title.trim(),
    kind: (meta.kind || "technique").trim(),
    category: (meta.category || "").trim(),
    aliases: splitList(meta.aliases),
    related: splitList(meta.related),
    summary: (meta.summary || "").trim(),
    body: mdToBlocks(body),
  };
}

// Block-level Markdown to typed blocks. Inline markup is left as raw text for the
// client to parse, so this stays small and robust.
export function mdToBlocks(md) {
  const lines = String(md).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let para = [];
  const flush = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ").trim() });
      para = [];
    }
  };
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === "") {
      flush();
      i += 1;
    } else if (t.startsWith("```")) {
      flush();
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", text: code.join("\n") });
    } else if (/^#{1,6}\s+/.test(t)) {
      flush();
      blocks.push({ type: "h", text: t.replace(/^#{1,6}\s+/, "").trim() });
      i += 1;
    } else if (/^[-*]\s+/.test(t)) {
      flush();
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ul", items });
    } else if (t.startsWith(">")) {
      flush();
      const q = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        q.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: q.join(" ").trim() });
    } else {
      para.push(t);
      i += 1;
    }
  }
  flush();
  return blocks;
}

const readJson = (p, fallback) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
};
const writeJson = (p, obj) => {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
};

export function buildGlossary({ content = CONTENT, data = DATA } = {}) {
  if (!existsSync(content)) {
    console.log("build_glossary: no content/glossary, nothing to do.");
    return { authored: 0, total: 0 };
  }
  const entries = [];
  for (const f of walk(content)) {
    try {
      const e = parseEntry(readFileSync(f, "utf8"));
      if (e) entries.push(e);
      else console.warn(`build_glossary: skipped malformed ${f}`);
    } catch (err) {
      console.warn(`build_glossary: error ${f}: ${err.message}`);
    }
  }

  const index = readJson(resolve(data, "index.json"), { concepts: [] });
  const generated = index.generated || new Date().toISOString().slice(0, 10);
  const byId = new Map((index.concepts || []).map((c) => [c.id, c]));
  const authoredById = new Map(entries.map((e) => [e.slug, e]));
  const labelOf = (slug) => authoredById.get(slug)?.title || byId.get(slug)?.label || null;
  const kindOf = (slug) => authoredById.get(slug)?.kind || byId.get(slug)?.kind || null;

  let written = 0;
  for (const e of entries) {
    const hubPath = resolve(data, "c", `${e.slug}.json`);
    const prior = readJson(hubPath, {});
    const related = e.related.map((slug) => ({ slug, label: labelOf(slug), kind: kindOf(slug) })).filter((r) => r.label);
    writeJson(hubPath, {
      ...prior,
      id: e.slug,
      label: e.title,
      kind: e.kind,
      category: e.category,
      aliases: e.aliases,
      durable: true,
      source: "authored",
      definition: e.summary,
      body: e.body,
      related,
      attention: prior.attention || 0,
      first_seen: prior.first_seen || generated,
      rotation: prior.rotation || null,
      neighbors: prior.neighbors || [],
      top_items: prior.top_items || [],
      axis_positions: prior.axis_positions || [],
    });
    const existing = byId.get(e.slug);
    byId.set(e.slug, {
      id: e.slug,
      label: e.title,
      kind: e.kind,
      attention: existing?.attention || 0,
      aliases: e.aliases,
      def_snippet: e.summary,
      durable: true,
      category: e.category,
    });
    written += 1;
  }

  const concepts = [...byId.values()].sort((a, b) => String(a.label || "").localeCompare(String(b.label || "")));
  writeJson(resolve(data, "index.json"), { generated, count: concepts.length, durable_count: entries.length, concepts });
  console.log(`build_glossary: ${entries.length} authored entries, ${concepts.length} total in index, wrote ${written} hubs.`);
  return { authored: entries.length, total: concepts.length };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  buildGlossary();
}
