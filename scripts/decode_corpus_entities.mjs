/*
  One-time migration: decode HTML/XML character entities in the committed corpus titles.

  The source adapters historically decoded only named entities plus &#39;, so numeric
  (&#8217;) and hex (&#x2F;) refs leaked into stored titles, then into every served artifact
  derived from them (the "Fresh Off the Wire" cards, digests, attention boards). The
  aggregator now decodes at ingest (worker/sources/index.mjs via worker/lib/text.mjs), but
  items already in the corpus keep their raw titles because the pipeline is idempotent and
  will not re-touch unchanged items, so this fixes the existing store in place. The served
  artifacts are then regenerated from the corrected corpus by the next worker run (and the
  gate-checked creators.json/directory.json are regenerated alongside this migration).

  Decodes the verbatim text fields (title, summary_text, author_or_channel) of every item.
  Safe to re-run: decodeEntities is idempotent on already-clean text. Preserves the worker's
  compact serialization so the diff is only the decoded characters, not a reformat.

  Run: node scripts/decode_corpus_entities.mjs [--dry]
*/
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeEntities } from "../worker/lib/text.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = resolve(ROOT, "worker/.cache/items.json");
const FIELDS = ["title", "summary_text", "author_or_channel"];
const dry = process.argv.includes("--dry");

const store = JSON.parse(readFileSync(FILE, "utf8"));
let changed = 0;
let itemsTouched = 0;
const samples = [];
for (const it of Object.values(store)) {
  let touched = false;
  for (const f of FIELDS) {
    if (typeof it[f] === "string") {
      const decoded = decodeEntities(it[f]);
      if (decoded !== it[f]) {
        if (samples.length < 6 && f === "title") samples.push(`  ${it[f]}\n    -> ${decoded}`);
        it[f] = decoded;
        changed += 1;
        touched = true;
      }
    }
  }
  if (touched) itemsTouched += 1;
}

// The worker writes items.json compact (no indentation); match it so the diff is the
// decoded characters only.
if (!dry) writeFileSync(FILE, `${JSON.stringify(store)}\n`);

console.log(`${dry ? "[DRY] would decode" : "decoded"} ${changed} field(s) across ${itemsTouched} of ${Object.keys(store).length} items.`);
if (samples.length) console.log("sample title fixes:\n" + samples.join("\n"));
if (dry) console.log("\nDRY RUN: no file written. Re-run without --dry to apply.");
