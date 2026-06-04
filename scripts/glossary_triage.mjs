// Read-only triage pre-filter for the durable-glossary quality-elevation pass.
// Surfaces the objective signals that predict derivative, dull, or thin prose, so the
// hand-authored rewrite can be prioritized. No dependencies, no writes.
//
//   node scripts/glossary_triage.mjs          summary + the priority worklist
//   node scripts/glossary_triage.mjs --all    every entry, one row each
//
// Signals per entry:
//   words   body word count (frontmatter stripped); under 250 is a thin stub
//   dict    body opens with a copular dictionary lead ("X is a type of ...",
//           "X is the most ...", "X is one of the ..."), a derivative-opening tell.
//           Heuristic and advisory, not a verdict; some strong entries trip it.
//   rel     number of related: cross-links
//   alias   whether aliases: is present

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "content", "glossary");

function parseEntry(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body: m[2].trim() };
}

const DICT = /\b(is|are)\s+(a|an)\s+(type|kind|class|form|method|technique|branch|subfield|family|category|way|process|model|algorithm|framework|approach|measure|function|concept|field|paradigm|architecture|mechanism|variant|metric|notion|property|subset|collection|set|sequence)\b/i;
const DICT2 = /\bis\s+(the\s+most|one\s+of\s+the)\b/i;

function dictLead(body) {
  const para = body.split(/\r?\n\r?\n/)[0].replace(/\s+/g, " ").trim();
  const sentence = para.split(/(?<=[.!?])\s/)[0].slice(0, 110);
  return DICT.test(sentence) || DICT2.test(sentence);
}

function wordCount(body) {
  return (body.replace(/[#*`>_-]/g, " ").match(/[A-Za-z0-9][\w'-]*/g) || []).length;
}

const rows = [];
for (const cat of readdirSync(ROOT, { withFileTypes: true })) {
  if (!cat.isDirectory() || cat.name.startsWith("_")) continue;
  for (const f of readdirSync(join(ROOT, cat.name))) {
    if (!f.endsWith(".md")) continue;
    const e = parseEntry(readFileSync(join(ROOT, cat.name, f), "utf8"));
    if (!e) { console.warn("unparsed:", cat.name + "/" + f); continue; }
    rows.push({
      cat: cat.name,
      slug: f.replace(/\.md$/, ""),
      words: wordCount(e.body),
      dict: dictLead(e.body),
      rel: e.fm.related ? e.fm.related.split(",").filter((s) => s.trim()).length : 0,
      alias: Boolean(e.fm.aliases && e.fm.aliases.trim()),
    });
  }
}

rows.sort((a, b) =>
  (a.cat < b.cat ? -1 : a.cat > b.cat ? 1 : 0) ||
  Number(b.dict) - Number(a.dict) ||
  a.words - b.words
);

const thin = rows.filter((r) => r.words < 250);
const dictRows = rows.filter((r) => r.dict);
const noRel = rows.filter((r) => r.rel === 0);
const noAlias = rows.filter((r) => !r.alias);

console.log(`\nGLOSSARY TRIAGE  (${rows.length} entries)\n`);
console.log(`thin (<250 words):  ${thin.length}`);
console.log(`dictionary lead:    ${dictRows.length}`);
console.log(`no related links:   ${noRel.length}`);
console.log(`no aliases:         ${noAlias.length}`);

console.log(`\nPER CATEGORY  (n | dict-lead | thin)`);
const byCat = {};
for (const r of rows) {
  (byCat[r.cat] ||= { n: 0, dict: 0, thin: 0 });
  byCat[r.cat].n++;
  if (r.dict) byCat[r.cat].dict++;
  if (r.words < 250) byCat[r.cat].thin++;
}
for (const cat of Object.keys(byCat).sort()) {
  const c = byCat[cat];
  console.log(`  ${cat.padEnd(23)} ${String(c.n).padStart(3)} | ${String(c.dict).padStart(3)} | ${String(c.thin).padStart(3)}`);
}

const all = process.argv.includes("--all");
const list = all ? rows : rows.filter((r) => r.dict || r.words < 250);
console.log(`\n${all ? "ALL ENTRIES" : "PRIORITY WORKLIST (dict-lead or thin)"}   [D=dict-lead T=thin]`);
let cur = "";
for (const r of list) {
  if (r.cat !== cur) { console.log(`\n[${r.cat}]`); cur = r.cat; }
  console.log(`  ${r.dict ? "D" : "."}${r.words < 250 ? "T" : "."}  ${String(r.words).padStart(3)}w  rel=${r.rel}  ${r.slug}`);
}
console.log("");
