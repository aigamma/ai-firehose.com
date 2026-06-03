import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// House rule (CLAUDE.md Writing Rules): em dashes (U+2014) are forbidden in any
// generated text, including JSON artifact content (definitions, cluster names,
// axis labels, coined concept labels). Verbatim source titles (top_items[].title,
// digest new_items[].title) are quotes, not generated, so they are exempt:
// rewriting them would corrupt the citation. This tripwire catches a prompt
// regression that lets em dashes leak into model-authored fields.

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const J = (rel) => JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));
const has = (rel) => existsSync(resolve(DATA, rel));
const EM = "—";

test("no em dash in model-generated artifact fields", () => {
  const offenders = [];
  const flag = (where, s) => { if (s && String(s).includes(EM)) offenders.push(where); };

  for (const f of readdirSync(resolve(DATA, "glossary/c"))) {
    const h = J(`glossary/c/${f}`);
    flag(`definition:${h.id}`, h.definition);
    flag(`label:${h.id}`, h.label);
  }
  for (const c of J("glossary/index.json").concepts) {
    flag(`index.label:${c.id}`, c.label);
    flag(`index.snippet:${c.id}`, c.def_snippet);
  }
  for (const c of J("clusters.json").clusters) flag(`cluster:${c.cluster_id}`, c.label);
  for (const ax of J("spectrums.json").axes) {
    for (const k of ["title", "pole_a", "pole_b"]) flag(`axis:${ax.slug}.${k}`, ax[k]);
  }
  for (const h of ["day", "week", "month", "quarter"]) {
    if (!has(`digests/${h}.json`)) continue;
    const d = J(`digests/${h}.json`);
    for (const e of [...(d.outliers || []), ...(d.movers || [])]) flag(`digest.${h}.label:${e.id}`, e.label);
  }
  // The agentic briefing's headline and body are model-authored prose, sanitized
  // through worker/lib/text.mjs; this is the tripwire if that sanitize regresses.
  // cited_items[].title are verbatim source titles (quotes), so they stay exempt.
  for (const h of ["day", "week", "month", "quarter"]) {
    if (!has(`digests/briefing_${h}.json`)) continue;
    const b = J(`digests/briefing_${h}.json`);
    flag(`briefing.${h}.headline`, b.headline);
    flag(`briefing.${h}.body`, b.body);
  }

  assert.deepEqual(offenders, [], `em dash in generated fields: ${offenders.join(", ")}`);
});
